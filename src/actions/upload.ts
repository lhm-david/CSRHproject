
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Icons } from '@/components/icons'; // Assuming icons might be used in future messages

// Basic sanitization: remove path traversal attempts and potentially harmful characters.
// For production, consider a more robust library or approach.
const sanitizeFilename = (filename: string): string => {
  // Remove directory traversal sequences
  let sanitized = filename.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
  // Remove potentially problematic characters for file systems/URLs (adjust as needed)
  sanitized = sanitized.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  // Limit filename length
  return sanitized.substring(0, 200);
};


export async function uploadFileAction(formData: FormData): Promise<{ success: boolean; message: string; filePath?: string }> {
  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, message: 'No file provided.' };
  }

  // Basic validation (add more as needed, e.g., file size, type)
  if (file.size === 0) {
      return { success: false, message: 'File is empty.' };
  }

  // Sanitize the filename
  const originalFilename = file.name;
  const sanitizedFilename = sanitizeFilename(originalFilename);

  if (sanitizedFilename !== originalFilename) {
      console.warn(`Filename sanitized: "${originalFilename}" -> "${sanitizedFilename}"`);
  }

  if (!sanitizedFilename) {
    return { success: false, message: 'Invalid filename after sanitization.' };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Define the path within the 'public' directory
  const relativePath = join('/', sanitizedFilename); // Store relative path for URL generation
  const absolutePath = join(process.cwd(), 'public', sanitizedFilename); // Get absolute path for writing

  console.log(`Attempting to write file to: ${absolutePath}`);

  try {
    await writeFile(absolutePath, buffer);
    console.log(`File saved successfully to ${absolutePath}`);
    return { success: true, message: `File "${sanitizedFilename}" uploaded successfully.`, filePath: relativePath };
  } catch (error) {
    console.error('Error writing file:', error);
    // Provide a more specific error message if possible
    let errorMessage = 'Failed to save file.';
    if (error instanceof Error) {
        // Check for specific error codes if needed (e.g., EACCES for permissions)
        errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}
