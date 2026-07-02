import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AsideProfile from '@/components/AsideProfile';
import { Loader2, Sparkles, Coins, AlertCircle } from 'lucide-react';
import JobsBanner from '@/components/JobsBanner';
import { useState, useEffect } from 'react';
import { fetchAndStoreJobs, getUserJobs, type Job } from '@/lib/jobs-client';
import { LinkedInJobCard } from '@/components/LinkedInJobCard';
import { IndeedJobCard } from '@/components/IndeedJobCard';
import { GlassdoorJobCard } from '@/components/GlassdoorJobCard';
import { UpworkJobCard } from '@/components/UpworkJobCard';
import { JobCardSkeleton } from '@/components/skeletons/JobCardSkeleton';

export const Route = createFileRoute('/_app/app/jobs/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<{ current: number } | null>(
    null,
  );

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserJobs();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenBalance = async () => {
    try {
      const response = await fetch('/api/user/me/token-balance', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTokenBalance(data);
      }
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
    }
  };

  const handleFetchJobs = async () => {
    try {
      setFetchingJobs(true);
      setError(null);

      await fetchAndStoreJobs({
        query: 'Software Developer',
        location: 'Indonesia',
      });

      // Reload jobs and token balance after fetching
      await loadJobs();
      await fetchTokenBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setFetchingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
    fetchTokenBalance();
  }, []);

  const renderJobCard = (job: Job) => {
    switch (job.source) {
      case 'linkedin':
        return <LinkedInJobCard key={job.id} job={job} />;
      case 'indeed':
        return <IndeedJobCard key={job.id} job={job} />;
      case 'glassdoor':
        return <GlassdoorJobCard key={job.id} job={job} />;
      case 'upwork':
        return <UpworkJobCard key={job.id} job={job} />;
      default:
        return null;
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Info Banner */}
          <JobsBanner />

          {/* Token Insufficient Card for Jobs */}
          {tokenBalance && tokenBalance.current < 1 && (
            <Card className="border-rose-500/20 bg-rose-500/5 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 mt-0.5 sm:mt-0">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-rose-500">
                        Saldo Kredit Tidak Mencukupi
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Anda membutuhkan minimal 1 kredit untuk melakukan
                        pencarian rekomendasi pekerjaan baru. Saldo kredit Anda
                        saat ini adalah <strong>0</strong>.
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="default"
                    className="w-full sm:w-auto shrink-0 bg-rose-600 hover:bg-rose-700 text-white border-0"
                  >
                    <Link to="/app/pricing">Top Up Kredit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jobs Section */}
          <div className="border border-border bg-background">
            {/* Header */}
            <div className="border-b p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Pekerjaan untuk Anda
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
                    Berdasarkan profil, hasil asesmen, dan preferensi karier
                    Anda.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {tokenBalance && tokenBalance.current < 1 && (
                    <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Kredit tidak cukup</span>
                    </div>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleFetchJobs}
                    disabled={
                      fetchingJobs ||
                      (tokenBalance !== null && tokenBalance.current < 1)
                    }
                  >
                    {fetchingJobs ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mencari Pekerjaan...
                      </>
                    ) : (
                      <>Cari Pekerjaan Baru</>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
            </div>

            {/* Job List */}
            <div>
              {loading ? (
                <div>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <JobCardSkeleton key={index} />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Belum Ada Pekerjaan
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    Klik tombol "Cari Pekerjaan Baru" di atas untuk mencari 15
                    pekerjaan relevan dari LinkedIn, Indeed, Glassdoor, dan
                    Upwork.
                  </p>
                </div>
              ) : (
                <div>{jobs.map((job) => renderJobCard(job))}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - AsideProfile */}
        <div className="hidden shrink-0 xl:block">
          <AsideProfile />
        </div>
      </div>
    </main>
  );
}
