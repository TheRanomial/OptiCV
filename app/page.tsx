/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Moon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ReportComponent from "@/components/ResumeComponent";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ChatComponent from "@/components/ChatComponent";

export default function ResumeAnalyzer() {
  const [isDark, setIsDark] = useState(false);
  const [resumeAdded, setResumeAdded] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const [reportData, setreportData] = useState("");
  const onReportConfirmation = (data: string) => {
    setreportData(data);
    console.log(reportData);
    toast({
      title: "Updated",
    });
  };

  return (
    <div className={`min-h-screen bg-gray-100 bg-background ${isDark ? "dark" : ""}`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {/* Add your logo here */}
            <img
              src="/cv.svg" // Replace with your logo path
              alt="OptiCV Logo"
              className="h-8 w-8"
            />
            <h1
              className={`text-3xl font-extrabold tracking-tight ${
                isDark
                  ? "text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text"
                  : "text-gray-900"
              }`}
            >
              OptiCV
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDark}>
              <Moon className="h-6 w-6 text-gray-600 hover:text-gray-900 transition-colors" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className=" text-white font-semibold hover:bg-slate-500"
              onClick={() => router.push("/ats-score")}
            >
              Check ATS Score
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 ">
          <Card>
            <CardHeader>
              <CardTitle>Upload your resume in PDF or JPG format </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReportComponent onReportConfirmation={onReportConfirmation} />
            </CardContent>
          </Card>

          <ChatComponent reportData={reportData} />
        </div>
      </div>
    </div>
  );
}
