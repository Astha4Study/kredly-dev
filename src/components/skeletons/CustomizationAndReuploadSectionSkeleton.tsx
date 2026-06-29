import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CustomizationAndReuploadSectionSkeleton = () => {
  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="space-y-1">
          <Skeleton className="h-7 w-80" />
          <Skeleton className="h-3.5 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card
            key={i}
            className="relative overflow-hidden border transition-all duration-300 flex flex-col justify-between"
          >
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-6 w-48 mt-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
