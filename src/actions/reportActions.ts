
'use server';

import { writeFile, readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Basic sanitization: remove path traversal attempts and potentially harmful characters.
// Reusing the logic from upload.ts for consistency.
const sanitizeFilename = (filename: string): string => {
  // Remove directory traversal sequences
  let sanitized = filename.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
  // Remove potentially problematic characters for file systems/URLs (adjust as needed)
  // Allow alphanumeric, underscores, hyphens, and periods. Replace others with underscore.
  sanitized = sanitized.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  // Ensure it ends with .txt
  if (!sanitized.endsWith('.txt')) {
    sanitized = sanitized.replace(/\.[^/.]+$/, "") + '.txt'; // Remove existing extension if any and add .txt
  }
  // Limit filename length
  return sanitized.substring(0, 200);
};

export async function saveReportToServer(
  reportContent: string,
  filename: string
): Promise<{ success: boolean; message: string; filePath?: string }> {

  if (!reportContent) {
    return { success: false, message: 'Report content is empty.' };
  }

  if (!filename) {
    return { success: false, message: 'Filename is required.' };
  }

  const sanitizedFilename = sanitizeFilename(filename);

  if (sanitizedFilename !== filename) {
      console.warn(`Report filename sanitized: "${filename}" -> "${sanitizedFilename}"`);
  }

   if (!sanitizedFilename) {
    return { success: false, message: 'Invalid filename after sanitization.' };
  }

  // Define the path within the 'public' directory
  const relativePath = join('/reportFiles', sanitizedFilename); // Store relative path for URL generation
  const absolutePath = join(process.cwd(), 'public/reportFiles', sanitizedFilename); // Get absolute path for writing

  console.log(`Attempting to save report to server at: ${absolutePath}`);

  try {
    await writeFile(absolutePath, reportContent, 'utf8');
    console.log(`Report saved successfully to server at ${absolutePath}`);
    return { success: true, message: `Report "${sanitizedFilename}" saved successfully to the server.`, filePath: relativePath };
  } catch (error) {
    console.error('Error writing report file to server:', error);
    let errorMessage = 'Failed to save report to server.';
    if (error instanceof Error) {
        errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}

export type ReportStructureItem = {
  name: string;
  type: 'file' | 'folder';
  children?: ReportStructureItem[];
};

export async function listReportFiles(): Promise<{ success: boolean; reportStructure?: ReportStructureItem[]; message: string }> {
  const reportsDirectory = join(process.cwd(), 'public/reportFiles');
  try {
    const files = await readdir(reportsDirectory);
    const txtFiles = files.filter(file => file.endsWith('.txt')).sort();

    const reportStructure: ReportStructureItem[] = [];
    const mayFolder: ReportStructureItem = { name: 'May', type: 'folder', children: [] };
    const otherFiles: ReportStructureItem[] = [];

    txtFiles.forEach(file => {
      if (file.toLowerCase().includes('may')) {
        mayFolder.children?.push({ name: file, type: 'file' });
      } else {
        otherFiles.push({ name: file, type: 'file' });
      }
    });
    
    if (mayFolder.children && mayFolder.children.length > 0) {
      reportStructure.push(mayFolder);
    }
    reportStructure.push(...otherFiles);


    console.log('Report files structured successfully:', reportStructure);
    return { success: true, reportStructure, message: 'Report files structured successfully.' };
  } catch (error) {
    console.error('Error listing report files:', error);
    let errorMessage = 'Failed to list report files.';
    if (error instanceof Error) {
        errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}

export async function getReportFileContent(filename: string): Promise<{ success: boolean; content?: string; message: string }> {
  if (!filename) {
    return { success: false, message: 'Filename is required.' };
  }
  // Sanitize filename to prevent path traversal, although join should also help
  const sanitizedFilename = filename.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
  if (sanitizedFilename !== filename) {
      console.warn(`Filename was sanitized for reading: "${filename}" -> "${sanitizedFilename}"`);
  }
  if (!sanitizedFilename.endsWith('.txt')) {
      return { success: false, message: 'Invalid file type. Only .txt files are allowed.' };
  }


  const filePath = join(process.cwd(), 'public/reportFiles', sanitizedFilename);
  console.log(`Attempting to read report file from: ${filePath}`);
  try {
    const content = await readFile(filePath, 'utf8');
    console.log(`Report file "${sanitizedFilename}" read successfully.`);
    return { success: true, content, message: 'Report file content fetched successfully.' };
  } catch (error) {
    console.error(`Error reading report file "${sanitizedFilename}":`, error);
    let errorMessage = `Failed to read report file "${sanitizedFilename}".`;
     if (error instanceof Error) {
        errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}
