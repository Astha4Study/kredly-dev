export default function DashboardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      {/* Hero Stats Skeleton */}
      <section className="border-b border-border">
        <div className="grid grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className={`p-6 ${index !== 3 ? 'border-r border-border' : ''}`}
            >
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-10 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* Available Assessments Skeleton */}
      <section className="border-b border-border">
        <div className="p-6">
          <div className="mb-4">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((index) => (
              <div
                key={index}
                className="h-full overflow-hidden rounded-xl border border-border bg-linear-to-br from-background to-muted/20 p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                </div>

                <div className="mb-4 flex-1">
                  <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="mt-1 h-4 w-5/6 animate-pulse rounded bg-muted" />
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials Skeleton */}
      <section>
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="divide-y divide-border">
          {[1, 2].map((index) => (
            <div key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-5 w-48 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="text-right">
                  <div className="h-9 w-12 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="mt-4 h-6 w-40 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
