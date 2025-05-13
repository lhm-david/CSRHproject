
"use client";

import { useState, useEffect } from 'react';
import { Button, buttonVariants } from "@/components/ui/button"; // Imported buttonVariants
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { listReportFiles, getReportFileContent, updateReportFileContent, deleteReportFile, type ReportStructureItem } from '@/actions/reportActions';
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { logUserActivity } from '@/actions/logActions'; // Import logging action


export default function ReportViewer() {
  const [reportStructure, setReportStructure] = useState<ReportStructureItem[]>([]);
  const [selectedReportContent, setSelectedReportContent] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [openFolders, setOpenFolders] = useState<string[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState<string>("");
  const [currentOpenReportFilename, setCurrentOpenReportFilename] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);


  const fetchReportFiles = async () => {
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
  };

  useEffect(() => {
    fetchReportFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed toast from dependency array as it's stable

  const handleFileClick = async (filename: string) => {
    if (isEditing) {
        setIsEditing(false);
        setEditableContent("");
        toast({
            variant: "default",
            title: "Edit Cancelled",
            description: "Switched report, previous edits were not saved.",
        });
    }

    setIsLoadingContent(true);
    setSelectedReportContent(null); 
    setError(null);
    setCurrentOpenReportFilename(filename);

    try {
      const result = await getReportFileContent(filename);
      if (result.success && result.content !== undefined) {
        setSelectedReportContent(result.content);
      } else {
        setError(result.message);
        setCurrentOpenReportFilename(null); 
        toast({ variant: "destructive", title: `Error loading ${filename}`, description: result.message });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setCurrentOpenReportFilename(null); 
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleEditClick = () => {
    if (selectedReportContent && currentOpenReportFilename) {
      setEditableContent(selectedReportContent);
      setIsEditing(true);
    }
  };

  const handleSaveClick = async () => {
    if (currentOpenReportFilename && isEditing) {
      setIsLoadingContent(true); 
      try {
        const result = await updateReportFileContent(currentOpenReportFilename, editableContent);
        if (result.success) {
          setSelectedReportContent(editableContent);
          setIsEditing(false);
          toast({ title: "Report Updated", description: result.message });
          const username = sessionStorage.getItem('username');
          if (username && username !== "undefined") {
            await logUserActivity(username, 'edit', currentOpenReportFilename);
          }
        } else {
          toast({ variant: "destructive", title: "Error updating report", description: result.message });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        toast({ variant: "destructive", title: "Save Error", description: errorMessage });
      } finally {
        setIsLoadingContent(false);
      }
    }
  };

  const handleCancelEditClick = () => {
    setIsEditing(false);
    setEditableContent(""); 
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      const result = await deleteReportFile(fileToDelete);
      if (result.success) {
        toast({ title: "Report Deleted", description: result.message });
        const username = sessionStorage.getItem('username');
        if (username && username !== "undefined") {
          await logUserActivity(username, 'delete', fileToDelete);
        }
        fetchReportFiles(); // Refresh the file list
        if (currentOpenReportFilename === fileToDelete) {
          setSelectedReportContent(null);
          setCurrentOpenReportFilename(null);
          setIsEditing(false);
        }
      } else {
        toast({ variant: "destructive", title: "Error deleting report", description: result.message });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast({ variant: "destructive", title: "Delete Error", description: errorMessage });
    } finally {
      setFileToDelete(null); // Close the dialog
    }
  };


  const renderReportItem = (item: ReportStructureItem, level = 0) => {
    const paddingLeft = `${level * 1.5}rem`; 

    if (item.type === 'folder') {
      return (
        <AccordionItem value={item.name} key={item.name} className="border-none">
          <AccordionTrigger 
            className="hover:no-underline py-2 px-3 rounded-md"
            onClick={() => setOpenFolders(prev => 
              prev.includes(item.name) ? prev.filter(f => f !== item.name) : [...prev, item.name]
            )}
            >
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
      <div key={item.name} className="flex items-center w-full group">
        <Button
          variant="ghost"
          className="flex-grow justify-start text-left py-2 px-3 rounded-md"
          onClick={() => handleFileClick(item.name)}
        >
          <Icons.file className="mr-2 h-4 w-4" />
          {item.name}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100"
              onClick={(e) => {
                e.stopPropagation(); // Prevent file click
                setFileToDelete(item.name);
              }}
              aria-label={`Delete report ${item.name}`}
            >
              <Icons.trash className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          {fileToDelete === item.name && (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the report file: <strong>{item.name}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setFileToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteFile} className={buttonVariants({variant: "destructive"})}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </div>
    );
  };


  return (
    // <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 h-[calc(100vh-150px)]"> 
    <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 "> 
      <Card className="w-full md:w-1/3 shadow-lg min-w-[300px]">
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          {/* <CardDescription>Click a report to view its content.</CardDescription> */}
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
            // <ScrollArea className="h-[calc(100vh-280px)]"> 
            <ScrollArea > 
              <Accordion 
                type="multiple" 
                value={openFolders}
                onValueChange={setOpenFolders} // This allows accordion to manage its state internally
                className="w-full"
              >
                {reportStructure.map((item) => renderReportItem(item))}
              </Accordion>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="w-full md:w-1/3 shadow-lg min-w-[300px] ">
        <CardHeader>
          <CardTitle>Report Content</CardTitle>
          {selectedReportContent === null && !isLoadingContent && !isEditing && <CardDescription>Select a report to see its details.</CardDescription>}
           {isEditing && currentOpenReportFilename && <CardDescription>Editing: {currentOpenReportFilename}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-6rem)]"> {/* Adjusted height for better layout */}
          {isLoadingContent && !isEditing ? ( 
            <div className="flex items-center justify-center flex-grow">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
               <p className="ml-2 text-muted-foreground">Loading report content...</p>
            </div>
          ) : error && !selectedReportContent && !isEditing ? ( 
             <p className="text-destructive flex-grow">{error}</p>
          ) : isEditing ? (
            <>
              <ScrollArea className="flex-grow mb-4">
                <Textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="h-full min-h-[500px] text-sm whitespace-pre-wrap p-4 bg-muted rounded-md"
                  aria-label="Editable report content"
                />
              </ScrollArea>
              <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
                <Button onClick={handleSaveClick} disabled={isLoadingContent}>
                  {isLoadingContent ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancelEditClick} disabled={isLoadingContent}>
                  Cancel
                </Button>
              </div>
            </>
          ) : selectedReportContent !== null ? (
            <>
              <ScrollArea className="flex-grow mb-4">
                <pre className="text-sm whitespace-pre-wrap p-4 bg-muted rounded-md min-h-[300px]">{selectedReportContent}</pre>
              </ScrollArea>
              <div className="flex justify-center mt-auto pt-4 border-t">
                <Button onClick={handleEditClick}>
                  <Icons.edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </>
          ) : (
            !isLoadingFiles && <p className="text-muted-foreground flex-grow text-center pt-10">No report selected or content is empty.</p> // Added pt-10 for better centering
          )}
        </CardContent>
      </Card>
    </div>
  );
}
