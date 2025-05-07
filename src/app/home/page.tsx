
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
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Opps...</p>
      </div>
    );
  }

  // This content will only render if isLoading is false and user is authenticated
  return (
    <>
      <div className="flex flex-col items-center justify-center p-4 space-y-6 mt-8">
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
        
      </div>

      <nav className="w-full bg-primary text-primary-foreground p-4 flex justify-around items-center shadow-md mt-8">
        <Button variant="ghost" onClick={() => router.push('/viewreport')} className="hover:bg-primary/80">View Daily Report</Button>
        <Button variant="ghost" onClick={() => router.push('/report')} className="hover:bg-primary/80">Go to Daily Report</Button>
        <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
      </nav>
      <Toaster />
    </>
  );
}
