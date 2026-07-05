export function NotificationSkeleton() {
  return (
    <div className="space-y-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 border-b last:border-b-0">
          <div className="flex gap-3">
            {/* Icon skeleton */}
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse flex-shrink-0" />

            <div className="flex-1 space-y-2">
              {/* Title skeleton */}
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />

              {/* Description skeleton */}
              <div className="space-y-1">
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
              </div>

              {/* Timestamp skeleton */}
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
