import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export const Route = createFileRoute('/_app/app/kredensial/')({
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

  // Mock data - nanti diganti dengan data dari API
  const credentials: Credential[] = [
    {
      id: '1',
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

  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Kredensial Saya</h2>
            <p className="text-gray-600 mt-2">
              Total {credentials.length} kredensial diperoleh
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              Urutkan:
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih urutan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Tanggal Terbaru</SelectItem>
                <SelectItem value="score">Score Tertinggi</SelectItem>
                <SelectItem value="skill">Nama Skill (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blockchain Info Banner */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Kredensial Blockchain
                </h3>
                <p className="text-sm text-blue-800 mt-1">
                  Semua kredensial Anda tersimpan di blockchain, bersifat
                  immutable, dapat diverifikasi, dan mudah dibagikan ke pihak
                  lain.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credentials Grid */}
        {credentials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentials.map((credential) => (
              <Card
                key={credential.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCredential(credential)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {credential.skillName}
                    </CardTitle>
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 6.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      Verified
                    </span>
                  </div>
                  <CardDescription>{credential.dateEarned}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Score
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {credential.score}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block mb-1">
                      Blockchain TX Hash
                    </span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                      {credential.blockchainTxHash}
                    </code>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Lihat Detail
                    </Button>
                    <Button size="sm" variant="ghost">
                      <svg
                        className="w-4 h-4"
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Empty State
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
                Selesaikan assessment untuk mendapatkan kredensial pertama Anda!
                Semua kredensial akan tersimpan di blockchain dan dapat
                diverifikasi.
              </p>
              <Button>Mulai Assessment</Button>
            </CardContent>
          </Card>
        )}

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
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
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
