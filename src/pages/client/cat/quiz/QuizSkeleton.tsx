import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function QuizSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Skeleton Header */}
        <div className="flex justify-between items-center animate-pulse">
          <div className="h-8 w-24 bg-foreground/10 rounded-lg" />
          <div className="h-8 w-20 bg-foreground/10 rounded-lg" />
        </div>
        {/* Skeleton Progress */}
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-40 bg-foreground/10 rounded-lg" />
          <div className="h-3 w-full bg-foreground/10 rounded-lg" />
        </div>
        {/* Skeleton Card */}
        <Card className="border border-foreground/5 bg-background/30 backdrop-blur-sm animate-pulse">
          <CardContent className="h-48 flex flex-col justify-center space-y-4 p-6">
            <div className="h-4 w-1/4 bg-foreground/10 rounded-lg" />
            <div className="h-4 w-3/4 bg-foreground/10 rounded-lg" />
            <div className="h-4 w-5/6 bg-foreground/10 rounded-lg" />
          </CardContent>
        </Card>
        {/* Skeleton Options */}
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-foreground/10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
