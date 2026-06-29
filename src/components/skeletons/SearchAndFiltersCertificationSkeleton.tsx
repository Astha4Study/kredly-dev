import { Skeleton } from '@/components/ui/skeleton';

export const SearchAndFiltersCertificationSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-10 flex-1" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-45" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
};
