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

                <Button variant="outline" size="sm">
                  Edit Preferensi
                </Button>
              </div>
            </div>

            {/* Job List */}
            <div>
              {dummyJobs.map((job) => (
                <div
                  key={job.id}
                  className="
                    group
                    border-b
                    p-6
                    transition-colors
                    hover:bg-muted/20
                  "
                >
                  <div className="flex gap-5">
                    {/* Logo */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border bg-muted/30 text-sm font-semibold">
                      {job.logo}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            to="/app/jobs/$jobId"
                            params={{ jobId: job.id }}
                          >
                            <h3 className="text-base font-semibold transition-colors group-hover:text-primary">
                              {job.title}
                            </h3>
                          </Link>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {job.company}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Meta */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </div>

                        {job.salary && (
                          <>
                            <span>•</span>
                            <span>{job.salary}</span>
                          </>
                        )}

                        <span>•</span>

                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {job.postedTime}
                        </div>
                      </div>

                      {/* Status */}
                      {(job.promoted || job.earlyApplicant) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.promoted && (
                            <Badge variant="outline" className="font-normal">
                              Promoted
                            </Badge>
                          )}

                          {job.earlyApplicant && (
                            <Badge variant="outline" className="font-normal">
                              Early Applicant
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6">
              <Button variant="outline" className="w-full">
                Muat Lebih Banyak
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
