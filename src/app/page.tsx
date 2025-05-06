
"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { uploadFileAction } from "@/actions/upload"; // Import the server action
import { Icons } from "@/components/icons";

export default function Home() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("File selected:", file.name);
    } else {
      setSelectedFile(null);
      console.log("No file selected");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      console.log("Uploading file:", selectedFile.name);
      const result = await uploadFileAction(formData);
      console.log("Upload result:", result);

      if (result.success) {
        toast({
          title: "Upload Successful",
          description: result.message,
        });
        setSelectedFile(null); // Clear selection after successful upload
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
      <Image
        src="https://chubbyskewers.com/wp-content/uploads/2025/03/Image_20250326151332.png" // Placeholder image
        alt="Chubby Skewers Logo"
        width={150}
        height={150}
        className="rounded-full mb-4"
        data-ai-hint="restaurant logo"
      />
      <h1 className="text-2xl font-bold">Chubby Skewer Management platform</h1>

      <div className="flex flex-col items-center space-y-4 border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold">Upload File to Public Folder</h2>
        {/* Hidden file input */}
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id="fileUpload"
        />
        {/* Button to trigger file input */}
        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
          <Icons.file className="mr-2" /> Select File
        </Button>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
        )}
        {/* Button to upload the selected file */}
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? (
            <>
              <Icons.spinner className="mr-2 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Icons.upload className="mr-2" /> Upload File
            </>
          )}
        </Button>
      </div>


      <Button onClick={() => window.location.href = '/report'}>Go to Daily Report</Button>
      {/* Link to test file - keep if needed for testing */}
      {/* <a href="/file/testfile.txt" >Test File</a> */}
    </div>
  );
}
