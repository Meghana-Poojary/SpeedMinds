// index.js

// --- Import Statements ---
import 'dotenv/config'; // Modern way to load environment variables with import
import express from 'express';
import multer from 'multer';
import { promises as fs } from 'fs'; // Import promises API from 'fs'
import { GoogleGenAI, Type } from '@google/genai';
import { 
    fileToGenerativePart, 
    readTxtFile, 
    readDocxFile 
} from './utils.js'; // MUST include file extension (.js) for local imports
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
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }); 
const model = 'gemini-2.5-flash';

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

/**
 * Defines the structured output format (JSON Schema) for the Gemini response.
 */
const summarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A concise executive summary of the document, 3-5 sentences long.',
    },
    // The 'topics' field is now an array of OBJECTS
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT, // Each item in the array is an object
        properties: {
          topic: {
            type: Type.STRING,
            description: 'The main subject or key concept discussed.',
          },
          explanation: {
            type: Type.STRING,
            description: 'A detailed explanation of the topic, summarizing the relevant sections of the document. If any formulas, equations, or technical terms are present, include them directly in the text for deep understanding.',
          },
        },
        required: ['topic', 'explanation'], // Each topic object must have both fields
      },
      description: 'A list of all the topics discussed in the document, each with a deep explanation, ensuring no significant topic is omitted.',
    },
  },
  required: ['summary', 'topics'],
};

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
        const prompt = 'Analyze the content of the provided document. Generate a concise, executive summary (3-5 sentences) and extract a list of 5 to 10 key topics or keywords. Return the result in the specified JSON format.';
        contents.push({ text: prompt });

        // 2. Call the Gemini API with structured output
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseMimeType: 'application/json',
                responseSchema: summarySchema,
            },
        });

        // 3. Parse and send the result
        const structuredResult = JSON.parse(response.text);
        res.json({
          ...structuredResult,
          documentName: file.originalname,
        });

    } catch (error) {
        console.error('Gemini API or File Processing Error:', error);
        res.status(500).send({ error: 'Failed to process document using Gemini API.' });
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

// --- API Route for Q&A ---
app.post('/api/ask-document', upload.single('file'), async (req, res) => {
    const file = req.file;
    const userQuestion = req.body.question; // Assuming the question comes in the request body

    if (!file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }
    if (!userQuestion || userQuestion.trim() === "") {
        return res.status(400).send({ error: 'No question provided.' });
    }

    const filePath = file.path;
    const mimeType = file.mimetype;
    let contents = [];

    try {
        // 1. Process the file to get content (Same logic as /api/analyze)
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

        // 2. Add the specific Q&A Prompt and User Question
        const qaPrompt = `Based ONLY on the content of the provided document, answer the following question clearly and concisely. If the document does not contain the information needed to answer the question, state that the information is not available in the document.

        User Question: "${userQuestion}"`;
        
        contents.push({ text: qaPrompt });

        // 3. Call the Gemini API 
        // We use a simple model call without structured output, expecting a plain text answer.
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            // No responseSchema config is needed here
        });
        
        // Extract the plain text answer
        const aiAnswer = response.text;

        // 4. Send the result back
        res.json({
            question: userQuestion,
            answer: aiAnswer,
            documentName: file.originalname,
        });

    } catch (error) {
        console.error('Q&A Processing Error:', error);
        res.status(500).send({ 
            error: 'Failed to answer question using Gemini API.',
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