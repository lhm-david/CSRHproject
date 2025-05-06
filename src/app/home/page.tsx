"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from 'next/navigation';
import { Icons } from "@/components/icons"; // Import Icons for the spinner

export default function Home() {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const userInfo = sessionStorage.getItem('username');
    if (!userInfo || userInfo === "undefined") {
      router.push('/');
      // No need to setIsLoading(false) here as the component will unmount upon redirect
    } else {
      setUsername(userInfo.toString());
      setIsLoading(false); // Set loading to false after user is confirmed
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('username');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // This content will only render if isLoading is false and user is authenticated
  return (
    <>
      <div className="flex flex-col items-center justify-center p-4 space-y-6">
        {username && <h3 className="text-2xl font-bold">Welcome, {username}!</h3>}
        
        <div className="w-full bg-black p-4 flex justify-center rounded-lg">
          <Image
            src="https://chubbyskewers.com/wp-content/uploads/2025/03/Image_20250326151332.png"
            alt="Chubby Skewers Logo"
            width={250}
            height={250}
            className="rounded-full"
            data-ai-hint="restaurant logo"
          />
        </div>

        <h1 className="text-2xl font-bold">Chubby Skewer Management platform</h1>
        {/* Displaying username again here for consistency, though already in welcome message */}
        {username && <h3>Hello {username}</h3>}
        <Button onClick={handleLogout}>Log Out</Button>
        
        <Button onClick={() => router.push('/viewreport')}>View Daily Report</Button>
        <Button onClick={() => router.push('/report')}>Go to Daily Report</Button>
        
      </div>
      <Toaster />
    </>
  );
}