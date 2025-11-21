import React, { useState } from 'react';
import { DocumentUpload } from './DocumentUpload.jsx';
import { SummaryDisplay } from './SummaryDisplay.jsx';
import { QASection } from './QASection.jsx';
import { DownloadSection } from './DownloadSection.jsx';
import { Card } from './ui/card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { FileText, Brain, MessageSquare, Download, AlertCircle, X } from 'lucide-react';

export default function Logic() {
  // 1. State for the primary analysis results
  const [documentData, setDocumentData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // ⭐️ NEW STATE: Store the original file object for Q&A context
  const [uploadedFile, setUploadedFile] = useState(null); 

  // 2. State for the chat history
  const [qaHistory, setQaHistory] = useState([]);
  
  // 3. State for controlling the Q&A loading UI
  const [isQALoading, setIsQALoading] = useState(false);
  
  // --- File Upload and Summary Analysis ---
  const handleDocumentUpload = async (file) => {
    setIsProcessing(true);
    setDocumentData(null);
    setError(null);
    setQaHistory([]); // Clear Q&A history on new upload
    
    // ⭐️ NEW: Save the actual file object BEFORE API call
    setUploadedFile(file); 

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:5000/api/analyze", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            setError({
                title: data.error || "Failed to analyze document",
                message: data.details || "An unknown error occurred"
            });
            // If analysis fails, clear the stored file as it might be corrupted or unsupported
            setUploadedFile(null); 
            return;
        }

        setDocumentData({
            summary: data.summary,
            topics: data.topics,
            documentName: data.documentName,
        });
    } catch (err) {
        console.error("Error uploading file:", err);
        setError({
            title: "Server Error",
            message: err.message || "Failed to connect to the server"
        });
        setUploadedFile(null);
    } finally {
        setIsProcessing(false);
    }
  };
  
  // --- Q&A Submission Handler ---
  const handleQuestionSubmit = async (question) => {
    // ⭐️ FIX: Use the 'uploadedFile' state variable instead of the undefined 'fileToAskAbout'
    if (!uploadedFile) { 
        alert("Please upload a document first to enable Q&A.");
        return;
    }

    // Add user question to history immediately with a placeholder answer
    setQaHistory(prev => [...prev, { question, answer: "..." }]); 
    setIsQALoading(true);

    const formData = new FormData();
    formData.append("file", uploadedFile); // ⭐️ FIX: Use the stored file object
    formData.append("question", question);

    try {
        const response = await fetch("http://localhost:5000/api/ask-document", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        // Find the last entry (the placeholder we just created)
        const updateHistoryWithError = (msg) => {
            setQaHistory(prev => prev.map((item, index) => 
                index === prev.length - 1 ? { ...item, answer: msg } : item
            ));
        };

        if (!response.ok) {
            const errorMessage = data.error || "Failed to get AI response.";
            updateHistoryWithError(`❌ Error: ${errorMessage}`);
            return;
        }

        // On success, update the placeholder answer with the AI's response
        updateHistoryWithError(data.answer);

    } catch (error) {
        console.error("Q&A Fetch Error:", error);
        // Handle network error
        updateHistoryWithError("❌ Network Error: Failed to connect to server.");
    } finally {
        setIsQALoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-100 to-blue-200 ">
      <div className="w-full ">
        <div className="pt-5 pb-4 px-4 sm:px-8">             
            <div className="flex items-center">
                <Brain className="w-8 h-8 mr-2 text-blue-600 dark:text-sky-400" />
                
                <span className="text-4xl font-black tracking-tight leading-none">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-500 to-blue-500">
                        SpeedMinds
                    </span>
                </span>
            </div>
        </div>
        <hr />
        {/* Error Alert */}
        {error && (
          <div className="mb-6 animate-in fade-in slide-in-from-top">
              <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{error.title}</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                  <button
                      onClick={() => setError(null)}
                      className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                  >
                      <X className="h-4 w-4" />
                  </button>
              </Alert>
          </div>
        )}

      {/* Main Content */}
      <div className="pl-55 align-center  max-w-7xl">
          {/* Left Column - Upload and Summary */}
          <div className="space-y-6 mt-10 w-full mb-7">
              <DocumentUpload onUpload={handleDocumentUpload} isProcessing={isProcessing} />
              {documentData && (
                  <SummaryDisplay 
                      summary={documentData.summary}
                      topics={documentData.topics}
                      documentName={documentData.documentName}
                  />
              )}
          </div>

          {/* Right Column - Q&A and Download */}
          <div className="space-y-6 w-full">
              {/* Only show Q&A and Download if a document has been successfully analyzed */}
              {documentData && ( 
                  <>
                      <QASection 
                          onQuestionSubmit={handleQuestionSubmit} 
                          qaHistory={qaHistory} 
                          isGlobalLoading={isQALoading}
                      />
                      <DownloadSection documentData={documentData} qaHistory={qaHistory} />
                  </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}