import { Skeleton } from '@/components/ui/skeleton';

export function AccountSettingsSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r bg-white p-6">
        <div className="space-y-1">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>

      {/* Content Skeleton */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border bg-white p-6">
              <Skeleton className="mb-4 h-6 w-48" />
              <Skeleton className="mb-2 h-4 w-full" />
              <div className="mt-6 space-y-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6">
              <Skeleton className="mb-4 h-6 w-48" />
              <Skeleton className="mb-2 h-4 w-full" />
              <div className="mt-6 space-y-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
