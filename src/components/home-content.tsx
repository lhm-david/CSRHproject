
"use client";
import { useState, useEffect } from 'react';
import { 
    getSumOfCurrentMonthTotalTables,
    getSumOfCurrentMonthTotalGuests,
    getSumOfCurrentMonthNetSales,
    getSumOfCurrentMonthNewChubbyMembers,
    getNetSalesByMonthForAllMonths, // Import the new action
    type MonthlySalesData
} from '@/actions/reportActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Using recharts directly as per package.json
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";


export default function HomeContent() {
    const [currentMonthTotalTables, setCurrentMonthTotalTables] = useState<number | null>(null);
    const [currentMonthTotalGuests, setCurrentMonthTotalGuests] = useState<number | null>(null);
    const [currentMonthNetSales, setCurrentMonthNetSales] = useState<number | null>(null);
    const [currentMonthNewChubbyMembers, setCurrentMonthNewChubbyMembers] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonthName, setCurrentMonthName] = useState<string>("");

    const [monthlySalesChartData, setMonthlySalesChartData] = useState<MonthlySalesData[]>([]);
    const [isChartLoading, setIsChartLoading] = useState(true);
    const [chartError, setChartError] = useState<string | null>(null);

    useEffect(() => {
        setCurrentMonthName(format(new Date(), 'MMMM'));
        async function fetchAllData() {
            setIsLoading(true);
            setIsChartLoading(true);
            setError(null);
            setChartError(null);
            
            let insightErrorMessages: string[] = [];

            try {
                // Fetch current month insights
                const [
                    tablesResult,
                    guestsResult,
                    netSalesResult,
                    newMembersResult,
                    monthlySalesResult
                ] = await Promise.all([
                    getSumOfCurrentMonthTotalTables(),
                    getSumOfCurrentMonthTotalGuests(),
                    getSumOfCurrentMonthNetSales(),
                    getSumOfCurrentMonthNewChubbyMembers(),
                    getNetSalesByMonthForAllMonths() // Fetch chart data
                ]);

                if (tablesResult.success && typeof tablesResult.total === 'number') {
                    setCurrentMonthTotalTables(tablesResult.total);
                } else {
                    insightErrorMessages.push(tablesResult.message || `Failed to fetch ${currentMonthName} total tables data.`);
                }

                if (guestsResult.success && typeof guestsResult.total === 'number') {
                    setCurrentMonthTotalGuests(guestsResult.total);
                } else {
                    insightErrorMessages.push(guestsResult.message || `Failed to fetch ${currentMonthName} total guests data.`);
                }
                
                if (netSalesResult.success && typeof netSalesResult.total === 'number') {
                    setCurrentMonthNetSales(netSalesResult.total);
                } else {
                    insightErrorMessages.push(netSalesResult.message || `Failed to fetch ${currentMonthName} net sales data.`);
                }

                if (newMembersResult.success && typeof newMembersResult.total === 'number') {
                    setCurrentMonthNewChubbyMembers(newMembersResult.total);
                } else {
                    insightErrorMessages.push(newMembersResult.message || `Failed to fetch ${currentMonthName} new chubby members data.`);
                }

                if (insightErrorMessages.length > 0) {
                    setError(insightErrorMessages.join('\n'));
                }

                // Process monthly sales chart data
                if (monthlySalesResult.success && monthlySalesResult.data) {
                    setMonthlySalesChartData(monthlySalesResult.data);
                } else {
                    setChartError(monthlySalesResult.message || 'Failed to fetch monthly sales data.');
                }

            } catch (err) {
                const commonError = err instanceof Error ? err.message : `An unexpected error occurred.`;
                setError(commonError);
                setChartError(commonError);
            } finally {
                setIsLoading(false);
                setIsChartLoading(false);
            }
        }
        fetchAllData();
    }, [currentMonthName]); // currentMonthName dependency will re-run if it changes, though it's set once.

    const formatCurrency = (value: number | null) => {
        if (value === null) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    const chartConfig = {
      netSales: {
        label: "Net Sales",
        color: "hsl(var(--chart-1))",
      },
    } satisfies ChartConfig;


    return (
        <div className="container mx-auto p-4 space-y-6">
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
                            <table className="table w-full">
                                <tbody>
                                    <tr>
                                        <td className="text-lg font-semibold">Total Tables Served in {currentMonthName}:</td>
                                        <td>&nbsp;</td>
                                        <td className="text-lg font-bold text-primary text-right">{currentMonthTotalTables !== null ? currentMonthTotalTables : 'N/A'}</td>

                                    </tr>
                                    <tr>
                                        <td className="text-lg font-semibold">Total Guests Served in {currentMonthName}:</td>
                                        <td>&nbsp;</td>
                                        <td className="text-lg font-bold text-primary text-right">{currentMonthTotalGuests !== null ? currentMonthTotalGuests : 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-lg font-semibold">Total Net Sales in {currentMonthName}:</td>
                                        <td>&nbsp;</td>
                                        <td className="text-lg font-bold text-primary text-right">{formatCurrency(currentMonthNetSales)}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-lg font-semibold">New Chubby Members in {currentMonthName}:</td>
                                        <td>&nbsp;</td>
                                        <td className="text-lg font-bold text-primary text-right">{currentMonthNewChubbyMembers !== null ? currentMonthNewChubbyMembers : 'N/A'}</td>
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

            <Card className="w-full max-w-3xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle>Monthly Net Sales ({new Date().getFullYear()})</CardTitle>
                    <CardDescription>Total net sales for each month of the current year.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isChartLoading && (
                        <div className="flex items-center justify-center p-10">
                            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-2 text-muted-foreground">Loading chart data...</p>
                        </div>
                    )}
                    {chartError && !isChartLoading && (
                        <div className="p-4 text-destructive bg-destructive/10 rounded-md">
                            <p>Error loading chart: {chartError}</p>
                        </div>
                    )}
                    {!isChartLoading && !chartError && monthlySalesChartData.length > 0 && (
                         <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <BarChart accessibilityLayer data={monthlySalesChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="shortMonth"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    // tickFormatter={(value) => value.slice(0, 3)} // Use shortMonth directly
                                />
                                <YAxis 
                                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Legend />
                                <Bar dataKey="netSales" fill="var(--color-netSales)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    )}
                    {!isChartLoading && !chartError && monthlySalesChartData.length === 0 && (
                        <p className="text-muted-foreground text-center p-10">No sales data available to display the chart.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    