
"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'; // Keep for logout
import type { Dispatch, SetStateAction } from 'react';

export type ActiveView = 'home' | 'viewReport' | 'newReport';

interface NavbarProps {
  setActiveView: Dispatch<SetStateAction<ActiveView>>;
}

export default function Navbar({ setActiveView }: NavbarProps) {
    const router = useRouter(); // Keep for logout functionality

    const handleLogout = () => {
        sessionStorage.removeItem('username');
        router.push('/');
    };

    return (
        <nav className="w-full p-4 flex justify-around items-center shadow-md mt-10">
            <Button variant="secondary" onClick={() => setActiveView('home')} className="hover:font-bold">Home</Button>
            <Button variant="secondary" onClick={() => setActiveView('viewReport')} className="hover:font-bold">View Daily Report</Button>
            <Button variant="secondary" onClick={() => setActiveView('newReport')} className="hover:font-bold">New Report</Button>
            <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
        </nav>
    )
}
