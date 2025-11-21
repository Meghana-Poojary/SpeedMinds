import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, FileText, CheckCircle, Loader2 } from 'lucide-react';

// documentData prop now includes summary, topics, documentName, and qaHistory
export function DownloadSection({ documentData, qaHistory }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Helper to ensure data is available before calculating lengths
  const topicsCount = documentData?.topics?.length || 0;
  const qaCount = documentData?.qaHistory?.length || 0;
  const documentName = documentData?.documentName || 'analysis_report';

  const handleDownload = async () => {
    setDownloadError(null);
    setIsGenerating(true);

    try {
      const payload = {
        summary: documentData.summary,
        topics: documentData.topics,
        documentName: documentName,
        qaHistory: qaHistory.filter(qa => qa.answer !== '...'), // Filter out pending Q&A items
      };

      const response = await fetch("http://localhost:5000/api/download-report", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Since the response body might not be JSON on error, we handle it generally
        const errorText = await response.text();
        throw new Error(`Server returned status ${response.status}: ${errorText.substring(0, 100)}...`);
      }

      // 1. Get the PDF blob
      const blob = await response.blob();
      
      // 2. Create a temporary URL and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Use the document name from the data to set the filename
      a.download = `${documentName.replace(/\.[^/.]+$/, '')}-analysis-report.pdf`; 
      document.body.appendChild(a);
      a.click();
      
      // 3. Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadError(`Failed to generate report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Report
        </CardTitle>
        <p className="text-sm text-gray-600">
          Download a comprehensive analysis report
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {downloadError && (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            {downloadError}
          </div>
        )}
        
        {/* Report Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Report Contents</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Document Summary</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Key Topics ({topicsCount} identified)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Q&A History</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Analysis Metadata</span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <Button 
          onClick={handleDownload} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating PDF Report...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}