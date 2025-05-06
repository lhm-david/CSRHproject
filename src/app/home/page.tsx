
"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { uploadFileAction } from "@/actions/upload"; // Import the server action
import { Icons } from "@/components/icons";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center p-4 space-y-6">
        
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
        <h3 className="text-2xl font-bold">Hello User,</h3><Button onClick={() => window.location.href = '/'}>Log Out</Button>
        

        <Button onClick={() => window.location.href = '/viewreport'}>View Daily Report</Button>
        <Button onClick={() => window.location.href = '/report'}>Go to Daily Report</Button>
        
      </div>
      <Toaster /> {/* Add Toaster component here */}
    </>
  );
}
