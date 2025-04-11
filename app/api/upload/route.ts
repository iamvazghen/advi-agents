// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import pdfParse from 'pdf-parse';
import { estimateTokenCount } from '@/lib/tokenManagement';

// Maximum token limit for file content (approximately 200,000 tokens)
const MAX_TOKEN_LIMIT = 200000;

// Export the POST handler directly (not as default)
export async function POST(request: NextRequest) {
  console.log("API route hit: /api/upload");
  
  try {
    // Log request headers for debugging
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const formData = await request.formData();
    console.log("Form data received");
    
    // Log form data keys for debugging
    console.log("Form data keys:", [...formData.keys()]);
    
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log("No file provided");
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log("Processing file:", file.name, file.type, file.size);

    // Define allowed file types
    const allowedTypes = [
      "application/pdf",                 // PDF
      "text/plain",                      // TXT
      "application/msword",              // DOC
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/vnd.ms-excel",        // XLS
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
      "application/vnd.ms-powerpoint",   // PPT
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
      "text/csv",                        // CSV
      "application/json",                // JSON
      "text/markdown",                   // MD
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.log("Unsupported file type:", file.type);
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Supported types: PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX, CSV, JSON, MD' },
        { status: 400 }
      );
    }

    let content = '';
    // Define a more comprehensive metadata type
    let metadata: {
      title: string;
      creationDate: string;
      pageCount?: number;
      author?: string;
      subject?: string;
      keywords?: string;
      creator?: string;
      producer?: string;
      modificationDate?: string;
      version?: string;
      truncated?: boolean;
      originalTokenCount?: number;
    } = {
      title: file.name,
      creationDate: new Date().toISOString(),
    };

    // Convert file to ArrayBuffer for processing
    const arrayBuffer = await file.arrayBuffer();
    console.log("File converted to ArrayBuffer");

    // Process file based on type
    try {
      console.log("Extracting content from file type:", file.type);
      
      // Text-based files that we can extract content from directly
      if (
        file.type === 'text/plain' ||
        file.type === 'text/csv' ||
        file.type === 'application/json' ||
        file.type === 'text/markdown'
      ) {
        content = await file.text();
        console.log("Text extracted from text-based file");
      }
      // PDF files
      else if (file.type === 'application/pdf') {
        console.log("Extracting text from PDF");
        content = await extractPdfText(arrayBuffer, metadata);
      }
      // Word documents (DOCX)
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log("Extracting text from DOCX");
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      }
      // Word documents (DOC) - older format
      else if (file.type === 'application/msword') {
        console.log("Extracting text from DOC");
        // For DOC files, we'll use a simpler approach since mammoth doesn't handle DOC well
        content = await extractTextFromBinary(arrayBuffer, 'DOC');
      }
      // Excel files (XLSX)
      else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        console.log("Extracting text from XLSX");
        content = await extractExcelText(arrayBuffer);
      }
      // Excel files (XLS) - older format
      else if (file.type === 'application/vnd.ms-excel') {
        console.log("Extracting text from XLS");
        content = await extractExcelText(arrayBuffer);
      }
      // PowerPoint files (PPTX)
      else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        console.log("Extracting text from PPTX");
        content = await extractPptxText(arrayBuffer, metadata);
      }
      // PowerPoint files (PPT) - older format
      else if (file.type === 'application/vnd.ms-powerpoint') {
        console.log("Extracting text from PPT");
        content = await extractTextFromBinary(arrayBuffer, 'PPT');
      }
      
      // Trim and clean the extracted content
      content = content.trim();
      console.log(`Content extracted successfully: ${content.slice(0, 100)}...`);
      
      // If we couldn't extract any content, provide a fallback message
      if (!content) {
        console.log("No content extracted");
        content = `Unable to extract text content from ${file.name}. This file may be empty, password-protected, or contain only non-text elements.`;
      }
      
      // Check token count and limit if necessary
      const tokenCount = estimateTokenCount(content);
      console.log(`Estimated token count for ${file.name}: ${tokenCount}`);
      
      if (tokenCount > MAX_TOKEN_LIMIT) {
        console.log(`File exceeds token limit (${tokenCount} > ${MAX_TOKEN_LIMIT}), truncating content`);
        
        // Calculate how many characters to keep (approximate 4 chars per token)
        const charsToKeep = MAX_TOKEN_LIMIT * 4;
        content = content.substring(0, charsToKeep);
        content += `\n\n[Content truncated due to token limit. Original content had approximately ${tokenCount} tokens, limit is ${MAX_TOKEN_LIMIT}]`;
        
        // Update metadata to indicate truncation
        metadata.truncated = true;
        metadata.originalTokenCount = tokenCount;
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      content = `Unable to extract content from ${file.name}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    console.log("Sending successful response");
    return NextResponse.json({
      success: true,
      content,
      metadata
    });
  } catch (error) {
    console.error('Error processing file:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        errorType: error instanceof Error ? error.name : 'Unknown',
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper function to extract text from PDF using pdf-parse
async function extractPdfText(arrayBuffer: ArrayBuffer, metadata: any): Promise<string> {
  try {
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    
    // Store metadata
    metadata.pageCount = data.numpages;
    if (data.info) {
      metadata.author = data.info.Author;
      metadata.creator = data.info.Creator;
      metadata.producer = data.info.Producer;
      metadata.creationDate = data.info.CreationDate;
      metadata.modificationDate = data.info.ModDate;
    }
    
    return data.text || "No text content found in PDF.";
  } catch (error) {
    console.error('PDF extraction error:', error);
    return `Error extracting text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Helper function to extract text from Excel files
async function extractExcelText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let text = '';
    
    // Go through each sheet
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      text += `Sheet: ${sheetName}\n`;
      
      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Format each row
      for (const row of jsonData) {
        if (Array.isArray(row) && row.length > 0) {
          text += row.join('\t') + '\n';
        }
      }
      
      text += '\n';
    }
    
    return text;
  } catch (error) {
    console.error('Excel extraction error:', error);
    throw error;
  }
}

// Helper function to extract text from PPTX files
async function extractPptxText(
  arrayBuffer: ArrayBuffer, 
  metadataObj: { 
    pageCount?: number; 
    [key: string]: any 
  }
): Promise<string> {
  try {
    // PPTX files are essentially ZIP files containing XML documents
    const zip = new JSZip();
    const contents = await zip.loadAsync(arrayBuffer);
    
    let text = '';
    let slideCount = 0;
    
    // Extract text from slide content
    const slideFiles = Object.keys(contents.files).filter(name => 
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    );
    
    // Sort the slides by their number
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
      return numA - numB;
    });
    
    for (const slideFile of slideFiles) {
      slideCount++;
      const slideContent = await contents.files[slideFile].async('text');
      
      // Extract text from XML
      const textMatches = slideContent.match(/<a:t>([^<]*)<\/a:t>/g);
      if (textMatches) {
        text += `Slide ${slideCount}:\n`;
        
        for (const match of textMatches) {
          const textContent = match.replace(/<a:t>|<\/a:t>/g, '').trim();
          if (textContent) {
            text += textContent + '\n';
          }
        }
        
        text += '\n';
      }
    }
    
    // Add metadata about slide count
    metadataObj.pageCount = slideCount;
    
    return text;
  } catch (error) {
    console.error('PPTX extraction error:', error);
    return `Unable to extract text from PPTX file. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Helper function for older binary formats (DOC, PPT)
async function extractTextFromBinary(arrayBuffer: ArrayBuffer, fileType: string): Promise<string> {
  // This is a simple text extraction from binary files
  // For production use, you might want to use more specialized libraries
  const buffer = Buffer.from(arrayBuffer);
  
  // Convert to string and try to extract readable text
  const textDecoder = new TextDecoder('utf-8');
  let rawText = textDecoder.decode(buffer);
  
  // Basic cleaning to extract readable parts
  let cleanedText = '';
  let inTextBlock = false;
  
  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];
    
    // Only keep printable ASCII characters and some common punctuation
    if (
      (char >= ' ' && char <= '~') || 
      char === '\n' || 
      char === '\r' || 
      char === '\t'
    ) {
      if (!inTextBlock && /[a-zA-Z0-9]/.test(char)) {
        inTextBlock = true;
      }
      
      if (inTextBlock) {
        cleanedText += char;
      }
    } else if (inTextBlock && cleanedText[cleanedText.length - 1] !== ' ') {
      cleanedText += ' ';
      
      // Check if we've had a significant non-text section
      if (i > 0 && !/[a-zA-Z0-9]/.test(rawText.substring(i, Math.min(i + 30, rawText.length)))) {
        inTextBlock = false;
        cleanedText += '\n';
      }
    }
  }
  
  // Clean up the extracted text
  cleanedText = cleanedText
    .replace(/\s+/g, ' ')
    .replace(/(\n\s*){3,}/g, '\n\n')
    .trim();
  
  return cleanedText || `This ${fileType} file's content could not be extracted. It may be in a format that requires specialized software.`;
}