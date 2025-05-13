
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import { saveReportToServer } from "@/actions/reportActions"; 
import { logUserActivity } from '@/actions/logActions'; // Import logging action

interface ReportFormProps {
  onSuccessfulSubmit: () => void;
  onGoBack: () => void;
}

export default function ReportForm({ onSuccessfulSubmit, onGoBack }: ReportFormProps) {
  const { toast } = useToast();

  // Sales Data Fields
  const [totalSales, setTotalSales] = useState<number>(0.00);
  const [netSales, setNetSales] = useState("");
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

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [formattedDate, setFormattedDate] = useState("Pick a date");

  const [shiftLead, setShiftLead] = useState("");
  const [totalTable, setTotalTable] = useState("");
  const [totalGuest, setTotalGuest] = useState("");

  const [salesPerGuest, setSalesPerGuest] = useState("0.00");
  const [totalAmountCancelled, setTotalAmountCancelled] = useState("");
  const [reasonForCancelled, setReasonForCancelled] = useState("");

  const [totalDiscount, setTotalDiscount] = useState("");
  const [nftValue, setNftValue] = useState("");
  const [otherValue, setOtherValue] = useState("");

  const [newChubbyMember, setNewChubbyMember] = useState("");
  const [chubbyPlus, setChubbyPlus] = useState("");
  const [chubbyOne, setChubbyOne] = useState("");
  const [totayTotalScan, setTotayTotalScan] = useState("");
  const [scanRate, setScanRate] = useState("0.00");
  const [totalMembersToToday, setTotalMembersToToday] = useState("");

  const [otherReasons, setOtherReasons] = useState<{ id: number; reason: string; value: string }[]>([]);
  const [nextReasonId, setNextReasonId] = useState(1);

  const [googleReviews, setGoogleReviews] = useState<number>(0);
  const [googleRatings, setGoogleRatings] = useState<number>(0);

  const [yelpReview, setYelpReview] = useState("");
  const [yelpRating, setYelpRating] = useState("");

    useEffect(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setDate(yesterday);
    }, []);

    useEffect(() => {
      const fetchGoogleReviews = async () => {
        const placeId = "ChIJZTsojhArw4ARTryXnAQbjqs";
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
        if (!apiKey) {
          console.error("Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.");
          toast({
              variant: "destructive",
              title: "API Key Missing",
              description: "Google Maps API key is not configured.",
          });
          return;
        }
        const url = `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount&key=${apiKey}`;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
            console.error("Error fetching Google reviews:", errorMessage);
            toast({
                variant: "destructive",
                title: "Google Review Fetch Error",
                description: `Could not fetch reviews: ${errorMessage}`,
            });
            setGoogleReviews(0);
            setGoogleRatings(0);
          } else {
            const data = await response.json();
            setGoogleRatings(data.rating || 0); 
            setGoogleReviews(data.userRatingCount || 0); 
          }
        } catch (fetchError) {
          console.error("Failed to fetch Google reviews:", fetchError);
           toast({
                variant: "destructive",
                title: "Network Error",
                description: "Failed to connect to Google Places API.",
            });
          setGoogleReviews(0);
          setGoogleRatings(0);
        }
      };
      fetchGoogleReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
  
  useEffect(() => {
    const num1 = parseFloat(alcoholSales);
    const num2 = parseFloat(netSales);
    const num3 = parseFloat(totalGuest);
    const num4 = parseFloat(creditCardTips);
    const num5 = parseFloat(cashTips);
    const num6 = parseFloat(totayTotalScan);
    const num7 = parseFloat(totalTable);

    setAlcoholSalesPercentage(
        (!isNaN(num1) && !isNaN(num2) && num2 !== 0) ? (num1 / num2 * 100).toFixed(2) : "0.00"
    );
    setAlcoholSalesPerGuest(
        (!isNaN(num1) && !isNaN(num3) && num3 !== 0) ? (num1 / num3).toFixed(2) : "0.00"
    );
    setTotalTips(
        (!isNaN(num4) && !isNaN(num5)) ? (num4 + num5).toFixed(2) : "0.00"
    );
    setTipsPercentage(
        (!isNaN(parseFloat(totalTips)) && !isNaN(num2) && num2 !== 0) ? (parseFloat(totalTips) / num2 * 100).toFixed(2) : "0.00"
    );
    setSalesPerGuest(
        (!isNaN(num2) && !isNaN(num3) && num3 !== 0) ? (num2 / num3).toFixed(2) : "0.00"
    );
    setScanRate(
        (!isNaN(num6) && !isNaN(num7) && num7 !== 0) ? (num6 / num7 * 100).toFixed(2) : "0.00"
    );
  }, [alcoholSales, netSales, totalGuest, creditCardTips, cashTips, totalTips, totayTotalScan, totalTable]);

  useEffect(() => {
    setFormattedDate(date ? format(date, "PPP") : "Pick a date");
  }, [date]);

  const generateReportText = () => {
      const formatValue = (value: string | number | undefined | null): string => {
          const strValue = String(value ?? '');
          if (strValue === "" || /^[0]+(\.0+)?$/.test(strValue)) {
            return "0";
          }
          return strValue;
      };

      const reportContent = `
      Daily Report:
      Date: ${formattedDate}
      Shift Lead: ${formatValue(shiftLead)}
      Total Table: ${formatValue(totalTable)}
      Total Guest: ${formatValue(totalGuest)}
      Total Sales: $${formatValue(totalSales)}
      Net Sales: $${formatValue(netSales)}
      Cash Sales: $${formatValue(cashSales)}
      Credit Card Sales: $${formatValue(creditCardSales)}
      Gift Card Sales: $${formatValue(giftCardSales)}
      Pre-paid Card Sales: $${formatValue(prepaidCardSales)}
      Online Sales: $${formatValue(onlineSales)}
      Alcohol Sales: $${formatValue(alcoholSales)}
      Alcohol Sales Percentage: ${alcoholSalesPercentage}%
      Alcohol Sales per guest: $${alcoholSalesPerGuest}
      Credit Card Tips: $${formatValue(creditCardTips)}
      Cash Tips: $${formatValue(cashTips)}
      Total Tips: $${formatValue(totalTips)}
      Tips Percentage: ${tipsPercentage}%
      Sales Per Guest: $${salesPerGuest}
      Total amount cancelled: $${formatValue(totalAmountCancelled)}
      Reason for cancelled: ${formatValue(reasonForCancelled)}
      New Chubby Member: ${formatValue(newChubbyMember)}
      Chubby plus: ${formatValue(chubbyPlus)}
      Chubby one: ${formatValue(chubbyOne)}
      Today total Scan: ${formatValue(totayTotalScan)}
      Scan Rate: ${scanRate}%
      Total Members to Today: ${formatValue(totalMembersToToday)}
      Total Discount: $${formatValue(totalDiscount)}
      NFT: $${formatValue(nftValue)}
      Other: $${formatValue(otherValue)}
      ${otherReasons.map(reason => `${formatValue(reason.reason)}: $${formatValue(reason.value)}`).join('\n')}
      
      Google Reviews: ${formatValue(googleReviews)} (${formatValue(googleRatings)} Stars)
      Yelp Reviews: ${formatValue(yelpReview)} (${formatValue(yelpRating)} Stars)
    `;

    const trimmedContent = reportContent
    .split('\n')            // Split into lines
    .map(line => line.trimStart())  // Trim leading spaces
    .join('\n'); 
      

    return trimmedContent
  };

  const handleGenerateReport = async () => {
    const report = generateReportText();
    const filename = `${formattedDate.replace(/ /g, '_').replace(/,/g, '')}.txt`;
    try {
        const blob = new Blob([report], { type: "text/plain;charset=utf-8" }); 
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({
            title: "Report Download Initiated",
            description: "Your daily report download has started.",
        });
    } catch (downloadError) {
        console.error("Error initiating download:", downloadError);
        toast({
            variant: "destructive",
            title: "Download Error",
            description: "Could not start the report download.",
        });
        return;
    }
  }
  
  const handleSubmitReport = async () => {
    const report = generateReportText();
    const filename = `${formattedDate.replace(/ /g, '_').replace(/,/g, '')}.txt`;
    try {
        const result = await saveReportToServer(report, filename);
        if (result.success) {
            toast({
                title: "Report Saved Successfully",
            });
            const username = sessionStorage.getItem('username');
            if (username && username !== "undefined" && result.filePath) {
              await logUserActivity(username, 'create', result.filePath.split('/').pop() || filename);
            }
            onSuccessfulSubmit(); // Call the callback
        } else {
            toast({
                variant: "destructive",
                title: "Server Save Failed",
                description: result.message,
            });
        }
    } catch (serverSaveError) {
        console.error("Error saving report to server:", serverSaveError);
        toast({
            variant: "destructive",
            title: "Server Save Error",
            description: serverSaveError instanceof Error ? serverSaveError.message : "An unexpected error occurred while saving to the server.",
        });
    }
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
    <>
    <Card className="w-full max-w-md space-y-4">
      <CardHeader>
        <CardTitle>Chubby Skewers Daily Report</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">

        <div className="flex flex-col space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal", 
                    !date && "text-muted-foreground"
                  )}
                >
                  <Icons.calendar className="mr-2 h-4 w-4 opacity-50" /> 
                  {formattedDate}
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
              className="w-full"
              value={shiftLead}
              onChange={(e) => setShiftLead(e.target.value)}
            />
          </div>


        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-2">
            <Label htmlFor="totalTable">Total Table:</Label>
            <Input
              id="totalTable"
              type="number" 
              className=""
              value={totalTable}
              onChange={(e) => setTotalTable(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="totalGuest">Total Guest:</Label>
            <Input
              id="totalGuest"
               type="number" 
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
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                 $
              </span>
              <Input
                id="totalSales"
                type="number" 
                step="0.01" 
                className="pl-7" 
                value={totalSales}
                onChange={(e) => setTotalSales(Number(e.target.value))}
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="netSales" className="justify-self-start">Net Sales</Label>
           <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="netSales"
                type="number"
                step="0.01"
                className="pl-7"
                value={netSales}
                onChange={(e) => setNetSales(e.target.value)}
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="cashSales" className="justify-self-start">Cash Sales</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="cashSales"
                type="number"
                step="0.01"
                className="pl-7"
                value={cashSales}
                onChange={(e) => setCashSales(e.target.value)}
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="creditCardSales" className="justify-self-start">Credit Card Sales</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="creditCardSales"
                type="number"
                step="0.01"
                className="pl-7"
                value={creditCardSales}
                onChange={(e) => setCreditCardSales(e.target.value)}
              />
          </div>
        </div>

         <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="giftCardSales" className="justify-self-start">Gift Card Sales</Label>
          <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                  id="giftCardSales"
                  type="number"
                  step="0.01"
                  className="pl-7"
                  value={giftCardSales}
                  onChange={(e) => setGiftCardSales(e.target.value)}
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="prepaidCardSales" className="justify-self-start">Pre-paid Card Sales</Label>
          <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                  id="prepaidCardSales"
                  type="number"
                  step="0.01"
                  className="pl-7"
                  value={prepaidCardSales}
                  onChange={(e) => setPrepaidCardSales(e.target.value)}
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="onlineSales" className="justify-self-start">Online Sales</Label>
          <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                  id="onlineSales"
                  type="number"
                  step="0.01"
                  className="pl-7"
                  value={onlineSales}
                  onChange={(e) => setOnlineSales(e.target.value)}

              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="alcoholSales" className="justify-self-start">Alcohol Sales</Label>
          <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="alcoholSales"
                type="number"
                step="0.01"
                className="pl-7"
                value={alcoholSales}
                onChange={(e) => setAlcoholSales(e.target.value)}
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="alcoholSalesPercentage" className="justify-self-start">Alcohol Sales Percentage</Label>
          <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  %
              </span>
              <Input
                id="alcoholSalesPercentage"
                className="pl-7"
                value={alcoholSalesPercentage}
                readOnly
              />

          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="alcoholSalesPerGuest" className="justify-self-start">Alcohol Sales per guest</Label>
          <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                  id="alcoholSalesPerGuest"
                  className="pl-7"
                  value={alcoholSalesPerGuest}
                  readOnly
              />
          </div>
        </div>

         <Separator/>

         <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="creditCardTips" className="justify-self-start">Credit Card Tips</Label>
          <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="creditCardTips"
                type="number"
                step="0.01"
                className="pl-7"
                value={creditCardTips}
                onChange={(e) => setCreditCardTips(e.target.value)}
              />
          </div>
        </div>

         <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="cashTips" className="justify-self-start">Cash Tips</Label>
           <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="cashTips"
                type="number"
                step="0.01"
                className="pl-7"
                value={cashTips}
                onChange={(e) => setCashTips(e.target.value)}
              />
          </div>
        </div>

         <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="totalTips" className="justify-self-start">Total Tips</Label>
          <div className="relative">
               <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="totalTips"
                className="pl-7"
                value={totalTips}
                readOnly
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="tipsPercentage" className="justify-self-start">Tips Percentage</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  %
            </span>
            <Input
              id="tipsPercentage"
              className="pl-7"
              value={tipsPercentage}
              readOnly
            />

          </div>
        </div>

        <Separator/>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="salesPerGuest" className="justify-self-start">Sales Per Guest:</Label>
           <div className="relative">
             <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
             </span>
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
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="totalAmountCancelled"
                type="number"
                step="0.01"
                className="pl-7"
                value={totalAmountCancelled}
                onChange={(e) => setTotalAmountCancelled(e.target.value)}
              />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="reasonForCancelled">Reason for cancelled:</Label>
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
                  type="number"
                  className=""
                  value={newChubbyMember}
                  onChange={(e) => setNewChubbyMember(e.target.value)}
              />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
              <Label htmlFor="chubbyPlus" className="justify-self-start">Chubby plus:</Label>
              <Input
                  id="chubbyPlus"
                  type="number"
                  className=""
                  value={chubbyPlus}
                  onChange={(e) => setChubbyPlus(e.target.value)}
              />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
              <Label htmlFor="chubbyOne" className="justify-self-start">Chubby one:</Label>
              <Input
                  id="chubbyOne"
                  type="number"
                  className=""
                  value={chubbyOne}
                  onChange={(e) => setChubbyOne(e.target.value)}
              />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
              <Label htmlFor="totayTotalScan" className="justify-self-start">Today total Scan:</Label>
              <Input
                  id="totayTotalScan"
                  type="number"
                  className=""
                  value={totayTotalScan}
                  onChange={(e) => setTotayTotalScan(e.target.value)}
              />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
              <Label htmlFor="scanRate" className="justify-self-start">Scan Rate:</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      %
                  </span>
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
                  type="number"
                  className=""
                  value={totalMembersToToday}
                  onChange={(e) => setTotalMembersToToday(e.target.value)}
              />
          </div>

        <Separator/>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="totalDiscount" className="justify-self-start">Total Discount:</Label>
           <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="totalDiscount"
                type="number"
                step="0.01"
                className="pl-7"
                value={totalDiscount}
                onChange={(e) => setTotalDiscount(e.target.value)}
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="nftValue" className="justify-self-start">NFT:</Label>
           <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="nftValue"
                type="number"
                step="0.01"
                className="pl-7"
                value={nftValue}
                onChange={(e) => setNftValue(e.target.value)}
              />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <Label htmlFor="otherValue" className="justify-self-start">Other:</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
              </span>
              <Input
                id="otherValue"
                type="number"
                step="0.01"
                className="pl-7"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
              />
          </div>
        </div>

        {otherReasons.map((reason) => (
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center" key={reason.id}> 

            <Input
              id={`otherReason-${reason.id}`}
              placeholder="Reason" 
              value={reason.reason}
              onChange={(e) => handleReasonChange(reason.id, e.target.value)}
            />
            <div className="relative"> 
               <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
               </span>
               <Input
                  id={`otherValue-${reason.id}`}
                  type="number"
                  step="0.01"
                  placeholder="Value" 
                  className="pl-7" 
                  value={reason.value}
                  onChange={(e) => handleValueChange(reason.id, e.target.value)}
                />
            </div>
            <Button type="button" onClick={() => handleRemoveReason(reason.id)} variant="destructive" size="sm">
              <Icons.trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex justify-center">
          <Button type="button" onClick={handleAddReason} > 
            More Discount
            <Icons.plus className="ml-2 h-4 w-4" /> 
          </Button>
        </div>
        <Separator/>

        <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor="googleReviewsLabel" className="justify-self-start">Google Review</Label>
            <div className="flex items-center"> 
              <Icons.star className="h-5 w-5 mr-1 text-yellow-500" /> 
              <Input
                  id="googleRatings"
                  className="pl-1" 
                  value={googleRatings.toString()}
                  readOnly
              />
            </div>
            <Input
                  id="googleReviews"
                  className="pl-1" 
                  value={googleReviews.toString()}
                  readOnly
              />
         </div>

         <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor="yelpReviewLabel" className="justify-self-start">Yelp Review</Label>
            <div className="flex items-center"> 
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-yelp mr-1 text-red-600" viewBox="0 0 16 16"> 
                  <path d="m4.188 10.095.736-.17.073-.02A.813.813 0 0 0 5.45 8.65a1 1 0 0 0-.3-.258 3 3 0 0 0-.428-.198l-.808-.295a76 76 0 0 0-1.364-.493C2.253 7.3 2 7.208 1.783 7.14c-.041-.013-.087-.025-.124-.038a2.1 2.1 0 0 0-.606-.116.72.72 0 0 0-.572.245 2 2 0 0 0-.105.132 1.6 1.6 0 0 0-.155.309c-.15.443-.225.908-.22 1.376.002.423.013.966.246 1.334a.8.8 0 0 0 .22.24c.166.114.333.129.507.141.26.019.513-.045.764-.103l2.447-.566zm8.219-3.911a4.2 4.2 0 0 0-.8-1.14 1.6 1.6 0 0 0-.275-.21 2 2 0 0 0-.15-.073.72.72 0 0 0-.621.031c-.142.07-.294.182-.496.37-.028.028-.063.06-.094.089-.167.156-.353.35-.574.575q-.51.516-1.01 1.042l-.598.62a3 3 0 0 0-.298.365 1 1 0 0 0-.157.364.8.8 0 0 0 .007.301q0 .007.003.013a.81.81 0 0 0 .945.616l.074-.014 3.185-.736c.251-.058.506-.112.732-.242.151-.088.295-.175.394-.35a.8.8 0 0 0 .093-.313c.05-.434-.178-.927-.36-1.308M6.706 7.523c.23-.29.23-.722.25-1.075.07-1.181.143-2.362.201-3.543.022-.448.07-.89.044-1.34-.022-.372-.025-.799-.26-1.104C6.528-.077 5.644-.033 5.04.05q-.278.038-.553.104a8 8 0 0 0-.543.149c-.58.19-1.393.537-1.53 1.204-.078.377.106.763.249 1.107.173.417.41.792.625 1.185.57 1.036 1.15 2.066 1.728 3.097.172.308.36.697.695.857q.033.015.068.025c.15.057.313.068.469.032l.028-.007a.8.8 0 0 0 .377-.226zm-.276 3.161a.74.74 0 0 0-.923-.234 1 1 0 0 0-.145.09 2 2 0 0 0-.346.354c-.026.033-.05.077-.08.104l-.512.705q-.435.591-.861 1.193c-.185.26-.346.479-.472.673l-.072.11c-.152.235-.238.406-.282.559a.7.7 0 0 0-.03.314c.013.11.05.217.108.312q.046.07.1.138a1.6 1.6 0 0 0 .257.237 4.5 4.5 0 0 0 2.196.76 1.6 1.6 0 0 0 .349-.027 2 2 0 0 0 .163-.048.8.8 0 0 0 .278-.178.7.7 0 0 0 .17-.266c.059-.147.098-.335.123-.613l.012-.13c.02-.231.03-.502.045-.821q.037-.735.06-1.469l.033-.87a2.1 2.1 0 0 0-.055-.623 1 1 0 0 0-.117-.27Zm5.783 1.362a2.2 2.2 0 0 0-.498-.378l-.112-.067c-.199-.12-.438-.246-.719-.398q-.644-.353-1.295-.695l-.767-.407c-.04-.012-.08-.04-.118-.059a2 2 0 0 0-.466-.166 1 1 0 0 0-.17-.018.74.74 0 0 0-.725.616 1 1 0 0 0 .01.293c.038.204.13.406.224.583l.41.768q.341.65.696 1.294c.152.28.28.52.398.719q.036.057.068.112c.145.239.261.39.379.497a.73.73 0 0 0 .596.201 2 2 0 0 0 .168-.029 1.6 1.6 0 0 0 .325-.129 4 4 0 0 0 .855-.64c.306-.3.577-.63.788-1.006q.045-.08.076-.165a2 2 0 0 0 .051-.161q.019-.083.029-.168a.8.8 0 0 0-.038-.327.7.7 0 0 0-.165-.27"/>
               </svg>
              <Input
                  id="yelpRating" 
                  type="number" 
                  step="0.1" 
                  className="pl-1" 
                  value={yelpRating}
                  onChange={(e) => setYelpRating(e.target.value)}
              />
            </div>
            <Input
                  id="yelpReview"
                  type="number" 
                  className="pl-1" 
                  value={yelpReview}
                  onChange={(e) => setYelpReview(e.target.value)}
              />
         </div>

        <Separator/>

        <div className="flex justify-center"> 
          <Button onClick={handleGenerateReport}>
            Generate Report <Icons.save className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center">
          <Button onClick={handleSubmitReport}>
            Submit Report <Icons.save className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center">
          <Button onClick={onGoBack}>Go Back</Button>
        </div>
      </CardContent>
    </Card>
    <Toaster />
    </>
  );
}
