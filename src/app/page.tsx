"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendEmail } from "@/services/email";
import { generatePdf } from "@/services/pdf";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { SummarizeReportOutput, summarizeReport } from "@/ai/flows/summarize-report";

export default function Home() {
  const [accomplishments, setAccomplishments] = useState("");
  const [challenges, setChallenges] = useState("");
  const [plans, setPlans] = useState("");
  const [reportSummary, setReportSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Sales Data Fields
  const [salesData1, setSalesData1] = useState("");
  const [salesData2, setSalesData2] = useState("");
  const [salesData3, setSalesData3] = useState("");
  const [salesData4, setSalesData4] = useState("");
  const [salesData5, setSalesData5] = useState("");
  const [salesData6, setSalesData6] = useState("");
  const [salesData7, setSalesData7] = useState("");
  const [salesData8, setSalesData8] = useState("");
  const [salesDataPercentage, setSalesDataPercentage] = useState("0.00");

  //New field
  const [date, setDate] = useState<Date | undefined>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });

  const [shiftLead, setShiftLead] = useState("");

  useEffect(() => {
    const num1 = parseFloat(salesData1);
    const num2 = parseFloat(salesData2);
    if (!isNaN(num1) && !isNaN(num2) && num2 !== 0) {
      setSalesDataPercentage((num1 / num2 * 100).toFixed(2));
    } else {
      setSalesDataPercentage("0.00");
    }
  }, [salesData1, salesData2]);

  const generateReportText = () => {
    return `
      Daily Report:
      Date: ${date ? format(date, "PPP") : "No date selected"}
      Shift Lead: ${shiftLead}
      Accomplishments: ${accomplishments}
      Challenges: ${challenges}
      Plans: ${plans}
    `;
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const reportText = generateReportText();
      const summaryResult = await summarizeReport({ reportText });
      setReportSummary(summaryResult.summary);
      toast({
        title: "Summary Generated!",
        description: "AI has summarized your report.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Generating Summary",
        description: "Failed to generate summary. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLocal = () => {
    const report = generateReportText();
    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "daily_report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({
      title: "Report saved locally!",
      description: "Your daily report has been saved as a text file.",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle>Chubby Skewers Daily Report</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-36 justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "PPP") : (
                        <span>Pick a date</span>
                      )}
                      <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      defaultMonth={date}
                      selected={date}
                      onSelect={setDate}
                      disabled={{after: new Date()}}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          
          
            <div className="grid gap-2">
              
                <Label htmlFor="shiftLead">Shift Lead: </Label>
                <Input
                  id="shiftLead"
                  placeholder="Enter shift lead name"
                  className="w-full"
                  value={shiftLead}
                  onChange={(e) => setShiftLead(e.target.value)}
                />
              
            </div>
          
          <div className="grid gap-2">
            <Label htmlFor="salesData1">Total Sales</Label>
            <Input
              id="salesData1"
              placeholder="Enter sales data 1"
              value={salesData1}
              onChange={(e) => setSalesData1(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="salesData2">Gross Sales</Label>
            <Input
              id="salesData2"
              placeholder="Enter sales data 2"
              value={salesData2}
              onChange={(e) => setSalesData2(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="salesDataPercentage">Alcohol Sales Percentage</Label>
            <Input
              id="salesDataPercentage"
              placeholder="Alcohol Sales Percentage"
              value={`${salesDataPercentage}%`}
              readOnly
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="salesData5">Alcohol Sales</Label>
            <Input
              id="salesData5"
              placeholder="Enter sales data 5"
              value={salesData5}
              onChange={(e) => setSalesData5(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="salesData3">Cash Sales</Label>
            <Input
              id="salesData3"
              placeholder="Enter sales data 3"
              value={salesData3}
              onChange={(e) => setSalesData3(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="salesData4">Credit Card Sales</Label>
            <Input
              id="salesData4"
              placeholder="Enter sales data 4"
              value={salesData4}
              onChange={(e) => setSalesData4(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="salesData6">Sales Data 6</Label>
            <Input
              id="salesData6"
              placeholder="Enter sales data 6"
              value={salesData6}
              onChange={(e) => setSalesData6(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="salesData7">Sales Data 7</Label>
            <Input
              id="salesData7"
              placeholder="Enter sales data 7"
              value={salesData7}
              onChange={(e) => setSalesData7(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="salesData8">Sales Data 8</Label>
            <Input
              id="salesData8"
              placeholder="Enter sales data 8"
              value={salesData8}
              onChange={(e) => setSalesData8(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accomplishments">Accomplishments</Label>
            <Textarea
              id="accomplishments"
              placeholder="List today's accomplishments"
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="challenges">Challenges</Label>
            <Textarea
              id="challenges"
              placeholder="List any challenges faced today"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="plans">Plans for Tomorrow</Label>
            <Textarea
              id="plans"
              placeholder="List plans for tomorrow"
              value={plans}
              onChange={(e) => setPlans(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="report-summary">Report Summary</Label>
            <Textarea
              id="report-summary"
              placeholder="Generated Report Summary"
              value={reportSummary}
              readOnly
            />
          </div>
          <div className="flex justify-between">
            <Button onClick={handleGenerateSummary} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  Generating...
                  <Icons.loader className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Generate Summary <Icons.sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <Button onClick={handleSaveLocal}>
              Save Locally <Icons.save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
