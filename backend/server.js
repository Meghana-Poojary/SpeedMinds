// index.js

// --- Import Statements ---
import 'dotenv/config'; // Modern way to load environment variables with import
import express from 'express';
import multer from 'multer';
import { promises as fs } from 'fs'; // Import promises API from 'fs'
import MistralClient from '@mistralai/mistralai';
import { 
    fileToGenerativePart, 
    readTxtFile, 
    readDocxFile,
    readPdfFile,
    splitTextIntoChunks
} from './utils.js'; // MUST include file extension (.js) for local imports
import { ChromaClient } from 'chromadb';
import cors from 'cors';
import path from 'path';
import PDFDocument from 'pdfkit';

// --- Initialization ---
const app = express();
const port = process.env.PORT

// Middleware
app.use(express.json());
app.use(cors());

// Access environment variables using process.env
const client = new MistralClient(process.env.MISTRAL_API_KEY);
const model = 'mistral-large-latest';

// Initialize Chroma client in ephemeral mode
const chromaClient = new ChromaClient();

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

/**
 * System prompt for the analysis task.
 * Mistral will use this to guide the response format.
 */
const analysisSystemPrompt = `You are a document analysis expert. Analyze documents and provide responses in the following JSON format:
{
  "summary": "A concise executive summary of the document (3-5 sentences)",
  "topics": [
    {
      "topic": "Main subject or key concept",
      "explanation": "Detailed explanation of the topic with formulas and technical terms included"
    }
  ]
}
Ensure all topics are covered and responses are in valid JSON format.`;

// --- API Route ---
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }

    const filePath = file.path;
    const mimeType = file.mimetype;
    let contents = [];

    try {
        // 1. Process the file based on its MIME type
        if (mimeType.includes('application/pdf')) {
            const pdfPart = await fileToGenerativePart(filePath, mimeType);
            contents.push(pdfPart);
        } else if (mimeType.includes('text/plain')) {
            const textContent = await readTxtFile(filePath);
            contents.push({ text: textContent });
        } else if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            const textContent = await readDocxFile(filePath);
            contents.push({ text: textContent });
        } else {
            return res.status(400).send({ error: `Unsupported file type: ${mimeType}` });
        }

        // Add the prompt instruction
        const prompt = 'Analyze the content of the provided document. Generate a concise, executive summary (3-5 sentences) and extract a list of 5 to 10 key topics or keywords. Return the result in the following JSON format: {"summary": "...", "topics": [{"topic": "...", "explanation": "..."}]}';
        contents.push({ text: prompt });

        // Combine all text content into a single message
        let fullContent = '';
        for (const content of contents) {
            if (content.text) {
                fullContent += content.text + '\n\n';
            }
        }

        // 2. Call the Mistral API
        const response = await client.chat({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: analysisSystemPrompt
                },
                {
                    role: 'user',
                    content: fullContent
                }
            ]
        });

        // 3. Parse and send the result
        let rawContent = response.choices[0].message.content;

        // Strip markdown code fences if present
        rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

        const structuredResult = JSON.parse(rawContent);
        res.json({
          ...structuredResult,
          documentName: file.originalname,
        });

    } catch (error) {
        console.error('Mistral API or File Processing Error:', error);
        res.status(500).send({ error: 'Failed to process document using Mistral API.' });
    } finally {
        // Clean up the uploaded file
        try {
            await fs.unlink(filePath);
        } catch (e) {
            console.error('Failed to delete uploaded file:', e);
        }
    }
});

// ... (rest of imports and initialization)

// --- API Route for Q&A with RAG ---
app.post('/api/ask-document', upload.single('file'), async (req, res) => {
    const file = req.file;
    const userQuestion = req.body.question;

    if (!file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }
    if (!userQuestion || userQuestion.trim() === "") {
        return res.status(400).send({ error: 'No question provided.' });
    }

    const filePath = file.path;
    const mimeType = file.mimetype;
    let fullText = '';

    try {
        // 1. Extract text from the file based on its MIME type
        if (mimeType.includes('application/pdf')) {
            // For PDF, extract text using the utility function
            fullText = await readPdfFile(filePath);
        } else if (mimeType.includes('text/plain')) {
            fullText = await readTxtFile(filePath);
        } else if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            fullText = await readDocxFile(filePath);
        } else {
            return res.status(400).send({ error: `Unsupported file type: ${mimeType}` });
        }

                // 2. Split the text into chunks
        const chunks = splitTextIntoChunks(fullText, 1000, 200);

        // 3. Simple keyword-based retrieval (no vector DB needed)
        const questionWords = userQuestion.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 3); // ignore short words

        const scoredChunks = chunks.map(chunk => {
            const lowerChunk = chunk.toLowerCase();
            const score = questionWords.reduce((acc, word) => {
                return acc + (lowerChunk.includes(word) ? 1 : 0);
            }, 0);
            return { chunk, score };
        });

        // Sort by relevance score, take top 3
        const relevantChunks = scoredChunks
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.chunk);

        const relevantContext = relevantChunks.join('\n\n---\n\n');
        // 7. Create a prompt with the retrieved context
        const ragPrompt = `Based ONLY on the following context from the document, answer the user's question clearly and concisely. If the context does not contain information needed to answer the question, state that the information is not available in the document.
        Context from document:
        ${relevantContext}
        User Question: "${userQuestion}"`;

        // 8. Call the Mistral API with the RAG-enhanced prompt
        const response = await client.chat({
            model: model,
            messages: [
                {
                    role: 'user',
                    content: ragPrompt
                }
            ]
        });

        const aiAnswer = response.choices[0].message.content;

        // 9. Clean up: Delete the collection after use (optional - uncomment if you want ephemeral collections)
        // await chromaClient.deleteCollection({ name: collectionName });

        // 10. Send the result back
        res.json({
            question: userQuestion,
            answer: aiAnswer,
            documentName: file.originalname,
            relevantChunks: relevantChunks, // Include the retrieved chunks in the response
        });

    } catch (error) {
        console.error('RAG Processing Error:', error);
        res.status(500).send({ 
            error: 'Failed to answer question using RAG and Mistral API.',
            details: error.message || 'An internal server error occurred.'
        });
    } finally {
        // Clean up the uploaded file
        try {
            await fs.unlink(filePath);
        } catch (e) {
            console.error('Failed to delete uploaded file:', e);
        }
    }
});

app.post('/api/download-report', (req, res) => {
    const { summary, topics, documentName, qaHistory } = req.body;

    if (!documentName || !summary || !topics) {
        return res.status(400).json({ error: 'Missing required report data.' });
    }

    // Configure response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${documentName.replace(/\.[^/.]+$/, '')}-analysis-report.pdf"`);

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 57 });

    // Pipe the PDF document directly to the response stream
    doc.pipe(res);

    // --- Document Title ---
    doc.fontSize(20).text('SpeedMinds', { align: 'center', bold: true });
    doc.moveDown();
    doc.fontSize(14).text(`Document Name: ${documentName}`, { align: 'center' });
    doc.moveDown(2);

    // --- 1. Summary Section ---
    doc.fontSize(16).fillColor('black').text('1.Summary', { underline: true, bold: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('black').text(summary, {
        align: 'justify',
        indent: 10
    });
    doc.moveDown(2);

    // --- 2. Key Topics Section ---
    doc.fontSize(16).fillColor('black').text('2. Identified Key Topics', { underline: true, bold: true });
    doc.moveDown(0.5);

    topics.forEach((t, index) => {
        doc.fontSize(12).fillColor('black').text(`${index + 1}. ${t.topic}`, { bold: true });
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor('black').text(t.explanation, {
            indent: 10,
            align: 'justify'
        });
        doc.moveDown(1);
    });

    doc.moveDown(2);

    // --- 3. Q&A History Section ---
    doc.fontSize(16).fillColor('black').text('3. Interactive Q&A History', { underline: true, bold: true });
    doc.moveDown(1);

    if (qaHistory.length === 0) {
        doc.fontSize(11).fillColor('black').text('No questions were asked during the session.', { indent: 10 });
    } else {
        qaHistory.forEach((qa, index) => {
            // Check for page overflow before starting a new Q&A item
            if (index > 0 && doc.y > 650) {
                doc.addPage();
            }

            // Question
            doc.fontSize(12).fillColor('black').text(`Q${index + 1}: ${qa.question}`, { 
                indent: 10, 
                ellipsis: true,
                bold: true,
            });
            doc.moveDown(0.2);

            // Answer
            doc.fontSize(11).fillColor('black').text(`A${index + 1}: ${qa.answer}`, { 
                indent: 10, 
                align: 'justify' 
            });
            doc.moveDown(1);
        });
    }

    // --- Finalize and send the document ---
    doc.end();
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});