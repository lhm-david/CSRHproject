
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    // Placeholder for actual login logic
    console.log("Attempting to login with:", { username, password });
    if (username === "admin" && password === "password") { // Replace with actual auth
      toast({
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
            <CardDescription>Please sign in to continue</CardDescription>
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
        
      </div>
      <Toaster />
    </>
  );
}
