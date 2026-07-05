import certPlaceholder from '@/assets/certification/certplaceholder.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface PublicCertificateCardProps {
  certificate: {
    id: string;
    sessionId?: string;
    title: string;
    score?: number;
    issuedAt: string;
    verificationUrl?: string;
  };
  viewMode?: 'grid' | 'list';
}

export default function PublicCertificateCard({
  certificate,
  viewMode = 'grid',
}: PublicCertificateCardProps) {
  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString(
    'id-ID',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-sm ${
        viewMode === 'list' ? 'flex flex-row' : ''
      }`}
    >
      {/* Header Image with Verified Badge */}
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gray-100 ${
          viewMode === 'list' ? 'w-48 shrink-0 aspect-4/3' : 'w-full aspect-4/3'
        }`}
      >
        <img
          src={certPlaceholder}
          alt={certificate.title}
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
            {certificate.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Diterbitkan: {formattedDate}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Score Display */}
          {certificate.score !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Score</span>
              <span className="text-2xl font-bold text-gray-900">
                {certificate.score}
                <span className="text-sm text-gray-500 font-normal">
                  {certificate.score > 100 ? '/1000' : '/100'}
                </span>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {certificate.sessionId && (
              <Link
                to="/app/certification/$id"
                params={{ id: certificate.sessionId }}
                className="flex-1"
              >
                <Button size="sm" variant="outline" className="w-full">
                  Lihat Detail
                </Button>
              </Link>
            )}
            {certificate.verificationUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  window.open(certificate.verificationUrl, '_blank')
                }
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
