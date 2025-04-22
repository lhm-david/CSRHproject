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

  //Discount Fields
  const [totalDiscount, setTotalDiscount] = useState("");
  const [nftValue, setNftValue] = useState("");
  const [otherValue, setOtherValue] = useState("");

    // Chubby Member
    const [newChubbyMember, setNewChubbyMember] = useState("");
    const [chubbyPlus, setChubbyPlus] = useState("");
    const [chubbyOne, setChubbyOne] = useState("");
    const [totayTotalScan, setTotayTotalScan] = useState("");
    const [scanRate, setScanRate] = useState("");
    const [totalMembersToToday, setTotalMembersToToday] = useState("");

  // Dynamic Input Fields
  const [otherReasons, setOtherReasons] = useState<{ id: number; reason: string; value: string }[]>([]);
  const [nextReasonId, setNextReasonId] = useState(1);

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

  const handleAddReason = () => {
    setOtherReasons([...otherReasons, { id: nextReasonId, reason: "", value: "" }]);
    setNextReasonId(nextReasonId + 1);
  };

  const handleReasonChange = (id: number, reason: string) => {
    setOtherReasons(
      otherReasons.map((item) =>
        item.id === id ? { ...item, reason } : item
      )
    );
  };

  const handleValueChange = (id: number, value: string) => {
    setOtherReasons(
      otherReasons.map((item) =>
        item.id === id ? { ...item, value } : item
      )
    );
  };

  const handleRemoveReason = (id: number) => {
    setOtherReasons(otherReasons.filter((reason) => reason.id !== id));
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
                className="w-full text-right"
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
                className="text-right"
                value={totalTable}
                onChange={(e) => setTotalTable(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="totalGuest">Total Guest:</Label>
              <Input
                id="totalGuest"
                placeholder="Enter total guests"
                className="text-right"
                value={totalGuest}
                onChange={(e) => setTotalGuest(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="totalSales" className="justify-self-start">Total Sales</Label>
            <Input
              id="totalSales"
              placeholder="Enter total sales"
              className="text-right justify-self-end"
              value={totalSales}
              onChange={(e) => setTotalSales(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="grossSales" className="justify-self-start">Gross Sales</Label>
            <Input
              id="grossSales"
              placeholder="Enter gross sales"
              className="text-right justify-self-end"
              value={grossSales}
              onChange={(e) => setGrossSales(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="cashSales" className="justify-self-start">Cash Sales</Label>
            <Input
              id="cashSales"
              placeholder="Enter cash sales"
              className="text-right justify-self-end"
              value={cashSales}
              onChange={(e) => setCashSales(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="creditCardSales" className="justify-self-start">Credit Card Sales</Label>
            <Input
              id="creditCardSales"
              placeholder="Enter credit card sales"
              className="text-right justify-self-end"
              value={creditCardSales}
              onChange={(e) => setCreditCardSales(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="giftCardSales" className="justify-self-start">Gift Card Sales</Label>
            <Input
              id="giftCardSales"
              placeholder="Enter gift card sales"
              className="text-right justify-self-end"
              value={giftCardSales}
              onChange={(e) => setGiftCardSales(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="prepaidCardSales" className="justify-self-start">Pre-paid Card Sales</Label>
            <Input
              id="prepaidCardSales"
              placeholder="Enter prepaid card sales"
              className="text-right justify-self-end"
              value={prepaidCardSales}
              onChange={(e) => setPrepaidCardSales(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="onlineSales" className="justify-self-start">Online Sales</Label>
            <Input
              id="onlineSales"
              placeholder="Enter online sales"
              className="text-right justify-self-end"
              value={onlineSales}
              onChange={(e) => setOnlineSales(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="alcoholSales" className="justify-self-start">Alcohol Sales</Label>
            <Input
              id="alcoholSales"
              placeholder="Enter alcohol sales"
              className="text-right justify-self-end"
              value={alcoholSales}
              onChange={(e) => setAlcoholSales(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="alcoholSalesPercentage" className="justify-self-start">Alcohol Sales Percentage</Label>
            <Input
              id="alcoholSalesPercentage"
              placeholder="Alcohol Sales Percentage"
              className="text-right justify-self-end"
              value={`${alcoholSalesPercentage}`}
              readOnly
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="alcoholSalesPercentage" className="justify-self-start">Alcohol Sales per guest</Label>
            <Input
              id="alcoholSalesPercentage"
              placeholder="Alcohol Sales per guest"
              className="text-right justify-self-end"
              value={`${alcoholSalesPerGuest}`}
              readOnly
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="creditCardTips" className="justify-self-start">Credit Card Tips</Label>
            <Input
              id="creditCardTips"
              placeholder="Enter sales data 7"
              className="text-right justify-self-end"
              value={creditCardTips}
              onChange={(e) => setCreditCardTips(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="cashTips" className="justify-self-start">Cash Tips</Label>
            <Input
              id="cashTips"
              placeholder="Enter sales data 8"
              className="text-right justify-self-end"
              value={cashTips}
              onChange={(e) => setCashTips(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="totalTips" className="justify-self-start">Total Tips</Label>
            <Input
              id="totalTips"
              placeholder="Total tips"
              className="text-right justify-self-end"
              value={`${totalTips}`}
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="tipsPercentage" className="justify-self-start">Tips Percentage</Label>
            <Input
              id="tipsPercentage"
              placeholder="Tips Percentage"
              className="text-right justify-self-end"
              value={`${tipsPercentage}`}
              readOnly
            />
          </div>
          
          <Separator/>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="salesPerGuest" className="justify-self-start">Sales Per Guest:</Label>
            <Input
              id="salesPerGuest"
              placeholder="Sales Per Guest"
              className="text-right justify-self-end"
              value={salesPerGuest}
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="totalAmountCancelled" className="justify-self-start">Total amount cancelled:</Label>
            <Input
              id="totalAmountCancelled"
              placeholder="Enter total amount cancelled"
              className="text-right justify-self-end"
              value={totalAmountCancelled}
              onChange={(e) => setTotalAmountCancelled(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="reasonForCancelled" className="justify-self-start">Reason for cancelled:</Label>
            <Textarea
              id="reasonForCancelled"
              placeholder="Enter reason for cancelled"
              className="text-right justify-self-end"
              value={reasonForCancelled}
              onChange={(e) => setReasonForCancelled(e.target.value)}
            />
          </div>

          <Separator/>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="newChubbyMember" className="justify-self-start">New Chubby Member:</Label>
                <Input
                    id="newChubbyMember"
                    placeholder="Enter new chubby member"
                    className="text-right justify-self-end"
                    value={newChubbyMember}
                    onChange={(e) => setNewChubbyMember(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="chubbyPlus" className="justify-self-start">Chubby plus:</Label>
                <Input
                    id="chubbyPlus"
                    placeholder="Enter chubby plus"
                    className="text-right justify-self-end"
                    value={chubbyPlus}
                    onChange={(e) => setChubbyPlus(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="chubbyOne" className="justify-self-start">Chubby one:</Label>
                <Input
                    id="chubbyOne"
                    placeholder="Enter chubby one"
                    className="text-right justify-self-end"
                    value={chubbyOne}
                    onChange={(e) => setChubbyOne(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="totayTotalScan" className="justify-self-start">Today total Scan:</Label>
                <Input
                    id="totayTotalScan"
                    placeholder="Enter today total scan"
                    className="text-right justify-self-end"
                    value={totayTotalScan}
                    onChange={(e) => setTotayTotalScan(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="scanRate" className="justify-self-start">Scan Rate:</Label>
                <Input
                    id="scanRate"
                    placeholder="Enter scan rate"
                    className="text-right justify-self-end"
                    value={scanRate}
                    onChange={(e) => setScanRate(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="totalMembersToToday" className="justify-self-start">Total Members to Today:</Label>
                <Input
                    id="totalMembersToToday"
                    placeholder="Enter total members to today"
                    className="text-right justify-self-end"
                    value={totalMembersToToday}
                    onChange={(e) => setTotalMembersToToday(e.target.value)}
                />
            </div>

          <Separator/>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="totalDiscount" className="justify-self-start">Total Discount:</Label>
            <Input
              id="totalDiscount"
              placeholder="Enter total discount"
              className="text-right justify-self-end"
              value={totalDiscount}
              onChange={(e) => setTotalDiscount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="nftValue" className="justify-self-start">NFT:</Label>
            <Input
              id="nftValue"
              placeholder="Enter NFT value"
              className="text-right justify-self-end"
              value={nftValue}
              onChange={(e) => setNftValue(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="otherValue" className="justify-self-start">Other:</Label>
            <Input
              id="otherValue"
              placeholder="Enter other value"
              className="text-right justify-self-end"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
            />
          </div>

          {otherReasons.map((reason, index) => (
            <div className="grid grid-cols-3 gap-2" key={reason.id}>
              
              <div className="grid gap-2">
                <Input
                  id={`otherReason-${reason.id}`}
                  placeholder="Enter reason"
                  value={reason.reason}
                  onChange={(e) => handleReasonChange(reason.id, e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Input
                  id={`otherValue-${reason.id}`}
                  placeholder="Enter value"
                  value={reason.value}
                  onChange={(e) => handleValueChange(reason.id, e.target.value)}
                />
              </div>
              <Button type="button" onClick={() => handleRemoveReason(reason.id)} variant="destructive" size="sm">
                <Icons.trash className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button type="button" onClick={handleAddReason} className="w-full">
            Add Reason
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>

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
