import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Tag, CheckCircle } from 'lucide-react';

export function SummaryDisplay({ summary, topics, documentName }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Analysis Complete
        </CardTitle>
        <p className="text-sm text-gray-600">Document: {documentName}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold">Summary</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>

        {/* Topics Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold">Key Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-sm"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}