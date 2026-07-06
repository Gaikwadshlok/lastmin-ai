import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

/**
 * Extract text content from various file types
 * @param {string} filePath - Path to the file
 * @param {string} fileType - Type of file (pdf, docx, txt, etc.)
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromFile(filePath, fileType) {
  try {
    console.log(`[TextExtraction] 📄 Processing ${fileType} file: ${path.basename(filePath)}`);

    switch (fileType) {
      case 'pdf':
        return await extractTextFromPDF(filePath);
      
      case 'docx':
        return await extractTextFromDOCX(filePath);
      
      case 'txt':
        return await extractTextFromTXT(filePath);
      
      default:
        console.log(`[TextExtraction] ⚠️ Unsupported file type: ${fileType}`);
        return '';
    }
  } catch (error) {
    console.error(`[TextExtraction] ❌ Error extracting text from ${fileType}:`, error.message);
    return '';
  }
}

/**
 * Extract text from PDF files using pdf-parse
 */
async function extractTextFromPDF(filePath) {
  try {
    // Dynamic import to avoid the test file issue
    const pdfParse = (await import('pdf-parse')).default;
    
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    const extractedText = pdfData.text.trim();
    console.log(`[TextExtraction] ✅ PDF processed - ${extractedText.length} characters extracted`);
    
    if (extractedText.length === 0) {
      console.log(`[TextExtraction] ⚠️ PDF appears to be image-based or encrypted`);
      return '';
    }
    
    return extractedText;
  } catch (error) {
    console.error(`[TextExtraction] ❌ PDF extraction failed:`, error.message);
    throw error;
  }
}

/**
 * Extract text from DOCX files using mammoth
 */
async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const extractedText = result.value.trim();
    
    console.log(`[TextExtraction] ✅ DOCX processed - ${extractedText.length} characters extracted`);
    
    if (result.messages && result.messages.length > 0) {
      console.log(`[TextExtraction] ℹ️ DOCX processing messages:`, result.messages);
    }
    
    return extractedText;
  } catch (error) {
    console.error(`[TextExtraction] ❌ DOCX extraction failed:`, error.message);
    throw error;
  }
}

/**
 * Extract text from plain text files
 */
async function extractTextFromTXT(filePath) {
  try {
    const extractedText = fs.readFileSync(filePath, 'utf8').trim();
    console.log(`[TextExtraction] ✅ TXT processed - ${extractedText.length} characters extracted`);
    return extractedText;
  } catch (error) {
    console.error(`[TextExtraction] ❌ TXT extraction failed:`, error.message);
    throw error;
  }
}

/**
 * Validate and clean extracted text
 */
export function validateExtractedText(text) {
  if (!text || typeof text !== 'string') {
    return { isValid: false, cleanText: '' };
  }
  
  const cleanText = text.trim();
  
  // Check if text is meaningful (not just whitespace/special characters)
  const meaningfulText = cleanText.replace(/[\s\n\r\t]/g, '');
  if (meaningfulText.length < 10) {
    return { isValid: false, cleanText: '' };
  }
  
  return { isValid: true, cleanText };
}