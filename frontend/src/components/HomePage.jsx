import React from 'react';
import { FileText, Brain, MessageSquare, Download, ChevronRight } from 'lucide-react';

// Simple Card Component (using shadcn/ui style conventions)
const Card = ({ children, className }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-lg transition-all hover:shadow-2xl hover:scale-[1.01] duration-300 ${className}`}>
    {children}
  </div>
);

const HomePage = ({ handleStart }) => {
  const features = [
    { icon: FileText, title: "Upload Documents", description: "PDF, DOCX, TXT supported", color: "text-blue-500" },
    { icon: Brain, title: "AI Summaries", description: "Get key insights instantly", color: "text-green-500" },
    { icon: MessageSquare, title: "Interactive Q&A", description: "Ask questions about content", color: "text-purple-500" },
    { icon: Download, title: "Export Reports", description: "Download PDF reports", color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-full max-w-6xl mx-auto py-14">
        
        {/* Hero Section */}
        <div className="text-center mb-16 px-4">
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight">
            Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Mind</span> of Your Documents
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            <strong>SpeedMinds</strong> uses advanced AI to instantly summarize, extract key topics, and provide interactive Q&A capabilities for any document you upload.
          </p>
          
          {/* Call to Action Button */}
          <button
            onClick={handleStart}
            className="mt-10 inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-full shadow-xl text-white bg-blue-600 hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Get Started Now
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center bg-white shadow-xl">
              <feature.icon className={`w-10 h-10 mx-auto mb-4 ${feature.color}`} />
              <h3 className="text-xl font-bold text-gray-800 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;