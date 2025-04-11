// utils/fileExtraction.ts
import { toast } from "@/components/ui/use-toast";

interface FileUploadResult {
  success: boolean;
  content?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
    pageCount?: number;
    version?: string;
  };
  error?: string;
}

/**
 * Uploads a file and extracts text content from it
 * @param file The file to upload and process
 * @returns FileUploadResult containing success status, content, metadata, and/or error
 */
export async function uploadAndExtractFile(file: File): Promise<FileUploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data: FileUploadResult = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to process file");
    }

    return data;
  } catch (error) {
    console.error("File extraction error:", error);
    
    // Show error toast
    toast({
      title: "File Processing Failed",
      description: error instanceof Error ? error.message : "Failed to process file",
      variant: "destructive",
      duration: 5000,
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process file",
      content: `Failed to extract content from ${file.name}. Error: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

/**
 * Gets a file icon based on file type
 * @param fileType MIME type of the file
 * @returns CSS class for the appropriate icon
 */
export function getFileIcon(fileType: string): string {
  const fileTypeMap: Record<string, string> = {
    'application/pdf': 'file-pdf',
    'text/plain': 'file-text',
    'application/msword': 'file-word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
    'application/vnd.ms-excel': 'file-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel',
    'application/vnd.ms-powerpoint': 'file-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file-powerpoint',
    'text/csv': 'file-spreadsheet',
    'application/json': 'file-code',
    'text/markdown': 'file-text'
  };
  
  return fileTypeMap[fileType] || 'file';
}

/**
 * Format file size in a human-readable way
 * @param bytes File size in bytes
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
}