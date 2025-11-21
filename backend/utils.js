// utils.js

import { promises as fs } from 'fs';
import mammoth from 'mammoth';

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