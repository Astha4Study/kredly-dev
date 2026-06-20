import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const GeneralAssessmentCardSkeleton = () => (
  <Card className="h-full border transition-all duration-300 shadow-xs hover:shadow-sm flex flex-col">
    <CardHeader className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>

      <div>
        <Skeleton className="h-7 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-16" />
      </div>
    </CardHeader>

    <CardContent className="flex-1">
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        <ul className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <li key={index} className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 shrink-0 mt-0.5 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </li>
          ))}
        </ul>
      </div>
    </CardContent>

    <CardContent className="pt-0">
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);
