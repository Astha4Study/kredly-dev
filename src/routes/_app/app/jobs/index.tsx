import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AsideProfile from '@/components/AsideProfile';
import { MapPin, Clock, X } from 'lucide-react';
import JobsBanner from '@/components/JobsBanner';

export const Route = createFileRoute('/_app/app/jobs/')({
  component: RouteComponent,
});

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  promoted: boolean;
  earlyApplicant: boolean;
  logo: string;
  postedTime: string;
}

const dummyJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer (Remote)',
    company: 'Hire Feed',
    location: 'Indonesia (Remote)',
    type: 'Full-time',
    promoted: true,
    earlyApplicant: true,
    logo: 'H',
    postedTime: '2 hari yang lalu',
  },
  {
    id: '2',
    title: 'Frontend Web Developer (Remote)',
    company: 'Hire Feed',
    location: 'Indonesia (Remote)',
    type: 'Full-time',
    promoted: true,
    earlyApplicant: true,
    logo: 'H',
    postedTime: '3 hari yang lalu',
  },
  {
    id: '3',
    title: 'UX/UI Designer | $85/hr Remote',
    company: 'Crossing Hurdles',
    location: 'Indonesia (Remote)',
    type: 'Contract',
    salary: '$15/hr - $85/hr',
    promoted: true,
    earlyApplicant: false,
    logo: 'C',
    postedTime: '1 minggu yang lalu',
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'Tech Solutions Indonesia',
    location: 'Jakarta, Indonesia',
    type: 'Full-time',
    promoted: false,
    earlyApplicant: true,
    logo: 'T',
    postedTime: '4 hari yang lalu',
  },
  {
    id: '5',
    title: 'React Native Developer',
    company: 'Mobile Apps Co',
    location: 'Bandung, Indonesia (Hybrid)',
    type: 'Full-time',
    promoted: false,
    earlyApplicant: false,
    logo: 'M',
    postedTime: '1 minggu yang lalu',
  },
];

function RouteComponent() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Info Banner */}
          <JobsBanner />

          {/* Jobs Section */}
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
            {/* Section Header */}
            <div className="border-b border-border p-6">
              <h2 className="text-xl font-semibold">
                Jobs based on your preferences
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Part-time or contract Frontend Developer or User Interface
                Designer or User Experience Designer or Back End Developer,
                on-site or hybrid or remote in Purwokerto or Kecamatan
                Purwokerto Utara or Jakarta, Indonesia
              </p>
            </div>

            {/* New Feature Notice */}
            <div className="border-b border-border bg-blue-50/50 p-4 dark:bg-blue-950/10">
              <div className="flex items-start justify-between gap-4">
                <p className="flex-1 text-sm">
                  <span className="font-semibold">New:</span> Explore jobs based
                  on preferences you set in open to work. Edit preferences or
                  visibility at any time.
                </p>
                <button className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Job Listings */}
            <div className="divide-y divide-border">
              {dummyJobs.map((job) => (
                <div
                  key={job.id}
                  className="group relative p-6 transition-colors hover:bg-muted/30"
                >
                  <button className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100">
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-linear-to-br from-primary/10 to-primary/5 text-xl font-bold text-primary">
                      {job.logo}
                    </div>

                    {/* Job Details */}
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/app/jobs/$jobId"
                        params={{ jobId: job.id }}
                        className="group/link inline-block"
                      >
                        <h3 className="text-base font-semibold text-primary transition-colors group-hover/link:underline">
                          {job.title}
                        </h3>
                      </Link>

                      <p className="mt-1 text-sm">{job.company}</p>

                      <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{job.location}</span>
                      </div>

                      {job.salary && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {job.salary}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {job.promoted && (
                          <Badge variant="secondary" className="text-xs">
                            Promoted
                          </Badge>
                        )}
                        {job.earlyApplicant && (
                          <Badge
                            variant="outline"
                            className="border-green-600/20 bg-green-50 text-xs text-green-700 dark:bg-green-950/20 dark:text-green-400"
                          >
                            Be an early applicant
                          </Badge>
                        )}
                      </div>

                      {/* Posted Time */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{job.postedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="border-t border-border p-6 text-center">
              <Button variant="outline" className="w-full sm:w-auto">
                Show more jobs
              </Button>
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
