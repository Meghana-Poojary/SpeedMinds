// utils.js

import { promises as fs } from 'fs';
import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Converts a local file into a GenerativePart object for the Gemini API.
 * @param {string} filePath - Path to the local file.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {Promise<{inlineData: {data: string, mimeType: string}}>}
 */
export async function fileToGenerativePart(filePath, mimeType) {
    // Read the file buffer
    const fileBuffer = await fs.readFile(filePath);
    return {
        inlineData: {
            // Convert buffer to base64 string
            data: fileBuffer.toString('base64'),
            mimeType,
        },
    };
}

/**
 * Reads a TXT file and returns its content as a string.
 * @param {string} filePath - Path to the TXT file.
 * @returns {Promise<string>}
 */
export async function readTxtFile(filePath) {
    return fs.readFile(filePath, 'utf-8');
}

/**
 * Reads a DOCX file and returns its content as a plain text string.
 * @param {string} filePath - Path to the DOCX file.
 * @returns {Promise<string>}
 */
export async function readDocxFile(filePath) {
    // mammoth converts DOCX to text
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

/**
 * Reads a PDF file and returns its content as a plain text string.
 * @param {string} filePath - Path to the PDF file.
 * @returns {Promise<string>}
 */
export async function readPdfFile(filePath) {
    try {
        const fileBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(fileBuffer);
        return pdfData.text || '';
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error(`Failed to read PDF file: ${error.message}`);
    }
}

/**
 * Splits text into chunks with overlap for RAG purposes.
 * @param {string} text - The text to split.
 * @param {number} chunkSize - Size of each chunk in characters (default: 1000).
 * @param {number} overlap - Overlap between chunks in characters (default: 200).
 * @returns {Array<string>} Array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }

    return chunks;
}