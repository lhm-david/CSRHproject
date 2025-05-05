
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';


export default function home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Image
        src="https://picsum.photos/400/600" // New placeholder image URL
        alt="Chubby Skewers Welcome"
        width={400} // Adjusted width
        height={600} // Adjusted height
        className="mb-4 rounded-lg shadow-md"
        data-ai-hint="chubby skewers welcome" // Updated hint based on provided image
      />
      <h1>Chubby Skewer Management platform</h1>
      <Button onClick={() => window.location.href = '/report'}>Go to Report</Button>
      <a href="./file/testfile.txt" >Test File</a>

    </div>
  );
}

