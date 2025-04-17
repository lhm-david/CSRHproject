// SummarizeReport.ts
'use server';

/**
 * @fileOverview Summarizes a daily report using AI.
 *
 * - summarizeReport - A function that summarizes the daily report.
 * - SummarizeReportInput - The input type for the summarizeReport function.
 * - SummarizeReportOutput - The return type for the summarizeReport function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeReportInputSchema = z.object({
  reportText: z.string().describe('The text of the daily report to summarize.'),
});
export type SummarizeReportInput = z.infer<typeof SummarizeReportInputSchema>;

const SummarizeReportOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the daily report.'),
});
export type SummarizeReportOutput = z.infer<typeof SummarizeReportOutputSchema>;

export async function summarizeReport(input: SummarizeReportInput): Promise<SummarizeReportOutput> {
  return summarizeReportFlow(input);
}

const summarizeReportPrompt = ai.definePrompt({
  name: 'summarizeReportPrompt',
  input: {
    schema: z.object({
      reportText: z.string().describe('The text of the daily report to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the daily report.'),
    }),
  },
  prompt: `Summarize the following daily report. The summary should be concise and highlight the key accomplishments, challenges, and plans.

Report:
{{{reportText}}}`, 
});

const summarizeReportFlow = ai.defineFlow<
  typeof SummarizeReportInputSchema,
  typeof SummarizeReportOutputSchema
>(
  {
    name: 'summarizeReportFlow',
    inputSchema: SummarizeReportInputSchema,
    outputSchema: SummarizeReportOutputSchema,
  },
  async input => {
    const {output} = await summarizeReportPrompt(input);
    return output!;
  }
);
