import certPlaceholder from '@/assets/certification/certplaceholder.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      className={`overflow-hidden rounded-xl border border-foreground/10 bg-card/40 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md ${
        viewMode === 'list' ? 'flex flex-row' : ''
      }`}
    >
      {/* Header Image with Verified Badge */}
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-muted/10 ${
          viewMode === 'list' ? 'w-48 shrink-0 aspect-4/3' : 'w-full aspect-4/3'
        }`}
      >
        <img
          src={certPlaceholder}
          alt={certificate.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        {/* Verified Badge - Absolute Top Right */}
        <div className="absolute top-3 right-3 z-20">
          <Badge
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary/95"
          >
            Verified
          </Badge>
        </div>
      </div>

      <div className={viewMode === 'list' ? 'flex-1' : ''}>
        {/* Title Section */}
        <div className="bg-muted/25 px-4 py-3 border-b border-foreground/5">
          <h3 className="text-base font-bold text-foreground leading-tight">
            {certificate.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Diterbitkan: {formattedDate}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Score Display */}
          {certificate.score !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Score
              </span>
              <span className="text-2xl font-bold text-foreground">
                {certificate.score}
                <span className="text-sm text-muted-foreground font-normal">
                  {certificate.score > 100 ? '/1000' : '/100'}
                </span>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 w-full">
            {certificate.verificationUrl && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-foreground/10 hover:bg-accent hover:text-accent-foreground"
                onClick={() =>
                  window.open(certificate.verificationUrl, '_blank')
                }
              >
                Lihat Detail
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
