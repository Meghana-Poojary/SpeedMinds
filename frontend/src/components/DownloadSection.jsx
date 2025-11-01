import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, FileText, CheckCircle, Loader2 } from 'lucide-react';

export function DownloadSection({ documentData }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      // In a real app, this would generate and download a PDF
      const reportContent = generateReportContent(documentData);
      
      // Create a text file as a demo (in real app would be PDF)
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentData.name.replace(/\.[^/.]+$/, '')}-analysis-report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsGenerating(false);
    }, 2000);
  };

  const generateReportContent = (data) => {
    let content = `DOCUMENT ANALYSIS REPORT\n`;
    content += `Generated on: ${new Date().toLocaleDateString()}\n`;
    content += `Document: ${data.name}\n\n`;
    
    content += `SUMMARY\n`;
    content += `${'-'.repeat(50)}\n`;
    content += `${data.summary}\n\n`;
    
    content += `KEY TOPICS\n`;
    content += `${'-'.repeat(50)}\n`;
    data.topics.forEach((topic, index) => {
      content += `${index + 1}. ${topic}\n`;
    });
    content += `\n`;
    
    if (data.qaHistory.length > 0) {
      content += `QUESTIONS & ANSWERS\n`;
      content += `${'-'.repeat(50)}\n`;
      data.qaHistory.forEach((qa, index) => {
        content += `Q${index + 1}: ${qa.question}\n`;
        content += `A${index + 1}: ${qa.answer}\n\n`;
      });
    }
    
    return content;
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
              <span>Key Topics ({documentData.topics.length} identified)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Q&A History ({documentData.qaHistory.length} questions)</span>
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

        <p className="text-xs text-gray-500 text-center">
          * This demo generates a text file. In production, this would create a formatted PDF report.
        </p>
      </CardContent>
    </Card>
  );
}