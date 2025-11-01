import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, Send, User, Bot } from 'lucide-react';

export function QASection({ onQuestionSubmit, qaHistory }) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const currentQuestion = question;
    setQuestion('');

    // Simulate API delay
    setTimeout(() => {
      onQuestionSubmit(currentQuestion);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Ask Questions
        </CardTitle>
        <p className="text-sm text-gray-600">
          Get instant answers about your document content
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Chat History */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {qaHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Ask a question about your document to get started</p>
              </div>
            ) : (
              qaHistory.map((qa, index) => (
                <div key={index} className="space-y-3">
                  {/* Question */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 flex-1">
                      <p className="text-gray-800">{qa.question}</p>
                    </div>
                  </div>
                  
                  {/* Answer */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 flex-1">
                      <p className="text-gray-800">{qa.answer}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
                <div className="bg-gray-50 rounded-lg p-3 flex-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Question Input */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Ask a question about your document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="min-h-[80px] resize-none"
          />
          <Button 
            type="submit" 
            disabled={!question.trim() || isLoading}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Processing...' : 'Ask Question'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}