
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { getCookie, deleteCookie } from 'cookies-next'; // Import getCookie and deleteCookie
import { useRouter } from 'next/navigation'; // Import useRouter

export default function Home() {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const router = useRouter(); // Initialize useRouter
  const { toast } = useToast();

  useEffect(() => {
    const userCookie = getCookie('username');
    if (userCookie === undefined || userCookie === null || userCookie === '') {
      // Redirect to login page if username cookie is not found or is empty
      router.push('/'); 
    } else {
      setUsername(userCookie.toString());
    }
  }, [router]); // Add router to dependency array

  const handleLogout = () => {
    deleteCookie('username', { path: '/' }); // Ensure cookie is deleted with the correct path
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/');
  };

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
        <Button onClick={handleLogout}>Log Out</Button>
        
        <Button onClick={() => router.push('/viewreport')}>View Daily Report</Button>
        <Button onClick={() => router.push('/report')}>Go to Daily Report</Button>
        
      </div>
      <Toaster /> {/* Add Toaster component here */}
    </>
  );
}
