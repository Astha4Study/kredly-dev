import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, X } from 'lucide-react';
import type { Job } from '@/lib/jobs-client';

interface IndeedJobCardProps {
  job: Job;
}

export function IndeedJobCard({ job }: IndeedJobCardProps) {
  return (
    <div className="group border-b last:border-b-0 p-6 transition-colors hover:bg-muted/20">
      <div className="flex gap-5">
        {/* Logo */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border bg-green-50 border-green-200 text-green-700 text-sm font-semibold">
          {job.logo ? (
            <img
              src={job.logo}
              alt={`${job.company} logo`}
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.textContent =
                  job.company.charAt(0).toUpperCase();
              }}
            />
          ) : (
            job.company.charAt(0).toUpperCase()
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {job.url ? (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold transition-colors hover:text-primary"
                >
                  {job.title}
                </a>
              ) : (
                <h3 className="text-base font-semibold">{job.title}</h3>
              )}

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

            {job.postedTime && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {job.postedTime}
                </div>
              </>
            )}
          </div>

          {/* Status */}
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
        </div>
      </div>
    </div>
  );
}
