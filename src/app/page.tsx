
"use client";
import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { uploadFileAction } from "@/actions/upload";
import { Icons } from "@/components/icons";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
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


  const handleLogin = async () => {
    console.log("Attempting to login with:", { username, password });

    try {
      // Fetch the users.json file from the public folder
      const response = await fetch("/users.json");
      if (!response.ok) {
        console.error("Failed to fetch users.json, status:", response.status);
        toast({
          variant: "destructive",
          title: "Login Error",
          description: `Could not load user data. Server responded with ${response.status}. Please ensure users.json is in the public folder.`,
        });
        return;
      }
      
      const usersData = await response.json();
      
      // Ensure usersData has a 'users' property and it's an array
      if (!usersData || !Array.isArray(usersData.users)) {
        console.error("users.json is not in the expected format. Expected { users: [...] }");
        toast({
          variant: "destructive",
          title: "Login Error",
          description: "User data is not in the expected format.",
        });
        return;
      }
      
      const usersArray = usersData.users;
      
      // Find the user with matching username and password
      const user = usersArray.find(
        (user: any) => user.username === username && user.password === password
      );

      if (user) {
      toast({
        variant: "default",
        title: "Login Successful",
        description: "Redirecting...",
      });
      // Redirect to a protected page, e.g., /home
      window.location.href = '/home';
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username or password.",
      });
    }
    } catch (error) {
      console.error("Login process error:", error);
      toast({
        variant: "destructive",
        title: "Login System Error",
        description: "An unexpected error occurred during the login process. Please try again later.",
      });    
      }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-background">
        
        <div className="w-full bg-black p-4 flex justify-center rounded-lg mb-6">
          <Image
            src="https://chubbyskewers.com/wp-content/uploads/2025/03/Image_20250326151332.png"
            alt="Chubby Skewers Logo"
            width={150} 
            height={150}
            className="rounded-full"
            data-ai-hint="restaurant logo"
          />
        </div>
        
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Chubby Skewer Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col items-center space-y-4 border p-6 rounded-lg shadow-sm mt-8">
          <h2 className="text-lg font-semibold">Upload File to Public Folder</h2>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            <Icons.file className="mr-2" /> Select File
          </Button>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
          )}
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
        
      </div>
      <Toaster />
    </>
  );
}

