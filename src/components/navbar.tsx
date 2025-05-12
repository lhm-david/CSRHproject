
"use client";
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { logUserActivity } from '@/actions/logActions';
import { Icons } from "@/components/icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export type ActiveView = 'home' | 'viewReport' | 'newReport';

interface NavbarProps {
  setActiveView: Dispatch<SetStateAction<ActiveView>>;
}

export default function Navbar({ setActiveView }: NavbarProps) {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobileCheck = window.innerWidth < 1290;
            setIsMobile(mobileCheck);
            if (!mobileCheck && isSheetOpen) {
                setIsSheetOpen(false);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSheetOpen]);

    const handleLogout = async () => {
        const username = sessionStorage.getItem('username');
        if (username && username !== "undefined") {
            await logUserActivity(username, 'logout');
        }
        sessionStorage.removeItem('username');
        setIsSheetOpen(false); // Close sheet on logout
        router.push('/');
    };

    const handleNavAction = (view: ActiveView) => {
        setActiveView(view);
        setIsSheetOpen(false); // Close sheet on navigation
    };

    const navButtons = (
        <>
            <Button variant="secondary" onClick={() => handleNavAction('home')} className="w-full justify-start text-left py-3 hover:font-bold md:w-auto md:justify-center md:py-2">Home</Button>
            <Button variant="secondary" onClick={() => handleNavAction('viewReport')} className="w-full justify-start text-left py-3 hover:font-bold md:w-auto md:justify-center md:py-2">View Daily Report</Button>
            <Button variant="secondary" onClick={() => handleNavAction('newReport')} className="w-full justify-start text-left py-3 hover:font-bold md:w-auto md:justify-center md:py-2">New Report</Button>
            <Button variant="secondary" onClick={() => handleNavAction('home')} className="w-full justify-start text-left py-3 hover:font-bold md:w-auto md:justify-center md:py-2">Employee</Button>
            <Button variant="secondary" onClick={() => handleNavAction('home')} className="w-full justify-start text-left py-3 hover:font-bold md:w-auto md:justify-center md:py-2">Document</Button>
            <Button variant="secondary" onClick={() => handleNavAction('home')} className="w-full justify-start text-left py-3 hover:font-bold md:w-auto md:justify-center md:py-2">TO DO List</Button>
            <Button variant="destructive" onClick={handleLogout} className="w-full justify-start text-left py-3 md:w-auto md:justify-center md:py-2">Log Out</Button>
        </>
    );

    if (isMobile) {
        return (
            <nav className="w-full p-4 flex justify-between items-center shadow-md mt-2">
                 <div className="text-lg font-semibold">Chubby Skewers</div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Icons.menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[250px] sm:w-[300px] p-0">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col space-y-2 p-4">
                            {navButtons}
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        );
    }

    return (
        <nav className="w-full p-4 flex justify-around items-center shadow-md mt-2">
            {navButtons}
        </nav>
    );
}
