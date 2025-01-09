"use client";

import SuccessIndicator from "@/components/SuccessIndicator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Database, LucideLoader2, MoveUp, RefreshCcw } from "lucide-react";
import React, { useEffect, useState } from "react";

const VectorDBPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [index, setIndex] = useState("");
  const [namespace, setNamespace] = useState("");
  const [progress, setProgress] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchFileList = async () => {
      try {
        const response = await fetch("/api/listfiles");
        const data = await response.json();
        setFileList(data.files);
      } catch (error) {
        console.error("Error fetching file list:", error);
      }
    };

    fetchFileList();
  }, []);

  const onStartUpload = async () => {
    setIsUploading(true);
    setShowSuccess(false);
    let progress = 0;

    try {
      const response = await fetch("/api/updatedatabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index, namespace }),
      });

      if (response.status === 200) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }

      const reader = response.body?.getReader();
      const contentLength = parseInt(
        response.headers.get("Content-Length") || "0",
        10
      );

      if (reader) {
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedLength += value?.length || 0;

          progress = contentLength
            ? Math.min((receivedLength / contentLength) * 100, 100)
            : Math.min(progress + 5, 100);
          setProgress(progress);
        }
      } else {
        let simulatedProgress = 0;
        const interval = setInterval(() => {
          simulatedProgress += 5;
          setProgress(Math.min(simulatedProgress, 100));
          if (simulatedProgress >= 100) clearInterval(interval);
        }, 200);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetInputs = () => {
    setIndex("");
    setNamespace("");
    setProgress(0);
  };

  return (
    <main className="flex flex-col items-center p-8 min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <Card className="w-full h-full max-w-6xl p-6 m-4 bg-white/90 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text text-black">
            Update Knowledge Base
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Add new documents to your vector database
          </CardDescription>
        </CardHeader>
        <CardContent className="h-full flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 grid gap-6 border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="gap-4 relative">
                <Button
                  className="absolute -right-4 -top-4 bg-white hover:bg-gray-100 text-gray-800"
                  variant="outline"
                  size="icon"
                  onClick={resetInputs}
                >
                  <RefreshCcw size={18} className="animate-spin-slow" />
                </Button>
                <Label className="text-lg font-semibold text-gray-700">
                  Files list:
                </Label>
                <Textarea
                  readOnly
                  placeholder={fileList.join("\n")}
                  className="min-h-24 resize-none border p-3 shadow-inner bg-white/50 text-sm text-gray-600 focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="text-lg font-semibold text-gray-700">
                    Index Name
                  </Label>
                  <Input
                    placeholder="Enter index name"
                    disabled={isUploading}
                    className="bg-white/50 border-gray-300 focus:border-purple-400 focus:ring-purple-300"
                    value={index}
                    onChange={(e) => setIndex(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-lg font-semibold text-gray-700">
                    Namespace
                  </Label>
                  <Input
                    placeholder="Enter namespace"
                    disabled={isUploading}
                    className="bg-white/50 border-gray-300 focus:border-purple-400 focus:ring-purple-300"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full h-full min-h-[200px text-red hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              disabled={isUploading}
              onClick={onStartUpload}
            >
              <span className="flex flex-col items-center justify-center gap-4">
                <span className="text-2xl font-bold">Upload</span>
                <Database size={70} className="animate-pulse" />
                <MoveUp size={30} className="animate-bounce" />
              </span>
            </Button>
          </div>

          {isUploading && (
            <div className="mt-6 bg-white/80 p-4 rounded-lg shadow-md">
              <Label className="text-lg font-semibold text-gray-700">
                Upload Progress:
              </Label>
              <div className="flex flex-row items-center gap-4 mt-2">
                <Progress value={progress} className="w-full h-2 bg-gray-200" />
                <LucideLoader2 className="animate-spin text-purple-600" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <SuccessIndicator show={showSuccess} />
    </main>
  );
};

export default VectorDBPage;
