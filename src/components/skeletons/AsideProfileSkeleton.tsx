export default function AsideProfileSkeleton() {
  return (
    <aside className="sticky top-20 w-64 shrink-0">
      <div className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          {/* User Skeleton */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-full border border-border bg-muted" />
              <div className="min-w-0 flex-1">
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 border-y border-border">
            {[1, 2].map((index) => (
              <div
                key={index}
                className={`block p-4 ${
                  index === 1 ? 'border-r border-border' : ''
                }`}
              >
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>

          {/* Profile Skeleton */}
          <div className="px-4 pt-2 pb-4">
            <div className="mb-4 h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="space-y-3">
              {[1, 2, 3].map((index) => (
                <div key={index}>
                  <div className="mb-1.5 h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Skeleton */}
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-4">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-5/6 animate-pulse rounded bg-muted" />
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-3 w-8 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
