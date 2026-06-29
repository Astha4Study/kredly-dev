import { Skeleton } from '@/components/ui/skeleton';

export function JobCardSkeleton() {
  return (
    <article className="border-b border-border">
      <div className="flex gap-4 px-6 py-5">
        {/* Logo Skeleton */}
        <Skeleton className="h-14 w-14 shrink-0" />

        {/* Content Skeleton */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Title and Company */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>

          {/* Meta Information */}
          <div className="flex gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </article>
  );
}
