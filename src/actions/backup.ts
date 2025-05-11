
'use server';

import { writeFile, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { format } from 'date-fns';

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
    const monthFolders: { [key: string]: ReportStructureItem } = {};
    
    const currentYear = new Date().getFullYear().toString();

    // Dynamically create month folders for the current year
    for (let i = 0; i < 12; i++) {
      const monthName = format(new Date(Number(currentYear), i), 'MMMM');
      monthFolders[monthName.toLowerCase()] = { name: monthName, type: 'folder', children: [] };
    }
    
    const otherFiles: ReportStructureItem[] = [];

    txtFiles.forEach(file => {
      let matchedMonth = false;
      for (const monthKey in monthFolders) {
        if (file.toLowerCase().includes(monthKey)) {
          monthFolders[monthKey].children?.push({ name: file, type: 'file' });
          matchedMonth = true;
          break;
        }
      }
      if (!matchedMonth) {
        otherFiles.push({ name: file, type: 'file' });
      }
    });
    
    Object.values(monthFolders).forEach(folder => {
      if (folder.children && folder.children.length > 0) {
        reportStructure.push(folder);
      }
    });
    
    reportStructure.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'folder') {
            // Sort folders by month order
            const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
        }
        return 0; // Keep other files at the end or maintain original relative order
    });

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

const getCurrentMonthName = (): string => {
  return format(new Date(), 'MMMM').toLowerCase();
};

// Generic function to sum values from report files for a given month
async function sumReportValues(
  monthName: string,
  regex: RegExp,
  valueParser: (match: RegExpMatchArray) => number,
  itemDescription: string
): Promise<{ success: boolean; total?: number; message: string }> {
  const reportsDirectory = join(process.cwd(), 'public/reportFiles');
  let totalSum = 0;
  try {
    const files = await readdir(reportsDirectory);
    const monthTxtFiles = files.filter(file => file.toLowerCase().includes(monthName) && file.endsWith('.txt'));

    if (monthTxtFiles.length === 0) {
      return { success: true, total: 0, message: `No ${monthName} report files found for ${itemDescription}.` };
    }

    for (const file of monthTxtFiles) {
      const filePath = join(reportsDirectory, file);
      try {
        const content = await readFile(filePath, 'utf8');
        const match = content.match(regex);
        if (match && match[1]) {
          const value = valueParser(match);
          if (!isNaN(value)) {
            totalSum += value;
          } else {
            console.warn(`Could not parse '${itemDescription}' from ${file}: value was '${match[1]}'`);
          }
        } else {
          console.warn(`'${itemDescription}' line not found or improperly formatted in ${file}`);
        }
      } catch (readError) {
        console.error(`Error reading file ${file}:`, readError);
      }
    }
    console.log(`Successfully calculated sum of ${monthName} ${itemDescription}:`, totalSum);
    return { success: true, total: totalSum, message: `Sum of ${monthName} ${itemDescription} calculated successfully.` };
  } catch (error) {
    console.error(`Error getting sum of ${monthName} ${itemDescription}:`, error);
    let errorMessage = `Failed to get sum of ${monthName} ${itemDescription}.`;
    if (error instanceof Error) {
      errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}


export async function getSumOfCurrentMonthTotalTables(): Promise<{ success: boolean; total?: number; message: string }> {
  const currentMonth = getCurrentMonthName();
  return sumReportValues(currentMonth, /Total Table:\s*(\d+)/, (match) => parseInt(match[1], 10), 'total tables');
}

export async function getSumOfCurrentMonthTotalGuests(): Promise<{ success: boolean; total?: number; message: string }> {
  const currentMonth = getCurrentMonthName();
  return sumReportValues(currentMonth, /Total Guest:\s*(\d+)/, (match) => parseInt(match[1], 10), 'total guests');
}

export async function getSumOfCurrentMonthNetSales(): Promise<{ success: boolean; total?: number; message: string }> {
  const currentMonth = getCurrentMonthName();
  return sumReportValues(currentMonth, /Net Sales:\s*\$([0-9.]+)/, (match) => parseFloat(match[1]), 'net sales');
}

export async function getSumOfCurrentMonthNewChubbyMembers(): Promise<{ success: boolean; total?: number; message: string }> {
  const currentMonth = getCurrentMonthName();
  return sumReportValues(currentMonth, /New Chubby Member:\s*(\d+)/, (match) => parseInt(match[1], 10), 'new chubby members');
}


// --- May specific functions (can be deprecated or removed if generic functions are sufficient) ---
export async function getSumOfMayTotalTables(): Promise<{ success: boolean; totalTables?: number; message: string }> {
  const reportsDirectory = join(process.cwd(), 'public/reportFiles');
  let totalTablesSum = 0;
  try {
    const files = await readdir(reportsDirectory);
    const mayTxtFiles = files.filter(file => file.toLowerCase().includes('may') && file.endsWith('.txt'));

    if (mayTxtFiles.length === 0) {
      return { success: true, totalTables: 0, message: 'No May report files found.' };
    }

    for (const file of mayTxtFiles) {
      const filePath = join(reportsDirectory, file);
      try {
        const content = await readFile(filePath, 'utf8');
        const match = content.match(/Total Table:\s*(\d+)/);
        if (match && match[1]) {
          const tableCount = parseInt(match[1], 10);
          if (!isNaN(tableCount)) {
            totalTablesSum += tableCount;
          } else {
            console.warn(`Could not parse 'Total Table' from ${file}: value was '${match[1]}'`);
          }
        } else {
          console.warn(`'Total Table:' line not found or improperly formatted in ${file}`);
        }
      } catch (readError) {
        console.error(`Error reading file ${file}:`, readError);
      }
    }
    console.log('Successfully calculated sum of May total tables:', totalTablesSum);
    return { success: true, totalTables: totalTablesSum, message: 'Sum of May total tables calculated successfully.' };
  } catch (error) {
    console.error('Error getting sum of May total tables:', error);
    let errorMessage = 'Failed to get sum of May total tables.';
    if (error instanceof Error) {
      errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}

export async function getSumOfMayTotalGuests(): Promise<{ success: boolean; totalGuests?: number; message: string }> {
  const reportsDirectory = join(process.cwd(), 'public/reportFiles');
  let totalGuestsSum = 0;
  try {
    const files = await readdir(reportsDirectory);
    const mayTxtFiles = files.filter(file => file.toLowerCase().includes('may') && file.endsWith('.txt'));

    if (mayTxtFiles.length === 0) {
      return { success: true, totalGuests: 0, message: 'No May report files found for guests.' };
    }

    for (const file of mayTxtFiles) {
      const filePath = join(reportsDirectory, file);
      try {
        const content = await readFile(filePath, 'utf8');
        const match = content.match(/Total Guest:\s*(\d+)/);
        if (match && match[1]) {
          const guestCount = parseInt(match[1], 10);
          if (!isNaN(guestCount)) {
            totalGuestsSum += guestCount;
          } else {
            console.warn(`Could not parse 'Total Guest' from ${file}: value was '${match[1]}'`);
          }
        } else {
          console.warn(`'Total Guest:' line not found or improperly formatted in ${file}`);
        }
      } catch (readError) {
        console.error(`Error reading file ${file}:`, readError);
      }
    }
    console.log('Successfully calculated sum of May total guests:', totalGuestsSum);
    return { success: true, totalGuests: totalGuestsSum, message: 'Sum of May total guests calculated successfully.' };
  } catch (error) {
    console.error('Error getting sum of May total guests:', error);
    let errorMessage = 'Failed to get sum of May total guests.';
    if (error instanceof Error) {
      errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}

export async function getSumOfMayNetSales(): Promise<{ success: boolean; totalNetSales?: number; message: string }> {
  const reportsDirectory = join(process.cwd(), 'public/reportFiles');
  let totalNetSalesSum = 0;
  try {
    const files = await readdir(reportsDirectory);
    const mayTxtFiles = files.filter(file => file.toLowerCase().includes('may') && file.endsWith('.txt'));

    if (mayTxtFiles.length === 0) {
      return { success: true, totalNetSales: 0, message: 'No May report files found for net sales.' };
    }

    for (const file of mayTxtFiles) {
      const filePath = join(reportsDirectory, file);
      try {
        const content = await readFile(filePath, 'utf8');
        const match = content.match(/Net Sales:\s*\$([0-9.]+)/);
        if (match && match[1]) {
          const salesAmount = parseFloat(match[1]);
          if (!isNaN(salesAmount)) {
            totalNetSalesSum += salesAmount;
          } else {
            console.warn(`Could not parse 'Net Sales' from ${file}: value was '${match[1]}'`);
          }
        } else {
          console.warn(`'Net Sales:' line not found or improperly formatted in ${file}`);
        }
      } catch (readError) {
        console.error(`Error reading file ${file}:`, readError);
      }
    }
    console.log('Successfully calculated sum of May net sales:', totalNetSalesSum);
    return { success: true, totalNetSales: totalNetSalesSum, message: 'Sum of May net sales calculated successfully.' };
  } catch (error) {
    console.error('Error getting sum of May net sales:', error);
    let errorMessage = 'Failed to get sum of May net sales.';
    if (error instanceof Error) {
      errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}

export async function getSumOfMayNewChubbyMembers(): Promise<{ success: boolean; totalNewChubbyMembers?: number; message: string }> {
  const reportsDirectory = join(process.cwd(), 'public/reportFiles');
  let totalNewMembersSum = 0;
  try {
    const files = await readdir(reportsDirectory);
    const mayTxtFiles = files.filter(file => file.toLowerCase().includes('may') && file.endsWith('.txt'));

    if (mayTxtFiles.length === 0) {
      return { success: true, totalNewChubbyMembers: 0, message: 'No May report files found for new chubby members.' };
    }

    for (const file of mayTxtFiles) {
      const filePath = join(reportsDirectory, file);
      try {
        const content = await readFile(filePath, 'utf8');
        const match = content.match(/New Chubby Member:\s*(\d+)/);
        if (match && match[1]) {
          const memberCount = parseInt(match[1], 10);
          if (!isNaN(memberCount)) {
            totalNewMembersSum += memberCount;
          } else {
            console.warn(`Could not parse 'New Chubby Member' from ${file}: value was '${match[1]}'`);
          }
        } else {
          console.warn(`'New Chubby Member:' line not found or improperly formatted in ${file}`);
        }
      } catch (readError) {
        console.error(`Error reading file ${file}:`, readError);
      }
    }
    console.log('Successfully calculated sum of May new chubby members:', totalNewMembersSum);
    return { success: true, totalNewChubbyMembers: totalNewMembersSum, message: 'Sum of May new chubby members calculated successfully.' };
  } catch (error) {
    console.error('Error getting sum of May new chubby members:', error);
    let errorMessage = 'Failed to get sum of May new chubby members.';
    if (error instanceof Error) {
      errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}

    