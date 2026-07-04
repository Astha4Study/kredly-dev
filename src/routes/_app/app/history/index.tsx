import { createFileRoute } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Download, Loader2, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserActivities, type Activity } from '@/lib/history-client';
import { getActivityIcon } from '@/lib/activity-icons';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Route = createFileRoute('/_app/app/history/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserActivities();
      setActivities(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load activities',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const getActivityTypeBadge = (type: Activity['type']) => {
    switch (type) {
      case 'user_login':
        return <Badge variant="secondary">Login</Badge>;
      case 'user_register':
        return <Badge variant="default">Registrasi</Badge>;
      case 'onboarding_completed':
        return <Badge variant="default">Onboarding</Badge>;
      case 'assessment_completed':
        return <Badge variant="default">Assessment</Badge>;
      case 'credential_earned':
        return <Badge variant="default">Kredensial</Badge>;
      case 'cv_updated':
      case 'cv_uploaded':
      case 'cv_parsed':
        return <Badge variant="secondary">CV</Badge>;
      case 'assessment_started':
        return <Badge variant="secondary">Assessment</Badge>;
      case 'assessment_abandoned':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      case 'blockchain_verified':
        return <Badge variant="default">Blockchain</Badge>;
      case 'blockchain_issued':
        return <Badge variant="default">Blockchain</Badge>;
      default:
        return <Badge variant="outline">Lainnya</Badge>;
    }
  };

  const exportToPDF = () => {
    if (activities.length === 0) {
      alert('Tidak ada aktivitas untuk diekspor');
      return;
    }

    setExporting(true);

    try {
      // Create new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Riwayat Aktivitas Kredly', 14, 20);

      // Add subtitle with date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);

      // Prepare table data
      const tableData = activities.map((activity) => {
        const metadata: string[] = [];
        
        if (activity.metadata?.score) {
          metadata.push(`Score: ${activity.metadata.score}/1000`);
        }
        if (activity.metadata?.progress) {
          metadata.push(`Progress: ${activity.metadata.progress}`);
        }
        if (activity.metadata?.fileName) {
          metadata.push(`File: ${activity.metadata.fileName}`);
        }
        if (activity.metadata?.skills && activity.metadata.skills.length > 0) {
          metadata.push(`Skills: ${activity.metadata.skills.join(', ')}`);
        }
        if (activity.metadata?.txHash) {
          metadata.push(`TxHash: ${activity.metadata.txHash.substring(0, 20)}...`);
        }

        return [
          activity.date,
          activity.time,
          activity.title,
          activity.description,
          metadata.join('\n') || '-',
        ];
      });

      // Add table with autoTable
      autoTable(doc, {
        head: [['Tanggal', 'Waktu', 'Aktivitas', 'Deskripsi', 'Detail']],
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: 255,
          fontStyle: 'bold',
          halign: 'left',
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Date
          1: { cellWidth: 15 }, // Time
          2: { cellWidth: 45 }, // Activity
          3: { cellWidth: 60 }, // Description
          4: { cellWidth: 45 }, // Details
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        margin: { top: 35, left: 14, right: 14 },
      });

      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`Kredly-Activity-History-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengekspor PDF. Silakan coba lagi.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="border-b border-border px-1 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Riwayat Aktivitas
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Timeline aktivitas Anda di platform
              </p>
            </div>
            <Button variant="default" className="gap-2" onClick={exportToPDF} disabled={exporting || loading || activities.length === 0}>
              <Download className="h-4 w-4" />
              {exporting ? 'Mengekspor...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h3 className="text-lg font-semibold">Timeline Aktivitas</h3>
              <p className="text-sm text-muted-foreground">
                Riwayat aktivitas Anda secara kronologis
              </p>
            </div>
          </div>
          <div className="p-6">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 mb-4">
                {error}
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    {/* Icon & Line */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      {index !== activities.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">
                            {activity.title}
                          </h4>
                          {getActivityTypeBadge(activity.type)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {activity.date}
                      </p>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="mt-3 space-y-2">
                          {activity.metadata.score !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                Score:
                              </span>
                              <span className="text-sm text-foreground font-semibold">
                                {activity.metadata.score}/1000
                              </span>
                            </div>
                          )}

                          {activity.metadata.txHash && (
                            <div>
                              <span className="text-xs font-medium text-muted-foreground block mb-1">
                                Blockchain TX Hash:
                              </span>
                              <code className="text-xs bg-muted px-2 py-1 block truncate">
                                {activity.metadata.txHash}
                              </code>
                              <a
                                href="#"
                                className="text-xs text-primary hover:underline mt-1 inline-block"
                              >
                                View on blockchain explorer →
                              </a>
                            </div>
                          )}

                          {activity.metadata.fileName && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                File:
                              </span>
                              <span className="text-sm text-foreground">
                                {activity.metadata.fileName}
                              </span>
                            </div>
                          )}

                          {activity.metadata.skills && (
                            <div>
                              <span className="text-sm font-medium text-foreground block mb-1">
                                New Skills Detected:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {activity.metadata.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 bg-muted text-foreground text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {activity.metadata.progress && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                Status:
                              </span>
                              <span className="text-sm text-foreground">
                                {activity.metadata.progress}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty className="bg-white">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <History />
                  </EmptyMedia>
                  <EmptyTitle>Belum Ada Aktivitas</EmptyTitle>
                  <EmptyDescription>
                    Aktivitas Anda akan muncul di sini
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
