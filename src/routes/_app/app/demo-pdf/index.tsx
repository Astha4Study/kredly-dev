import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award } from 'lucide-react';

export const Route = createFileRoute('/_app/app/demo-pdf/')({
  component: DemoPDFPage,
});

function DemoPDFPage() {
  const handleClaimCertificate = () => {
    console.log('Claim Certificate clicked');
    // TODO: Implement claim certificate logic
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Demo PDF</h1>
        <p className="text-muted-foreground">
          Halaman demo untuk claim certificate
        </p>
      </div>

      <Card className="p-12 flex flex-col items-center justify-center gap-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Award className="h-10 w-10 text-primary" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Ready to Claim Your Certificate
          </h2>
          <p className="text-muted-foreground">
            Klik tombol di bawah untuk claim sertifikat Anda
          </p>
        </div>

        <Button size="lg" onClick={handleClaimCertificate}>
          <Award className="h-5 w-5 mr-2" />
          Claim Certificate
        </Button>
      </Card>
    </div>
  );
}
