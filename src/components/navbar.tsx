
"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'; // Keep for logout
import type { Dispatch, SetStateAction } from 'react';
import { logUserActivity } from '@/actions/logActions'; // Import logging action

export type ActiveView = 'home' | 'viewReport' | 'newReport';

interface NavbarProps {
  setActiveView: Dispatch<SetStateAction<ActiveView>>;
}

export default function Navbar({ setActiveView }: NavbarProps) {
    const router = useRouter(); // Keep for logout functionality

    const handleLogout = async () => {
        const username = sessionStorage.getItem('username');
        if (username && username !== "undefined") {
            await logUserActivity(username, 'logout');
        }
        sessionStorage.removeItem('username');
        router.push('/');
    };

    return (
        <nav className="w-full p-4 flex justify-around items-center shadow-md mt-2">
            <Button variant="secondary" onClick={() => setActiveView('home')} className="hover:font-bold">Home</Button>
            <Button variant="secondary" onClick={() => setActiveView('viewReport')} className="hover:font-bold">View Daily Report</Button>
            <Button variant="secondary" onClick={() => setActiveView('newReport')} className="hover:font-bold">New Report</Button>
            <Button variant="secondary" onClick={() => setActiveView('home')} className="hover:font-bold">Employee</Button>
            <Button variant="secondary" onClick={() => setActiveView('home')} className="hover:font-bold">Document</Button>
            <Button variant="secondary" onClick={() => setActiveView('home')} className="hover:font-bold">TO DO List</Button>

            <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
        </nav>
    )
}
