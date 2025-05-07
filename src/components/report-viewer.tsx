
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listReportFiles, getReportFileContent, ReportStructureItem } from '@/actions/reportActions';
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


export default function ReportViewer() {
  const [reportStructure, setReportStructure] = useState<ReportStructureItem[]>([]);
  const [selectedReportContent, setSelectedReportContent] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [openFolders, setOpenFolders] = useState<string[]>([]);

  useEffect(() => {
    async function fetchReportFiles() {
      setIsLoadingFiles(true);
      setError(null);
      try {
        const result = await listReportFiles();
        if (result.success && result.reportStructure) {
          setReportStructure(result.reportStructure);
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
    setSelectedReportContent(null); // Clear previous content
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

  const renderReportItem = (item: ReportStructureItem, level = 0) => {
    const paddingLeft = `${level * 1.5}rem`; // Indentation for nested items

    if (item.type === 'folder') {
      return (
        <AccordionItem value={item.name} key={item.name} className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 px-3 rounded-md hover:bg-accent">
            <div className="flex items-center" style={{ paddingLeft }}>
              {openFolders.includes(item.name) ? <Icons.folderOpen className="mr-2 h-4 w-4" /> : <Icons.folder className="mr-2 h-4 w-4" />}
              {item.name}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-0">
            {item.children?.map(child => renderReportItem(child, level + 1))}
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <Button
        key={item.name}
        variant="ghost"
        className="w-full justify-start text-left py-2 px-3 rounded-md"
        style={{ paddingLeft }}
        onClick={() => handleFileClick(item.name)}
      >
        <Icons.file className="mr-2 h-4 w-4" />
        {item.name}
      </Button>
    );
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
          ) : error && reportStructure.length === 0 ? (
             <p className="text-destructive">{error}</p>
          ): reportStructure.length === 0 ? (
            <p className="text-muted-foreground">No reports found.</p>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]"> {/* Adjusted height */}
              <Accordion 
                type="multiple" 
                value={openFolders}
                onValueChange={setOpenFolders}
                className="w-full"
              >
                {reportStructure.map((item) => renderReportItem(item))}
              </Accordion>
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
          ) : error && !selectedReportContent ? ( // Show error only if content is not loaded
             <p className="text-destructive">{error}</p>
          ) : selectedReportContent !== null ? (
            <ScrollArea className="h-[calc(100vh-280px)]"> {/* Adjusted height */}
              <pre className="text-sm whitespace-pre-wrap p-4 bg-muted rounded-md">{selectedReportContent}</pre>
            </ScrollArea>
          ) : (
            // Show this message if not loading files, no error, and no content selected
            !isLoadingFiles && <p className="text-muted-foreground">No report selected or content is empty.</p> 
          )}
        </CardContent>
      </Card>
    </div>
  );
}
