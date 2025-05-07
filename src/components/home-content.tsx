
"use client";
import { useState, useEffect } from 'react';
import { getSumOfMayTotalTables } from '@/actions/reportActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function HomeContent() {
    const [totalMayTables, setTotalMayTables] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTotalMayTables() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getSumOfMayTotalTables();
                if (result.success && typeof result.totalTables === 'number') {
                    setTotalMayTables(result.totalTables);
                } else {
                    setError(result.message || "Failed to fetch May total tables data.");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchTotalMayTables();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle>May Insights</CardTitle>
                    <CardDescription>Summary of key metrics from May reports.</CardDescription>
                </CardHeader>
                <CardContent>
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
                    {!isLoading && !error && totalMayTables !== null && (
                        <div>
                            <h3 className="text-lg font-semibold">Total Tables Served in May:</h3>
                            <p className="text-3xl font-bold text-primary">{totalMayTables}</p>
                        </div>
                    )}
                     {!isLoading && !error && totalMayTables === null && (
                        <p className="text-muted-foreground">No data available for May total tables.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
