import { CertificationCardSkeleton } from './CertificationCardSkeleton';

export const CertificationListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <CertificationCardSkeleton key={i} />
      ))}
    </div>
  );
};
