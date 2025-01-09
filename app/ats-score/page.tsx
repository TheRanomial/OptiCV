"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ATSScorePage() {
  const [resumeText, setResumeText] = useState<string>("");
  const [atsScore, setAtsScore] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [atsNumber, setAtsNumber] = useState<number>(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setResumeText(base64String);
      };

      reader.readAsDataURL(file);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText) {
      alert("Please upload a resume first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkatsscore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64: resumeText,
        }),
      });

      if (response.ok) {
        const reportText = await response.text();

        const parsedJson = JSON.parse(reportText);
        console.log("Parsed Response:", parsedJson);

        const formattedText = reportText
          .replace(/\\n/g, "\n")
          .replace(/\*\*/g, "")
          .replace(/^##\s*/gm, "")
          .trim();

        const first13Letters = formattedText.substring(15, 17);
        const score = Number(first13Letters);
        setAtsNumber(score);
        setAtsScore(first13Letters);
      }
    } catch (error) {
      console.error("Error analyzing the resume:", error);
      setAtsScore("An error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const radius = 50; // Radius of the circular progress bar
  const circumference = 2 * Math.PI * radius; // Circumference of the circle
  const strokeDashoffset = circumference - (atsNumber / 100) * circumference; // The length of the arc

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">ATS Score Checker</h1>
          <p className="text-sm text-neutral-600">
            Upload your resume to analyze its ATS score.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept=".txt,.pdf" onChange={handleUpload} />
            <Button
              variant="default"
              className="w-full"
              onClick={analyzeResume}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze ATS Score"}
            </Button>

            {atsScore && (
              <div className="mt-4 p-4 bg-gray-50 text-lg text-blue-700 rounded">
                {/* Arch Circular Progress Bar */}
                <div className="flex justify-center">
                  <svg
                    className="transform rotate-90"
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="gray"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                </div>

                {/* ATS Score Display */}
                <div className="text-center mt-4">
                  <span className="text-black">Your ATS score is </span>
                  <p className="text-xl font-semibold text-teal-600">
                    {atsNumber} / 100
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
