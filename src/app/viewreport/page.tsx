"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { Toaster } from "@/components/ui/toaster"; 
import { useRouter } from 'next/navigation';
import ReportViewer from '@/components/report-viewer'; // Import the new component

export default function ViewReportPage() {
  const { toast } = useToast(); // Keep toast if ReportViewer uses it or for future page-specific toasts
  const router = useRouter();
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userInfo = sessionStorage.getItem('username');
    if (!userInfo || userInfo === "undefined") {
      router.push('/');
    } else {
      setUsername(userInfo.toString());
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading...</p> {/* Changed text */}
      </div>
    );
  }
    
  return (
    <>
      <div className="flex flex-col items-center justify-start p-4 space-y-6 min-h-screen bg-background"> {/* Changed justify-center to justify-start */}
        
        <div className="w-full bg-black p-4 flex justify-center items-center rounded-lg sticky top-0 z-50"> {/* Made header sticky */}
          <Image
            src="https://chubbyskewers.com/wp-content/uploads/2025/03/Image_20250326151332.png"
            alt="Chubby Skewers Logo"
            width={100} // Reduced logo size
            height={100}
            className="rounded-full mr-4"
            data-ai-hint="restaurant logo"
          />
          <h1 className="text-xl md:text-2xl font-bold text-white">Chubby Skewer Report Viewer</h1> {/* Adjusted text size */}
        </div>

        {/* Render the ReportViewer component */}
        <div className="w-full flex-grow"> {/* Allow ReportViewer to take remaining space */}
          <ReportViewer />
        </div>
        
        <div className="w-full flex justify-center py-4"> {/* Footer for Go Back button */}
            <Button onClick={() => router.push('/home')} variant="outline">Go Back to Home</Button>
        </div>
        
      </div>
      <Toaster /> 
    </>
  );
}
