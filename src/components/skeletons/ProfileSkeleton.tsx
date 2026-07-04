import { Card, CardContent } from '@/components/ui/card';

export function ProfileSkeleton() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <Card>
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  {/* Avatar Skeleton */}
                  <div className="h-24 w-24 rounded-full bg-muted animate-pulse mr-6" />

                  <div className="space-y-3">
                    {/* Name Skeleton */}
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />

                    {/* Username Skeleton */}
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />

                    {/* Email Skeleton */}
                    <div className="h-3 w-56 bg-muted animate-pulse rounded" />

                    {/* Headline Skeleton */}
                    <div className="h-5 w-64 bg-muted animate-pulse rounded" />
                  </div>
                </div>

                {/* Buttons Skeleton */}
                <div className="flex items-center gap-4">
                  <div className="h-9 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-9 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>

              {/* Bio Skeleton */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            </div>

            {/* Recent Assessments Section */}
            <div className="p-6 border-b space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-40 bg-muted animate-pulse rounded" />
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              </div>

              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon Skeleton */}
                      <div className="h-8 w-8 bg-muted animate-pulse rounded" />

                      <div className="space-y-2">
                        {/* Title Skeleton */}
                        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                        {/* Date Skeleton */}
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>

                    {/* Score Badge Skeleton */}
                    <div className="h-6 w-12 bg-muted animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Assessments Section */}
            <div className="p-6 border-b space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-56 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-5 w-20 bg-muted animate-pulse rounded-full ml-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="p-6 border-b space-y-4">
              <div className="h-3 w-44 bg-muted animate-pulse rounded" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div className="p-6 border-b space-y-4">
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="h-6 bg-muted animate-pulse rounded-full"
                    style={{ width: `${60 + Math.random() * 40}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Social Links Section */}
            <div className="p-6 border-b space-y-4">
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-24 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            </div>

            {/* Certificates Section */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="h-3 w-36 bg-muted animate-pulse rounded" />

                  <div className="flex items-end gap-2">
                    <div className="h-12 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-20 bg-muted animate-pulse rounded mb-1" />
                  </div>
                </div>

                <div className="h-14 w-14 border bg-muted animate-pulse" />
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
