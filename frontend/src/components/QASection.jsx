import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, Send, User, Bot, Loader2 } from 'lucide-react';

// Added isGlobalLoading prop to reflect the API status managed by the parent
export function QASection({ onQuestionSubmit, qaHistory, isGlobalLoading }) {
  const [question, setQuestion] = useState('');
  
  // Controls button and input state
  const isInputDisabled = isGlobalLoading || !question.trim();
  
  // Ref for auto-scrolling
  const scrollRef = useRef(null);

  // Auto-scroll to the bottom when history or loading state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [qaHistory, isGlobalLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || isGlobalLoading) return;

    // Capture question before clearing input
    const currentQuestion = question;
    
    // 1. Clear the input immediately
    setQuestion('');

    // 2. Call the parent handler function, which runs the API fetch
    onQuestionSubmit(currentQuestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault(); 
      handleSubmit(e);   
    }
  };

  return (
    // Card now has a fixed height, making it the container for scrolling
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        {/* ... (Header content remains the same) */}
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Ask Questions
        </CardTitle>
        <p className="text-sm text-gray-600">
          Get instant answers about your document content
        </p>
      </CardHeader>

      {/* CardContent is the main content area, occupying remaining space */}
      {/* Ensure CardContent uses flex-col and flex-1 */}
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden p-6 pt-0">
        
        {/* Chat History Container */}
        <ScrollArea className="flex-grow h-[400px] pr-4" viewportRef={scrollRef}>
          <div className="space-y-4">
            {/* Show starter message if history is empty and not loading */}
            {qaHistory.length === 0 && !isGlobalLoading && (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Ask a question about your document to get started</p>
              </div>
            )}
            
            {qaHistory.map((qa, index) => (
              <div key={index} className="space-y-3">
                {/* Question (User Bubble) */}
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[85%]">
                    <p>{qa.question}</p>
                  </div>
                </div>
                
                {/* Answer (Bot Bubble) */}
                <div className="flex justify-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[85%] ml-2">
                    {/* Display answer, or use a placeholder while waiting */}
                    {qa.answer && qa.answer !== '...' ? (
                      <p className="text-gray-800">{qa.answer}</p>
                    ) : (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Question Input */}
        <div className="pt-4 border-t fixed-bottom">
            <form onSubmit={handleSubmit}> 
                <div className="relative">
                  <Textarea
                    placeholder="Ask a question about your document..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown} // CRITICAL: Added keydown handler
                    disabled={isGlobalLoading}
                    // Adjusted padding for the button, and increased min-height slightly
                    className="min-h-[80px] resize-none pr-12 pt-3 pb-3" 
                  />
                  <Button 
                    type="submit" 
                    disabled={isInputDisabled}
                    // CRITICAL: Positioning classes
                    className="absolute bottom-3 right-3 w-8 h-8 p-0 rounded-full"
                    aria-label="Send Question"
                  >
                    {isGlobalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" /> // Only icon needed
                    ) : (
                      <Send className="w-4 h-4" /> // Only icon needed
                    )}
                  </Button>
                </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}