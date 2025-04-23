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
    const [scanRate, setScanRate] = useState("0.00");
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
    const num7 = parseFloat(totayTotalScan);
    const num8 = parseFloat(totalTable);


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

    if (!isNaN(num7) && !isNaN(num8) && num8 !== 0) {
      setScanRate((num7 / num8).toFixed(2));
    } else {
      setScanRate("0.00");
    }


  }, [alcoholSales, grossSales, totalGuest, creditCardTips, cashTips, totalTips, totayTotalScan, totalTable]);

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
            <div className="flex flex-col space-y-2">
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
                className=""
                value={totalTable}
                onChange={(e) => setTotalTable(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="totalGuest">Total Guest:</Label>
              <Input
                id="totalGuest"
                className=""
                value={totalGuest}
                onChange={(e) => setTotalGuest(e.target.value)}
              />
            </div>
          </div>

          <Separator/>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="totalSales" className="justify-self-start">Total Sales</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="totalSales"
                  className="pl-7"
                  value={totalSales}
                  onChange={(e) => setTotalSales(e.target.value)}
                />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="grossSales" className="justify-self-start">Gross Sales</Label>
             <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="grossSales"
                  className="pl-7"
                  value={grossSales}
                  onChange={(e) => setGrossSales(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="cashSales" className="justify-self-start">Cash Sales</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="cashSales"
                  className="pl-7"
                  value={cashSales}
                  onChange={(e) => setCashSales(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="creditCardSales" className="justify-self-start">Credit Card Sales</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="creditCardSales"
                  className="pl-7"
                  value={creditCardSales}
                  onChange={(e) => setCreditCardSales(e.target.value)}
                />
            </div>
          </div>

           <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="giftCardSales" className="justify-self-start">Gift Card Sales</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                    id="giftCardSales"
                    className="pl-7"
                    value={giftCardSales}
                    onChange={(e) => setGiftCardSales(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="prepaidCardSales" className="justify-self-start">Pre-paid Card Sales</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                    id="prepaidCardSales"
                    className="pl-7"
                    value={prepaidCardSales}
                    onChange={(e) => setPrepaidCardSales(e.target.value)}
                />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="onlineSales" className="justify-self-start">Online Sales</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                    id="onlineSales"
                    className="pl-7"
                    value={onlineSales}
                    onChange={(e) => setOnlineSales(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="creditCardSales" className="justify-self-start">Alcohol Sales</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="alcoholSales"
                  className="pl-7"
                  value={alcoholSales}
                  onChange={(e) => setAlcoholSales(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="alcoholSalesPercentage" className="justify-self-start">Alcohol Sales Percentage</Label>
             <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  %
                </div>
                <Input
                  id="alcoholSalesPercentage"
                  className="pl-7"
                  value={` ${alcoholSalesPercentage}%`}
                  readOnly
                />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="alcoholSalesPercentage" className="justify-self-start">Alcohol Sales per guest</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                    id="alcoholSalesPercentage"
                    className="pl-7"
                    value={`${alcoholSalesPerGuest}`}
                    readOnly
                />
            </div>
          </div>
          
           <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="creditCardTips" className="justify-self-start">Credit Card Tips</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="creditCardTips"
                  className="pl-7"
                  value={creditCardTips}
                  onChange={(e) => setCreditCardTips(e.target.value)}
                />
            </div>
          </div>
          
           <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="cashTips" className="justify-self-start">Cash Tips</Label>
             <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="cashTips"
                  className="pl-7"
                  value={cashTips}
                  onChange={(e) => setCashTips(e.target.value)}
                />
            </div>
          </div>

           <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="totalTips" className="justify-self-start">Total Tips</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="totalTips"
                  className="pl-7"
                  value={`${totalTips}`}
                  readOnly
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="tipsPercentage" className="justify-self-start">Tips Percentage</Label>
            <Input
              id="tipsPercentage"
              className=""
              value={`${tipsPercentage}%`}
              readOnly
            />
          </div>
          
          <Separator/>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="salesPerGuest" className="justify-self-start">Sales Per Guest:</Label>
             <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="salesPerGuest"
                  className="pl-7"
                  value={salesPerGuest}
                  readOnly
                />
            </div>
          </div>

           <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="totalAmountCancelled" className="justify-self-start">Total amount cancelled:</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="totalAmountCancelled"
                  className="pl-7"
                  value={totalAmountCancelled}
                  onChange={(e) => setTotalAmountCancelled(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="reasonForCancelled" className="justify-self-start">Reason for cancelled:</Label>
            <Textarea
              id="reasonForCancelled"
              className=""
              value={reasonForCancelled}
              onChange={(e) => setReasonForCancelled(e.target.value)}
            />
          </div>

          <Separator/>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="newChubbyMember" className="justify-self-start">New Chubby Member:</Label>
                <Input
                    id="newChubbyMember"
                    className=""
                    value={newChubbyMember}
                    onChange={(e) => setNewChubbyMember(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="chubbyPlus" className="justify-self-start">Chubby plus:</Label>
                <Input
                    id="chubbyPlus"
                    className=""
                    value={chubbyPlus}
                    onChange={(e) => setChubbyPlus(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="chubbyOne" className="justify-self-start">Chubby one:</Label>
                <Input
                    id="chubbyOne"
                    className=""
                    value={chubbyOne}
                    onChange={(e) => setChubbyOne(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="totayTotalScan" className="justify-self-start">Today total Scan:</Label>
                <Input
                    id="totayTotalScan"
                    className=""
                    value={totayTotalScan}
                    onChange={(e) => setTotayTotalScan(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="scanRate" className="justify-self-start">Scan Rate:</Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        %
                    </div>
                    <Input
                        id="scanRate"
                        className="pl-7"
                        value={scanRate}
                        readOnly
                    />
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="totalMembersToToday" className="justify-self-start">Total Members to Today:</Label>
                <Input
                    id="totalMembersToToday"
                    className=""
                    value={totalMembersToToday}
                    onChange={(e) => setTotalMembersToToday(e.target.value)}
                />
            </div>

          <Separator/>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="totalDiscount" className="justify-self-start">Total Discount:</Label>
             <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="totalDiscount"
                  className="pl-7"
                  value={totalDiscount}
                  onChange={(e) => setTotalDiscount(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="nftValue" className="justify-self-start">NFT:</Label>
             <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="nftValue"
                  className="pl-7"
                  value={nftValue}
                  onChange={(e) => setNftValue(e.target.value)}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor="otherValue" className="justify-self-start">Other:</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                </div>
                <Input
                  id="otherValue"
                  className="pl-7"
                  value={otherValue}
                  onChange={(e) => setOtherValue(e.target.value)}
                />
            </div>
          </div>

          {otherReasons.map((reason, index) => (
            <div className="grid grid-cols-3 gap-2" key={reason.id}>
              
              <div className="grid gap-2">
                <Input
                  id={`otherReason-${reason.id}`}
                  value={reason.reason}
                  onChange={(e) => handleReasonChange(reason.id, e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Input
                  id={`otherValue-${reason.id}`}
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


