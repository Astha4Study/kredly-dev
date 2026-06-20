import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const AssessmentCardSkeleton = () => (
  <Card className="h-full border transition-all duration-300 shadow-xs hover:shadow-sm flex flex-col">
    <CardHeader className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>

      <div>
        <Skeleton className="h-7 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-1" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-16" />
      </div>
    </CardHeader>

    <CardContent className="flex-1" />

    <CardContent>
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);
