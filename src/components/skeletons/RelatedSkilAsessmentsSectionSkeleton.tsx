import { Skeleton } from '@/components/ui/skeleton';
import { AssessmentCardSkeleton } from './AssessmentCardSkeleton';

export const RelatedSkilAsessmentsSectionSkeleton = () => {
  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <AssessmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
