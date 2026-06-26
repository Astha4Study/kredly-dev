import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import certPlaceholder from '@/assets/certification/certplaceholder.png';

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

interface CertificationListProps {
  filteredCredentials: Credential[];
  viewMode: 'grid' | 'list';
  setSelectedCredential: (credential: Credential | null) => void;
  searchQuery: string;
  filterStatus: 'all' | 'verified';
  setSearchQuery: (value: string) => void;
  setFilterStatus: (value: 'all' | 'verified') => void;
}

export default function CertificationList({
  filteredCredentials,
  viewMode,
  setSelectedCredential,
  searchQuery,
  filterStatus,
  setSearchQuery,
  setFilterStatus,
}: CertificationListProps) {
  if (filteredCredentials.length > 0) {
    return (
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
            : 'space-y-4'
        }
      >
        {filteredCredentials.map((credential) => (
          <div
            key={credential.id}
            className={`cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-sm ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}
            onClick={() => setSelectedCredential(credential)}
          >
            {/* Header Image with Verified Badge */}
            <div
              className={`relative flex items-center justify-center overflow-hidden bg-gray-100 ${
                viewMode === 'list'
                  ? 'w-48 shrink-0 aspect-[4/3]'
                  : 'w-full aspect-[4/3]'
              }`}
            >
              <img
                src={certPlaceholder}
                alt={credential.skillName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

              {/* Verified Badge - Absolute Top Right */}
              <div className="absolute top-3 right-3 z-20">
                <Badge variant="default">Verified</Badge>
              </div>
            </div>

            <div className={viewMode === 'list' ? 'flex-1' : ''}>
              {/* Gray Title Section */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {credential.skillName}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {credential.dateEarned}
                </p>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Score
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {credential.score}
                    <span className="text-sm text-gray-500 font-normal">
                      {credential.score > 100 ? '/1000' : '/100'}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium text-gray-500">
                    Blockchain TX Hash
                  </span>
                  <code className="block truncate rounded bg-gray-100 px-2 py-1 text-xs">
                    {credential.blockchainTxHash}
                  </code>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Lihat Detail
                  </Button>
                  <Button size="sm" variant="ghost">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (searchQuery || filterStatus !== 'all') {
    return (
      <Card className="py-16">
        <CardContent className="text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Tidak Ada Hasil
          </h3>
          <p className="mx-auto mb-6 max-w-md text-gray-600">
            Tidak ada kredensial yang sesuai dengan filter pencarian Anda. Coba
            ubah kata kunci atau filter.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
          >
            Reset Filter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-16">
      <CardContent className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Belum Ada Kredensial
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Selesaikan assessment untuk mendapatkan kredensial pertama Anda! Semua
          kredensial akan tersimpan di blockchain dan dapat diverifikasi.
        </p>
        <Link to="/app/assessment">
          <Button>Mulai Assessment</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
