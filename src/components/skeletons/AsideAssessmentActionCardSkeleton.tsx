import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const AsideAssessmentActionCardSkeleton = () => {
  return (
    <Card className="border-border/50 sticky top-20">
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        {/* Start button */}
        <Skeleton className="h-11 w-full" />
        {/* Terms text */}
        <Skeleton className="h-3 w-full" />
      </CardContent>
    </Card>
  );
};
