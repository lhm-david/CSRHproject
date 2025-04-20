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
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [accomplishments, setAccomplishments] = useState("");
  const [challenges, setChallenges] = useState("");
  const [plans, setPlans] = useState("");
  const [reportSummary, setReportSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Sales Data Fields
  const [totalSales, setTotalSales] = useState("");
  const [grossSales, setGrossSales] = useState("");
  const [cashSales, setCashSales] = useState("");
  const [creditCardSales, setCreditCardSales] = useState("");
  const [alcoholSales, setAlcoholSales] = useState("");
  const [alcoholSalesPercentage, setAlcoholSalesPercentage] = useState("0.00");
  const [alcoholSalesPerGuest, setAlcoholSalesPerGuest] = useState("0.00");
  const [creditCardTips, setCreditCardTips] = useState("");
  const [cashTips, setCashTips] = useState("");
  const [totalTips, setTotalTips] = useState("0.00");
  const [tipsPercentage, setTipsPercentage] = useState("0.00");

  //New Sales Data Fields
  const [giftCardSales, setGiftCardSales] = useState("");
  const [prepaidCardSales, setPrepaidCardSales] = useState("");
  const [onlineSales, setOnlineSales] = useState("");

  //New field
  const [date, setDate] = useState<Date | undefined>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });
  const [formattedDate, setFormattedDate] = useState(date ? format(date, "PPP") : "Pick a date");

  const [shiftLead, setShiftLead] = useState("");
  const [totalTable, setTotalTable] = useState("");
  const [totalGuest, setTotalGuest] = useState("");

  //New Input Fields
  const [salesPerGuest, setSalesPerGuest] = useState("");
  const [totalAmountCancelled, setTotalAmountCancelled] = useState("");
  const [reasonForCancelled, setReasonForCancelled] = useState("");

  useEffect(() => {
    const num1 = parseFloat(alcoholSales);
    const num2 = parseFloat(grossSales);
    const num3 = parseFloat(totalGuest);
    const num4 = parseFloat(creditCardTips);
    const num5 = parseFloat(cashTips);
    const num6 = parseFloat(totalTips);

    if (!isNaN(num1) && !isNaN(num2) && num2 !== 0) {
      setAlcoholSalesPercentage((num1 / num2 * 100).toFixed(2));
    } else {
      setAlcoholSalesPercentage("0.00");
    }

    if (!isNaN(num1) && !isNaN(num3) && num3 !== 0) {
      setAlcoholSalesPerGuest((num1 / num3).toFixed(2));
    } else {
      setAlcoholSalesPerGuest("0.00");
    }

    if (!isNaN(num4) && !isNaN(num5)) {
      setTotalTips((num4 + num5).toFixed(2));
    } else {
      setTotalTips("0.00");
    }

    if (!isNaN(num6) && !isNaN(num2) && num2 !== 0) {
      setTipsPercentage((num6 / num2 * 100).toFixed(2));
    } else {
      setTipsPercentage("0.00");
    }

    if (!isNaN(num2) && !isNaN(num3) && num3 !== 0) {
      setSalesPerGuest((num2 / num3).toFixed(2));
    } else {
      setSalesPerGuest("0.00");
    }


  }, [alcoholSales, grossSales, totalGuest, creditCardTips, cashTips, totalTips]);

  useEffect(() => {
    setFormattedDate(date ? format(date, "PPP") : "Pick a date");
  }, [date]);

  const generateReportText = () => {
    return `
      Daily Report:
      Date: ${formattedDate}
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
          
          <div className="grid grid-cols-2 gap-2">
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
                    {formattedDate}
                    <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={date}
                    selected={date}
                    onSelect={setDate}
                    disabled={{ after: new Date() }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shiftLead">Shift Lead:</Label>
              <Input
                id="shiftLead"
                placeholder="Enter shift lead name"
                className="w-full"
                value={shiftLead}
                onChange={(e) => setShiftLead(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="totalTable">Total Table:</Label>
              <Input
                id="totalTable"
                placeholder="Enter total tables"
                value={totalTable}
                onChange={(e) => setTotalTable(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="totalGuest">Total Guest:</Label>
              <Input
                id="totalGuest"
                placeholder="Enter total guests"
                value={totalGuest}
                onChange={(e) => setTotalGuest(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="totalSales">Total Sales</Label>
            <Input
              id="totalSales"
              placeholder="Enter total sales"
              value={totalSales}
              onChange={(e) => setTotalSales(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="grossSales">Gross Sales</Label>
            <Input
              id="grossSales"
              placeholder="Enter gross sales"
              value={grossSales}
              onChange={(e) => setGrossSales(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cashSales">Cash Sales</Label>
            <Input
              id="cashSales"
              placeholder="Enter cash sales"
              value={cashSales}
              onChange={(e) => setCashSales(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="creditCardSales">Credit Card Sales</Label>
            <Input
              id="creditCardSales"
              placeholder="Enter credit card sales"
              value={creditCardSales}
              onChange={(e) => setCreditCardSales(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="giftCardSales">Gift Card Sales</Label>
            <Input
              id="giftCardSales"
              placeholder="Enter gift card sales"
              value={giftCardSales}
              onChange={(e) => setGiftCardSales(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prepaidCardSales">Pre-paid Card Sales</Label>
            <Input
              id="prepaidCardSales"
              placeholder="Enter pre-paid card sales"
              value={prepaidCardSales}
              onChange={(e) => setPrepaidCardSales(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="onlineSales">Online Sales</Label>
            <Input
              id="onlineSales"
              placeholder="Enter online sales"
              value={onlineSales}
              onChange={(e) => setOnlineSales(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="alcoholSales">Alcohol Sales</Label>
            <Input
              id="alcoholSales"
              placeholder="Enter alcohol sales"
              value={alcoholSales}
              onChange={(e) => setAlcoholSales(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="alcoholSalesPercentage">Alcohol Sales per guest</Label>
            <Input
              id="alcoholSalesPercentage"
              placeholder="Alcohol Sales per guest"
              value={`${alcoholSalesPerGuest}`}
              readOnly
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="alcoholSalesPercentage">Alcohol Sales Percentage</Label>
            <Input
              id="alcoholSalesPercentage"
              placeholder="Alcohol Sales Percentage"
              value={`${alcoholSalesPercentage}`}
              readOnly
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="creditCardTips">Credit Card Tips</Label>
            <Input
              id="creditCardTips"
              placeholder="Enter sales data 7"
              value={creditCardTips}
              onChange={(e) => setCreditCardTips(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cashTips">Cash Tips</Label>
            <Input
              id="cashTips"
              placeholder="Enter sales data 8"
              value={cashTips}
              onChange={(e) => setCashTips(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="totalTips">Total Tips</Label>
            <Input
              id="totalTips"
              placeholder="Total tips"
              value={`${totalTips}`}
              readOnly
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tipsPercentage">Tips Percentage</Label>
            <Input
              id="tipsPercentage"
              placeholder="Tips Percentage"
              value={`${tipsPercentage}`}
              readOnly
            />
          </div>
          
          <Separator/>
          <div className="grid gap-2">
            <Label htmlFor="salesPerGuest">Sales Per Guest:</Label>
            <Input
              id="salesPerGuest"
              placeholder="Sales Per Guest"
              value={salesPerGuest}
              readOnly
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="totalAmountCancelled">Total amount cancelled:</Label>
            <Input
              id="totalAmountCancelled"
              placeholder="Enter total amount cancelled"
              value={totalAmountCancelled}
              onChange={(e) => setTotalAmountCancelled(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reasonForCancelled">Reason for cancelled:</Label>
            <Textarea
              id="reasonForCancelled"
              placeholder="Enter reason for cancelled"
              value={reasonForCancelled}
              onChange={(e) => setReasonForCancelled(e.target.value)}
            />
          </div>

          <Separator/>
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
          <Separator/>
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
