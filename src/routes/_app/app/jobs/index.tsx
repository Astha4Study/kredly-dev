import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import AsideProfile from '@/components/AsideProfile';
import { Loader2, Sparkles } from 'lucide-react';
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

  const handleFetchJobs = async () => {
    try {
      setFetchingJobs(true);
      setError(null);

      await fetchAndStoreJobs({
        query: 'Software Developer',
        location: 'Indonesia',
      });

      // Reload jobs after fetching
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setFetchingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
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

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleFetchJobs}
                  disabled={fetchingJobs}
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
