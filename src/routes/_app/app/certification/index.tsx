import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import StatisticsCertificationCard from '@/pages/dashboard/certification/StatisticsCertificationCard';
import SearchAndFiltersCertification from '@/pages/dashboard/certification/SearchAndFiltersCertification';
import CertificationList from '@/pages/dashboard/certification/CertificationList';
import { StatisticsCertificationCardSkeleton } from '@/components/skeletons/StatisticsCertificationCardSkeleton';
import { SearchAndFiltersCertificationSkeleton } from '@/components/skeletons/SearchAndFiltersCertificationSkeleton';
import { CertificationListSkeleton } from '@/components/skeletons/CertificationListSkeleton';

export const Route = createFileRoute('/_app/app/certification/')({
  component: RouteComponent,
});

interface Credential {
  id: string;
  skillName: string;
  score: number;
  dateEarned: string;
  blockchainTxHash: string;
  status: 'verified';
  sessionId?: string;
  level?: string;
}

function RouteComponent() {
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified'>('all');

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch completed assessments on mount
  useEffect(() => {
    async function fetchCompletedAssessments() {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.profile && data.profile.cvAssessments) {
            const completed = data.profile.cvAssessments.filter(
              (a: any) => a.status === 'completed',
            );
            const mapped = completed.map((a: any) => {
              const hash = a.sessionId
                ? `0x${a.sessionId.replace(/-/g, '').slice(0, 40)}`
                : '0x0000000000000000000000000000000000000000';

              return {
                id: a.id,
                skillName: a.title,
                score: a.score || 0,
                dateEarned: 'Selesai',
                blockchainTxHash: hash,
                status: 'verified' as const,
                sessionId: a.sessionId,
                level: a.level || 'Intermediate',
              };
            });
            setCredentials(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to fetch completed assessments:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompletedAssessments();
  }, []);

  // Filter and sort credentials
  const filteredCredentials = useMemo(() => {
    let filtered = [...credentials];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((cred) =>
        cred.skillName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((cred) => cred.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'skill') return a.skillName.localeCompare(b.skillName);
      return 0; // date default
    });

    return filtered;
  }, [credentials, searchQuery, filterStatus, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCredentials = credentials.length;
    const averageScore =
      credentials.reduce((acc, curr) => acc + curr.score, 0) /
      (totalCredentials || 1);
    const latestDate = credentials[0]?.dateEarned || '-';

    return {
      total: totalCredentials,
      average: Math.round(averageScore),
      latest: latestDate,
    };
  }, [credentials]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Kredensial Saya
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lihat dan kelola seluruh kredensial yang telah Anda peroleh.
              </p>
            </div>
            <Button variant="outline" className="gap-2" disabled>
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>

          {/* Statistics Cards Skeleton */}
          <StatisticsCertificationCardSkeleton />

          {/* Search and Filters Skeleton */}
          <SearchAndFiltersCertificationSkeleton />

          {/* Certification List Skeleton */}
          <CertificationListSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Kredensial Saya
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Lihat dan kelola seluruh kredensial yang telah Anda peroleh.
            </p>
          </div>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>

        {/* Statistics Cards */}
        <StatisticsCertificationCard
          total={stats.total}
          average={stats.average}
          latest={stats.latest}
        />

        {/* Search and Filters */}
        <SearchAndFiltersCertification
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Certification Grid/List */}
        <CertificationList
          filteredCredentials={filteredCredentials}
          viewMode={viewMode}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          setSearchQuery={setSearchQuery}
          setFilterStatus={setFilterStatus}
        />
      </div>
    </main>
  );
}
