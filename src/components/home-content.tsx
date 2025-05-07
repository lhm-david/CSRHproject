
"use client";
import { useState, useEffect } from 'react';
import { 
    getSumOfMayTotalTables,
    getSumOfMayTotalGuests,
    getSumOfMayNetSales,
    getSumOfMayNewChubbyMembers 
} from '@/actions/reportActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function HomeContent() {
    const [totalMayTables, setTotalMayTables] = useState<number | null>(null);
    const [totalMayGuests, setTotalMayGuests] = useState<number | null>(null);
    const [totalMayNetSales, setTotalMayNetSales] = useState<number | null>(null);
    const [totalMayNewChubbyMembers, setTotalMayNewChubbyMembers] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMayData() {
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
                    getSumOfMayTotalTables(),
                    getSumOfMayTotalGuests(),
                    getSumOfMayNetSales(),
                    getSumOfMayNewChubbyMembers()
                ]);

                if (tablesResult.success && typeof tablesResult.totalTables === 'number') {
                    setTotalMayTables(tablesResult.totalTables);
                } else {
                    errorMessages.push(tablesResult.message || "Failed to fetch May total tables data.");
                }

                if (guestsResult.success && typeof guestsResult.totalGuests === 'number') {
                    setTotalMayGuests(guestsResult.totalGuests);
                } else {
                    errorMessages.push(guestsResult.message || "Failed to fetch May total guests data.");
                }
                
                if (netSalesResult.success && typeof netSalesResult.totalNetSales === 'number') {
                    setTotalMayNetSales(netSalesResult.totalNetSales);
                } else {
                    errorMessages.push(netSalesResult.message || "Failed to fetch May net sales data.");
                }

                if (newMembersResult.success && typeof newMembersResult.totalNewChubbyMembers === 'number') {
                    setTotalMayNewChubbyMembers(newMembersResult.totalNewChubbyMembers);
                } else {
                    errorMessages.push(newMembersResult.message || "Failed to fetch May new chubby members data.");
                }

                if (errorMessages.length > 0) {
                    setError(errorMessages.join('\n'));
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching May data.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchMayData();
    }, []);

    const formatCurrency = (value: number | null) => {
        if (value === null) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-lg mx-auto shadow-lg"> {/* Increased max-width */}
                <CardHeader>
                    <CardTitle>May Insights</CardTitle>
                    <CardDescription>Summary of key metrics from May reports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4"> {/* Added space-y-4 for spacing between items */}
                    {isLoading && (
                        <div className="flex items-center justify-center p-4">
                            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-2 text-muted-foreground">Loading May data...</p>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="p-4 text-destructive bg-destructive/10 rounded-md">
                            <p>Error: {error}</p>
                        </div>
                    )}
                    {!isLoading && !error && (
                        <>
                            <div>
                                <h3 className="text-lg font-semibold">Total Tables Served in May:</h3>
                                <p className="text-3xl font-bold text-primary">{totalMayTables !== null ? totalMayTables : 'N/A'}</p>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold">Total Guests Served in May:</h3>
                                <p className="text-3xl font-bold text-primary">{totalMayGuests !== null ? totalMayGuests : 'N/A'}</p>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold">Total Net Sales in May:</h3>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(totalMayNetSales)}</p>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold">New Chubby Members in May:</h3>
                                <p className="text-3xl font-bold text-primary">{totalMayNewChubbyMembers !== null ? totalMayNewChubbyMembers : 'N/A'}</p>
                            </div>
                        </>
                    )}
                     {!isLoading && !error && totalMayTables === null && totalMayGuests === null && totalMayNetSales === null && totalMayNewChubbyMembers === null && (
                        <p className="text-muted-foreground">No data available for May.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
