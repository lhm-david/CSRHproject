
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from 'next/navigation';
import { Icons } from "@/components/icons"; 
import Navbar, { type ActiveView } from  "@/components/navbar";
import ReportViewer from "@/components/report-viewer"; // Import ReportViewer
import ReportForm from "@/components/report-form"; // Import ReportForm


export default function Home() {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); 
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const router = useRouter();
 

  useEffect(() => {
    const userInfo = sessionStorage.getItem('username');
    if (!userInfo || userInfo === "undefined") {
      router.push('/');
    } else {
      setUsername(userInfo.toString());
      setIsLoading(false); 
    }
  }, [router]);

  const handleReportFormSubmitSuccess = () => {
    setActiveView('home'); // Navigate back to home view within the page
  };

  const handleReportFormGoBack = () => {
    setActiveView('home'); // Navigate back to home view
  };
  

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center p-4 space-y-6 mt-8">
        
        {username && activeView === 'home' && <h3 className="text-2xl font-bold">Welcome, {username}!</h3>}
        
        {activeView === 'home' && (
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
        )}

        {activeView === 'home' && <h1 className="text-2xl font-bold">Chubby Skewer Management platform</h1>}
        
        <Navbar setActiveView={setActiveView} />

        {activeView === 'viewReport' && (
          <div className="w-full mt-4">
            <ReportViewer />
          </div>
        )}
        {activeView === 'newReport' && (
          <div className="w-full mt-4 flex justify-center">
            <ReportForm 
              onSuccessfulSubmit={handleReportFormSubmitSuccess} 
              onGoBack={handleReportFormGoBack} 
            />
          </div>
        )}
      </div>
      <Toaster />
    </>
  );
}
