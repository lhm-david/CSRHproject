"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendEmail } from "@/services/email";
import { generatePdf } from "@/services/pdf";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { summarizeReport } from "@/ai/flows/summarize-report";

export default function Home() {
  const [accomplishments, setAccomplishments] = useState("");
  const [challenges, setChallenges] = useState("");
  const [plans, setPlans] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReportText = () => {
    return `
      Daily Report:
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
          <CardTitle>Daily Docket</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
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
