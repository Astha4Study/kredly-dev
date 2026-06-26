import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState, useMemo } from 'react';
import StatisticsCertificationCard from '@/pages/dashboard/certification/StatisticsCertificationCard';
import SearchAndFiltersCertification from '@/pages/dashboard/certification/SearchAndFiltersCertification';
import CertificationList from '@/pages/dashboard/certification/CertificationList';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
}

function RouteComponent() {
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified'>('all');

  // Mock data - nanti diganti dengan data dari API
  const credentials: Credential[] = [
    {
      id: '9b7fd660-59c5-47e0-8548-1b2971fb4dc1',
      skillName: 'React Advanced',
      score: 88,
      dateEarned: '15 Juni 2026',
      blockchainTxHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      status: 'verified',
    },
    {
      id: '2',
      skillName: 'JavaScript ES6',
      score: 82,
      dateEarned: '10 Juni 2026',
      blockchainTxHash: '0x456def789ghi012jkl345mno678pqr901stu234',
      status: 'verified',
    },
    {
      id: '3',
      skillName: 'TypeScript Fundamentals',
      score: 91,
      dateEarned: '5 Juni 2026',
      blockchainTxHash: '0x789abc012def345ghi678jkl901mno234pqr567',
      status: 'verified',
    },
  ];

  const [selectedCredential, setSelectedCredential] =
    useState<Credential | null>(null);

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
          setSelectedCredential={setSelectedCredential}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          setSearchQuery={setSearchQuery}
          setFilterStatus={setFilterStatus}
        />

        {/* Credential Detail Modal - bisa ditambahkan nanti */}
        {selectedCredential && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedCredential.skillName}
                    </CardTitle>
                    <CardDescription>
                      Diterbitkan pada {selectedCredential.dateEarned}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCredential(null)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
                  <h3 className="text-3xl font-bold mb-2">
                    Certificate of Achievement
                  </h3>
                  <p className="text-lg opacity-90">
                    {selectedCredential.skillName}
                  </p>
                  <div className="mt-6">
                    <p className="text-4xl font-bold">
                      {selectedCredential.score}/100
                    </p>
                    <p className="text-sm opacity-80 mt-1">Final Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date Earned
                    </label>
                    <p className="text-base text-gray-900 mt-1">
                      {selectedCredential.dateEarned}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <p className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 6.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                        Blockchain Verified
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Blockchain Transaction Hash
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-3 py-2 rounded flex-1 font-mono">
                      {selectedCredential.blockchainTxHash}
                    </code>
                    <Button size="sm" variant="outline">
                      Copy
                    </Button>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View on Blockchain Explorer →
                  </a>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">Download Certificate (PDF)</Button>
                  <Button variant="outline" className="flex-1">
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
