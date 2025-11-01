import React, { useState } from 'react';
import { DocumentUpload } from './components/DocumentUpload.jsx';
import { SummaryDisplay } from './components/SummaryDisplay.jsx';
import { QASection } from './components/QASection.jsx';
import { DownloadSection } from './components/DownloadSection.jsx';
import { Card } from './components/ui/card';
import { FileText, Brain, MessageSquare, Download } from 'lucide-react';

export default function App() {
  const [documentData, setDocumentData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDocumentUpload = async (file) => {
    setIsProcessing(true);
    
    // Simulate document processing
    setTimeout(() => {
      const mockData = {
        name: file.name,
        summary: "This document discusses the key principles of project management, including planning, execution, monitoring, and closing phases. It emphasizes the importance of stakeholder communication, risk management, and quality assurance throughout the project lifecycle. The document also covers various methodologies such as Agile and Waterfall approaches.",
        topics: [
          "Project Planning and Initiation",
          "Stakeholder Management",
          "Risk Assessment and Mitigation",
          "Quality Assurance Processes",
          "Agile vs Waterfall Methodologies",
          "Project Monitoring and Control",
          "Resource Allocation",
          "Communication Strategies"
        ],
        qaHistory: []
      };
      setDocumentData(mockData);
      setIsProcessing(false);
    }, 3000);
  };

  const handleQuestionSubmit = (question) => {
    if (!documentData) return;

    // Mock AI response
    const mockAnswer = "Based on the document analysis, this relates to the project management principles outlined in section 2. The key considerations include proper planning, stakeholder alignment, and continuous monitoring to ensure successful project delivery.";
    
    const newQA = { question, answer: mockAnswer };
    setDocumentData({
      ...documentData,
      qaHistory: [...documentData.qaHistory, newQA]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-gray-900 ">Education Hub</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your documents to get AI-powered summaries, key topics, and interactive Q&A capabilities
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8 w-full">
          <Card className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Upload Documents</h3>
            <p className="text-sm text-gray-600">PDF, DOCX, TXT supported</p>
          </Card>
          <Card className="p-4 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">AI Summaries</h3>
            <p className="text-sm text-gray-600">Get key insights instantly</p>
          </Card>
          <Card className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">Interactive Q&A</h3>
            <p className="text-sm text-gray-600">Ask questions about content</p>
          </Card>
          <Card className="p-4 text-center">
            <Download className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold">Export Reports</h3>
            <p className="text-sm text-gray-600">Download PDF reports</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 w-full">
          {/* Left Column - Upload and Summary */}
          <div className="space-y-6 w-full">
            <DocumentUpload onUpload={handleDocumentUpload} isProcessing={isProcessing} />
            {documentData && (
              <SummaryDisplay 
                summary={documentData.summary}
                topics={documentData.topics}
                documentName={documentData.name}
              />
            )}
          </div>

          {/* Right Column - Q&A and Download */}
          <div className="space-y-6 w-full">
            {documentData && (
              <>
                <QASection 
                  onQuestionSubmit={handleQuestionSubmit}
                  qaHistory={documentData.qaHistory}
                />
                <DownloadSection documentData={documentData} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}