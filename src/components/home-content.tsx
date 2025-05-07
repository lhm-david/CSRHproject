
"use client";
import { useState, useEffect } from 'react';
import { 
    getSumOfCurrentMonthTotalTables,
    getSumOfCurrentMonthTotalGuests,
    getSumOfCurrentMonthNetSales,
    getSumOfCurrentMonthNewChubbyMembers 
} from '@/actions/reportActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { format } from 'date-fns';

export default function HomeContent() {
    const [currentMonthTotalTables, setCurrentMonthTotalTables] = useState<number | null>(null);
    const [currentMonthTotalGuests, setCurrentMonthTotalGuests] = useState<number | null>(null);
    const [currentMonthNetSales, setCurrentMonthNetSales] = useState<number | null>(null);
    const [currentMonthNewChubbyMembers, setCurrentMonthNewChubbyMembers] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonthName, setCurrentMonthName] = useState<string>("");

    useEffect(() => {
        setCurrentMonthName(format(new Date(), 'MMMM'));
        async function fetchCurrentMonthData() {
            setIsLoading(true);
            setError(null);
            let errorMessages: string[] = [];
            try {
                const [
                    tablesResult,
                    guestsResult,
                    netSalesResult,
                    newMembersResult
                ] = await Promise.all([
                    getSumOfCurrentMonthTotalTables(),
                    getSumOfCurrentMonthTotalGuests(),
                    getSumOfCurrentMonthNetSales(),
                    getSumOfCurrentMonthNewChubbyMembers()
                ]);

                if (tablesResult.success && typeof tablesResult.total === 'number') {
                    setCurrentMonthTotalTables(tablesResult.total);
                } else {
                    errorMessages.push(tablesResult.message || `Failed to fetch ${currentMonthName} total tables data.`);
                }

                if (guestsResult.success && typeof guestsResult.total === 'number') {
                    setCurrentMonthTotalGuests(guestsResult.total);
                } else {
                    errorMessages.push(guestsResult.message || `Failed to fetch ${currentMonthName} total guests data.`);
                }
                
                if (netSalesResult.success && typeof netSalesResult.total === 'number') {
                    setCurrentMonthNetSales(netSalesResult.total);
                } else {
                    errorMessages.push(netSalesResult.message || `Failed to fetch ${currentMonthName} net sales data.`);
                }

                if (newMembersResult.success && typeof newMembersResult.total === 'number') {
                    setCurrentMonthNewChubbyMembers(newMembersResult.total);
                } else {
                    errorMessages.push(newMembersResult.message || `Failed to fetch ${currentMonthName} new chubby members data.`);
                }

                if (errorMessages.length > 0) {
                    setError(errorMessages.join('\n'));
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : `An unexpected error occurred while fetching ${currentMonthName} data.`);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCurrentMonthData();
    }, [currentMonthName]);

    const formatCurrency = (value: number | null) => {
        if (value === null) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-lg mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle>{currentMonthName} Insights</CardTitle>
                    <CardDescription>Summary of key metrics from {currentMonthName}'s reports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && (
                        <div className="flex items-center justify-center p-4">
                            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-2 text-muted-foreground">Loading {currentMonthName} data...</p>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="p-4 text-destructive bg-destructive/10 rounded-md">
                            <p>Error: {error}</p>
                        </div>
                    )}
                    {!isLoading && !error && (
                        <>
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className="text-lg font-semibold">Total Tables Served in {currentMonthName}:</td>
                                        <td>&nbsp;</td>
                                        <td className="text-lg font-bold text-primary">{currentMonthTotalTables !== null ? currentMonthTotalTables : 'N/A'}</td>

                                    </tr>
                                    <tr>
                                        <td className="text-lg font-semibold">Total Guests Served in {currentMonthName}:</td>
                                        <td>&nbsp;</td>
                                        <td className="text-lg font-bold text-primary">{currentMonthTotalGuests !== null ? currentMonthTotalGuests : 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-lg font-semibold">Total Net Sales in {currentMonthName}:</td>
                                        <td>&nbsp;</td>
                                        <td className="text-lg font-bold text-primary">{formatCurrency(currentMonthNetSales)}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-lg font-semibold">New Chubby Members in {currentMonthName}:</td>
                                        <td>&nbsp;</td>
                                        <td className="text-lg font-bold text-primary">{currentMonthNewChubbyMembers !== null ? currentMonthNewChubbyMembers : 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}
                     {!isLoading && !error && currentMonthTotalTables === null && currentMonthTotalGuests === null && currentMonthNetSales === null && currentMonthNewChubbyMembers === null && (
                        <p className="text-muted-foreground">No data available for {currentMonthName}.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    