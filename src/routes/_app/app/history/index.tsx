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
import {
  Download,
  CheckCircle2,
  Award,
  Clock,
  ShieldCheck,
  Info,
  Loader2,
  History,
  LogIn,
  UserPlus,
  Upload,
  XCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserActivities, type Activity } from '@/lib/history-client';

export const Route = createFileRoute('/_app/app/history/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user_login':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-primary" />
          </div>
        );
      case 'user_register':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
        );
      case 'onboarding_completed':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
        );
      case 'assessment_completed':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
        );
      case 'credential_earned':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>
        );
      case 'cv_updated':
      case 'cv_uploaded':
      case 'cv_parsed':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-foreground" />
          </div>
        );
      case 'assessment_started':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
        );
      case 'assessment_abandoned':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
        );
      case 'blockchain_verified':
      case 'blockchain_issued':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <Info className="w-5 h-5 text-muted-foreground" />
          </div>
        );
    }
  };

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
            <Button variant="default" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
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
                      {getActivityIcon(activity.type)}
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
                                {activity.metadata.score}/100
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
