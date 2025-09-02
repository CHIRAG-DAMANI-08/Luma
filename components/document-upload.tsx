"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload, FileText } from "lucide-react";

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // In a real implementation, you would upload to your Papermark instance
      // For now, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock shareable link
      const mockLink = `https://app.papermark.com/share/${Math.random().toString(36).substring(2, 9)}`;
      setShareLink(mockLink);
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Share Documents</CardTitle>
        <CardDescription>
          Upload and share important documents with your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!shareLink ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Drag and drop your file here, or click to select"}
              </p>
              <input
                type="file"
                id="document-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="document-upload"
                className="text-sm font-medium text-primary hover:text-primary/90 cursor-pointer"
              >
                Select file
              </label>
              {file && (
                <div className="flex items-center gap-2 mt-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload & Generate Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Shareable Link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    // You might want to show a toast notification here
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShareLink(null)}
            >
              Upload Another Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
