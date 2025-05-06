"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listReportFiles, getReportFileContent } from '@/actions/reportActions';
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function ReportViewer() {
  const [reportFiles, setReportFiles] = useState<string[]>([]);
  const [selectedReportContent, setSelectedReportContent] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchReportFiles() {
      setIsLoadingFiles(true);
      setError(null);
      try {
        const result = await listReportFiles();
        if (result.success && result.files) {
          setReportFiles(result.files);
        } else {
          setError(result.message);
          toast({ variant: "destructive", title: "Error loading reports", description: result.message });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        toast({ variant: "destructive", title: "Error", description: errorMessage });
      } finally {
        setIsLoadingFiles(false);
      }
    }
    fetchReportFiles();
  }, [toast]);

  const handleFileClick = async (filename: string) => {
    setIsLoadingContent(true);
    setSelectedReportContent(null);
    setError(null);
    try {
      const result = await getReportFileContent(filename);
      if (result.success && result.content !== undefined) {
        setSelectedReportContent(result.content);
      } else {
        setError(result.message);
        toast({ variant: "destructive", title: `Error loading ${filename}`, description: result.message });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsLoadingContent(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 h-[calc(100vh-150px)]"> {/* Adjusted height for better layout */}
      <Card className="w-full md:w-1/3 shadow-lg">
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Click a report to view its content.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFiles ? (
            <div className="flex items-center justify-center h-full">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading report list...</p>
            </div>
          ) : error && reportFiles.length === 0 ? (
             <p className="text-destructive">{error}</p>
          ): reportFiles.length === 0 ? (
            <p className="text-muted-foreground">No reports found.</p>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]"> {/* Adjusted height */}
              <div className="space-y-2">
                {reportFiles.map((file) => (
                  <Button
                    key={file}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => handleFileClick(file)}
                  >
                    <Icons.file className="mr-2 h-4 w-4" />
                    {file}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="w-full md:w-2/3 shadow-lg">
        <CardHeader>
          <CardTitle>Report Content</CardTitle>
          {selectedReportContent === null && !isLoadingContent && <CardDescription>Select a report to see its details.</CardDescription>}
        </CardHeader>
        <CardContent>
          {isLoadingContent ? (
            <div className="flex items-center justify-center h-full">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
               <p className="ml-2 text-muted-foreground">Loading report content...</p>
            </div>
          ) : error && !selectedReportContent ? (
             <p className="text-destructive">{error}</p>
          ) : selectedReportContent !== null ? (
            <ScrollArea className="h-[calc(100vh-280px)]"> {/* Adjusted height */}
              <pre className="text-sm whitespace-pre-wrap p-4 bg-muted rounded-md">{selectedReportContent}</pre>
            </ScrollArea>
          ) : (
            !isLoadingFiles && <p className="text-muted-foreground">No report selected or content is empty.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
