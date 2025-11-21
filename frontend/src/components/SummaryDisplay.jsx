import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Tag, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'; // Added Chevron icons

    // Reusable function to render the header and toggle button
export function SummaryDisplay({ summary, topics, documentName }) {
    // State for controlling section visibility
    const [isSummaryOpen, setIsSummaryOpen] = useState(true);
    const [isTopicsOpen, setIsTopicsOpen] = useState(true);

    // Reusable function to render the header and toggle button
    // --- CORRECTED LINE BELOW ---
    const renderSectionHeader = (title, icon, isOpen, toggleFunc) => (
        <button
            onClick={toggleFunc}
            className="flex justify-between items-center w-full p-2 -m-2 rounded-md hover:bg-gray-50 transition-colors"
            aria-expanded={isOpen}
            aria-controls={title.toLowerCase().replace(/\s/g, '-')}
        >
            <div className="flex items-center gap-2">
                {icon}
                <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            {/* Toggle Icon */}
            {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
        </button>
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Analysis Complete
                </CardTitle>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-gray-500"/>
                    Document: <span className="font-medium text-gray-800">{documentName}</span>
                </p>
            </CardHeader>

            <CardContent className="space-y-6">
                
                {/* --- Summary Section --- */}
                <div>
                    {renderSectionHeader(
                        "Summary",
                        <FileText className="w-5 h-5 text-blue-600" />,
                        isSummaryOpen,
                        () => setIsSummaryOpen(!isSummaryOpen)
                    )}
                    
                    {/* Conditional rendering for content with transition effect */}
                    {isSummaryOpen && (
                        <div id="summary" className="pt-4 transition-all duration-300 ease-in-out">
                            <p className="text-gray-700 leading-relaxed indent-4">{summary}</p>
                        </div>
                    )}
                </div>

                <hr className="border-t border-gray-200" />

                {/* --- Topics Section --- */}
                <div>
                    {renderSectionHeader(
                        "Key Topics",
                        <Tag className="w-5 h-5 text-purple-600" />,
                        isTopicsOpen,
                        () => setIsTopicsOpen(!isTopicsOpen)
                    )}
                    
                    {/* Conditional rendering for content with transition effect */}
                    {isTopicsOpen && (
                        <div id="key-topics" className="pt-4 transition-all duration-300 ease-in-out space-y-4">
                            {topics.map((t, index) => (
                                <div key={index} className="pl-2 border-l-2 border-purple-200">
                                    <Badge
                                        variant="secondary"
                                        className="text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 mb-1"
                                    >
                                        {t.topic}
                                    </Badge>
                                    <p className="text-gray-700 leading-snug text-sm">{t.explanation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}