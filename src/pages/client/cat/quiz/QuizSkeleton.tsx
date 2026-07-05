import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizSkeletonProps {
  loadingMessage?: string;
}

export default function QuizSkeleton({ loadingMessage }: QuizSkeletonProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* AppTopbarAssessment Skeleton */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="h-8 w-px bg-border" />
            <Skeleton className="h-6 w-48 sm:w-64" />
          </div>
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-6 md:space-y-8 my-auto">
          {/* ProgressBar Skeleton */}
          <div className="w-full space-y-2 animate-pulse">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/5 border border-foreground/5">
              <Skeleton className="h-full w-1/3" />
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-foreground/10" />
            </div>
          </div>

          <div className="space-y-6">
            {/* QuestionCard Skeleton */}
            <Card className="relative overflow-hidden border border-foreground/10 bg-background/50 backdrop-blur-md animate-pulse">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 h-0.5 w-full bg-linear-to-r from-primary/50 via-primary to-primary/50" />

              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </CardHeader>

              <CardContent className="pt-2 pb-6 space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-11/12" />
                <Skeleton className="h-6 w-4/5" />
              </CardContent>
            </Card>

            {/* AnswerOptions Skeleton */}
            <div className="grid grid-cols-1 gap-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background/30 p-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="size-7 rounded-lg shrink-0" />
                    <Skeleton className="h-5 w-full max-w-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* QuizActions Skeleton */}
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center justify-end pt-2">
                <Skeleton className="h-11 w-full md:w-40 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Loading Message */}
          {loadingMessage && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground animate-pulse">
                {loadingMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
