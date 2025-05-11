
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

export async function updateReportFileContent(
  filename: string,
  newContent: string
): Promise<{ success: boolean; message: string }> {
  if (!filename) {
    return { success: false, message: 'Filename is required for update.' };
  }
  const sanitizedFilename = sanitizeFilename(filename); // Use the existing sanitization
  if (sanitizedFilename !== filename) {
    console.warn(`Filename was sanitized for updating: "${filename}" -> "${sanitizedFilename}"`);
  }
  if (!sanitizedFilename.endsWith('.txt')) {
    return { success: false, message: 'Invalid file type for update. Only .txt files are allowed.' };
  }

  const filePath = join(process.cwd(), 'public/reportFiles', sanitizedFilename);
  console.log(`Attempting to update report file at: ${filePath}`);
  try {
    await writeFile(filePath, newContent, 'utf8');
    console.log(`Report file "${sanitizedFilename}" updated successfully.`);
    return { success: true, message: `Report "${sanitizedFilename}" updated successfully.` };
  } catch (error) {
    console.error(`Error updating report file "${sanitizedFilename}":`, error);
    let errorMessage = `Failed to update report file "${sanitizedFilename}".`;
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
  monthName: string, // Expect full month name e.g., "January", "February"
  regex: RegExp,
  valueParser: (match: RegExpMatchArray) => number,
  itemDescription: string
): Promise<{ success: boolean; total?: number; message: string }> {
  const reportsDirectory = join(process.cwd(), 'public/reportFiles');
  let totalSum = 0;
  const lowerCaseMonthName = monthName.toLowerCase(); // Use lowercase for matching

  try {
    const files = await readdir(reportsDirectory);
    // Ensure comparison is case-insensitive by converting filename to lowercase as well
    const monthTxtFiles = files.filter(file => file.toLowerCase().includes(lowerCaseMonthName) && file.endsWith('.txt'));

    if (monthTxtFiles.length === 0) {
      return { success: true, total: 0, message: `No report files found for ${monthName} for ${itemDescription}.` };
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
          // This is not an error, just means the line wasn't found or value not parsable.
          // console.warn(`'${itemDescription}' line not found or improperly formatted in ${file}`);
        }
      } catch (readError) {
        console.error(`Error reading file ${file}:`, readError);
        // Optionally, decide if a single file read error should make the whole sum fail
        // For now, we'll log and continue, effectively summing from readable files.
      }
    }
    console.log(`Successfully calculated sum of ${monthName} ${itemDescription}:`, totalSum);
    return { success: true, total: totalSum, message: `Sum of ${monthName} ${itemDescription} calculated successfully.` };
  } catch (error) { // This catches readdir error mostly
    console.error(`Error getting sum of ${monthName} ${itemDescription}:`, error);
    let errorMessage = `Failed to get sum of ${monthName} ${itemDescription}.`;
    if (error instanceof Error) {
      errorMessage += ` Reason: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}


export async function getSumOfCurrentMonthTotalTables(): Promise<{ success: boolean; total?: number; message: string }> {
  const currentMonth = getCurrentMonthName(); // already returns lowercase
  return sumReportValues(currentMonth, /Total Table:\s*(\d+)/, (match) => parseInt(match[1], 10), 'total tables');
}

export async function getSumOfCurrentMonthTotalGuests(): Promise<{ success: boolean; total?: number; message: string }> {
  const currentMonth = getCurrentMonthName(); // already returns lowercase
  return sumReportValues(currentMonth, /Total Guest:\s*(\d+)/, (match) => parseInt(match[1], 10), 'total guests');
}

export async function getSumOfCurrentMonthNetSales(): Promise<{ success: boolean; total?: number; message: string }> {
  const currentMonth = getCurrentMonthName(); // already returns lowercase
  return sumReportValues(currentMonth, /Net Sales:\s*\$([0-9.]+)/, (match) => parseFloat(match[1]), 'net sales');
}

export async function getSumOfCurrentMonthNewChubbyMembers(): Promise<{ success: boolean; total?: number; message: string }> {
  const currentMonth = getCurrentMonthName(); // already returns lowercase
  return sumReportValues(currentMonth, /New Chubby Member:\s*(\d+)/, (match) => parseInt(match[1], 10), 'new chubby members');
}


// --- May specific functions (can be deprecated or removed if generic functions are sufficient) ---
// These functions are kept for now but should ideally be replaced by calling sumReportValues with "may"
// Or removed if getSumOfCurrentMonth... functions are sufficient and "May" is the current month.

export async function getSumOfMayTotalTables(): Promise<{ success: boolean; totalTables?: number; message: string }> {
  const result = await sumReportValues("May", /Total Table:\s*(\d+)/, (match) => parseInt(match[1], 10), 'May total tables');
  return { ...result, totalTables: result.total };
}

export async function getSumOfMayTotalGuests(): Promise<{ success: boolean; totalGuests?: number; message: string }> {
  const result = await sumReportValues("May", /Total Guest:\s*(\d+)/, (match) => parseInt(match[1], 10), 'May total guests');
  return { ...result, totalGuests: result.total };
}

export async function getSumOfMayNetSales(): Promise<{ success: boolean; totalNetSales?: number; message: string }> {
  const result = await sumReportValues("May", /Net Sales:\s*\$([0-9.]+)/, (match) => parseFloat(match[1]), 'May net sales');
  return { ...result, totalNetSales: result.total };
}

export async function getSumOfMayNewChubbyMembers(): Promise<{ success: boolean; totalNewChubbyMembers?: number; message: string }> {
  const result = await sumReportValues("May", /New Chubby Member:\s*(\d+)/, (match) => parseInt(match[1], 10), 'May new chubby members');
  return { ...result, totalNewChubbyMembers: result.total };
}

export type MonthlySalesData = {
  month: string; // Full month name e.g. "January"
  shortMonth: string; // Abbreviated month name e.g. "Jan"
  netSales: number;
};

export async function getNetSalesByMonthForAllMonths(year: number = new Date().getFullYear()): Promise<{ success: boolean; data?: MonthlySalesData[]; message: string }> {
  const monthlySalesArray: MonthlySalesData[] = [];
  const monthNames: string[] = [];
  for (let i = 0; i < 12; i++) {
    monthNames.push(format(new Date(year, i), 'MMMM')); // "January", "February", ...
  }
  
  let overallSuccess = true;
  const errorMessages: string[] = [];

  try {
    for (const monthName of monthNames) {
      // Pass the full month name (e.g., "January") to sumReportValues.
      // sumReportValues will handle converting it to lowercase for matching.
      const result = await sumReportValues(
        monthName, // Pass "January", "February", etc.
        /Net Sales:\s*\$([0-9.]+)/,
        (match) => parseFloat(match[1]),
        `${monthName} net sales`
      );

      let salesForMonth = 0;
      if (result.success && typeof result.total === 'number') {
        salesForMonth = result.total;
      } else {
        // This case handles both !result.success (an error in sumReportValues like readdir failure)
        // and result.success but result.total is undefined (e.g., no files found for that month).
        salesForMonth = 0; // Default to 0 sales for the month
        if (!result.success) {
          // Log specific error for the month if sumReportValues indicated a failure
          console.error(`Failed to get net sales for ${monthName}: ${result.message}`);
          errorMessages.push(`Error for ${monthName}: ${result.message}`);
          overallSuccess = false; // Mark that at least one month had an issue
        }
        // If result.success was true but total was undefined (e.g. no files), it's not an "error" for overallSuccess.
        // It just means 0 sales for that month based on available data.
      }

      monthlySalesArray.push({
        month: monthName,
        shortMonth: format(new Date(year, monthNames.indexOf(monthName)), 'MMM'),
        netSales: salesForMonth,
      });
    }

    // Ensure monthlySalesArray always has 12 entries. This should be guaranteed by the loop structure.
    if (monthlySalesArray.length !== 12) {
        // This state indicates a fundamental issue with the loop itself, not data parsing.
        console.error("Internal logic error: Monthly sales array does not have 12 months of data after processing.");
        return { 
            success: false, // Overall failure due to unexpected structure
            data: monthlySalesArray, // Return what we have, might be incomplete
            message: "Internal error: Did not generate complete data for all 12 months."
        };
    }
    
    return { 
      success: overallSuccess, // True if all months processed (even if some had 0 sales due to no files), false if any sumReportValues had critical error
      data: monthlySalesArray, 
      message: overallSuccess ? 'Successfully fetched net sales for all months.' : `Fetched net sales, but some months encountered errors: ${errorMessages.join("; ")}`
    };

  } catch (error) { // This catches errors like monthNames generation, or other unexpected issues outside the loop.
    console.error('Critical error in getNetSalesByMonthForAllMonths:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    // Return an empty array for data in case of such critical failure, and mark success as false.
    return { success: false, data: [], message: `Failed to fetch net sales for all months: ${errorMessage}` };
  }
}
    

    

    
