
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
  let filesFoundForMonth = false;
  try {
    const files = await readdir(reportsDirectory);
    const monthTxtFiles = files.filter(file => 
        file.toLowerCase().includes(monthName.toLowerCase()) && 
        file.endsWith('.txt') &&
        // Ensure it matches the full month name to avoid partial matches like "Ma" for "March" and "May"
        new RegExp(`\\b${monthName.toLowerCase()}\\b`, 'i').test(file.toLowerCase())
    );


    if (monthTxtFiles.length === 0) {
      // This is not an error, just no data for this month/item combination.
      // The function will return totalSum = 0 in this case.
    } else {
        filesFoundForMonth = true;
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
          // This is not necessarily an error, the line might just be missing from a specific report.
          // console.warn(`'${itemDescription}' line not found or improperly formatted in ${file}`);
        }
      } catch (readError) {
        console.error(`Error reading file ${file}:`, readError);
      }
    }
    // console.log(`Successfully calculated sum of ${monthName} ${itemDescription}:`, totalSum);
    const message = filesFoundForMonth ? `Sum of ${monthName} ${itemDescription} calculated successfully.` : `No ${monthName} report files found containing ${itemDescription}.`;
    return { success: true, total: totalSum, message };
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
// These functions are kept for now but should ideally be replaced by calling sumReportValues with "may"
// Or removed if getSumOfCurrentMonth... functions are sufficient and "May" is the current month.

export async function getSumOfMayTotalTables(): Promise<{ success: boolean; totalTables?: number; message: string }> {
  const result = await sumReportValues("may", /Total Table:\s*(\d+)/, (match) => parseInt(match[1], 10), 'May total tables');
  return { ...result, totalTables: result.total };
}

export async function getSumOfMayTotalGuests(): Promise<{ success: boolean; totalGuests?: number; message: string }> {
  const result = await sumReportValues("may", /Total Guest:\s*(\d+)/, (match) => parseInt(match[1], 10), 'May total guests');
  return { ...result, totalGuests: result.total };
}

export async function getSumOfMayNetSales(): Promise<{ success: boolean; totalNetSales?: number; message: string }> {
  const result = await sumReportValues("may", /Net Sales:\s*\$([0-9.]+)/, (match) => parseFloat(match[1]), 'May net sales');
  return { ...result, totalNetSales: result.total };
}

export async function getSumOfMayNewChubbyMembers(): Promise<{ success: boolean; totalNewChubbyMembers?: number; message: string }> {
  const result = await sumReportValues("may", /New Chubby Member:\s*(\d+)/, (match) => parseInt(match[1], 10), 'May new chubby members');
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
    monthNames.push(format(new Date(year, i), 'MMMM'));
  }

  try {
    for (const monthName of monthNames) {
      // We need to ensure file names match this pattern: "..._MonthName_Day_Year.txt"
      // The sumReportValues function needs to correctly filter files for the given month and year.
      // For simplicity, we assume sumReportValues correctly handles filtering by month name found anywhere in the filename for now.
      // A more robust solution would involve parsing dates from filenames.
      const result = await sumReportValues(
        monthName,
        /Net Sales:\s*\$([0-9.]+)/,
        (match) => parseFloat(match[1]),
        `${monthName} net sales`
      );

      if (result.success && typeof result.total === 'number') {
        monthlySalesArray.push({
          month: monthName,
          shortMonth: format(new Date(year, monthNames.indexOf(monthName)), 'MMM'),
          netSales: result.total,
        });
      } else if (!result.success) {
        // Log error for specific month but continue for others
        console.error(`Failed to get net sales for ${monthName}: ${result.message}`);
      } else {
         // No error, but no data or total was undefined, push with 0 sales
         monthlySalesArray.push({
          month: monthName,
          shortMonth: format(new Date(year, monthNames.indexOf(monthName)), 'MMM'),
          netSales: 0,
        });
      }
    }
    return { success: true, data: monthlySalesArray, message: 'Successfully fetched net sales for all months.' };
  } catch (error) {
    console.error('Error fetching net sales for all months:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, message: `Failed to fetch net sales for all months: ${errorMessage}` };
  }
}
    

    