
'use server';

import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { format } from 'date-fns';

const LOG_DIR = join(process.cwd(), 'public/modifiedlog');
const LOG_FILE_PATH = join(LOG_DIR, 'activity_log.txt');

/**
 * Logs a user activity to the activity_log.txt file.
 * The timestamp will be in 'yyyy-M-d HH:mm:ss' format based on the server's timezone.
 * For PST, ensure the server's timezone is configured to PST.
 * @param username The username of the user performing the action.
 * @param action The action performed (e.g., "login", "create_report").
 * @param details Optional details about the action (e.g., filename).
 */
export async function logUserActivity(
  username: string,
  action: string,
  details?: string
): Promise<{ success: boolean; message: string }> {
  if (!username) {
    // Cannot log activity for an unknown user, but don't block the main operation.
    console.warn('Attempted to log activity for an undefined username.');
    return { success: false, message: 'Username is required to log activity.' };
  }

  try {
    // Ensure the log directory exists
    await mkdir(LOG_DIR, { recursive: true });

    const formattedTimestamp = format(new Date(), 'yyyy-M-d HH:mm:ss'); // Includes time
    
    let logEntry = `${formattedTimestamp}, ${username}, ${action}`;
    if (details) {
      logEntry += ` ${details}`;
    }
    logEntry += '\n';

    await appendFile(LOG_FILE_PATH, logEntry, 'utf8');
    console.log(`Activity logged: ${logEntry.trim()}`);
    return { success: true, message: 'Activity logged successfully.' };
  } catch (error) {
    console.error('Failed to log user activity:', error);
    let errorMessage = 'Failed to log activity.';
    if (error instanceof Error) {
      errorMessage += ` Reason: ${error.message}`;
    }
    // Do not block the main user action if logging fails
    return { success: false, message: errorMessage };
  }
}

