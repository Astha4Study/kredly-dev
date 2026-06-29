import { Skeleton } from '@/components/ui/skeleton';

export const CertificationCardSkeleton = () => {
  return (
    <div className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header Image */}
      <Skeleton className="w-full aspect-[4/3]" />

      {/* Title Section */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
};
