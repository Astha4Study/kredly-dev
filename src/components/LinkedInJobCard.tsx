import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Briefcase, Clock, MapPin } from 'lucide-react';
import type { Job } from '@/lib/jobs-client';

interface LinkedInJobCardProps {
  job: Job;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();

    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;

    return date.toLocaleDateString('id-ID');
  } catch {
    return dateString;
  }
}

export function LinkedInJobCard({ job }: LinkedInJobCardProps) {
  return (
    <article className="border-b border-border transition-colors hover:bg-muted/30">
      <div className="flex gap-4 px-6 py-5">
        {/* Logo */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border bg-muted">
          {job.logo ? (
            <img
              src={job.logo}
              alt={job.company}
              className="h-full w-full object-contain p-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.textContent = job.company
                  .charAt(0)
                  .toUpperCase();
              }}
            />
          ) : (
            <span className="text-lg font-semibold">
              {job.company.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              {job.url ? (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex max-w-full items-center gap-2"
                >
                  <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">
                    {job.title}
                  </h3>
                </a>
              ) : (
                <h3 className="truncate text-lg font-semibold">{job.title}</h3>
              )}

              {/* Company */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                {job.companyUrl ? (
                  <a
                    href={job.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary"
                  >
                    {job.company}
                  </a>
                ) : (
                  <span className="font-medium">{job.company}</span>
                )}

                {job.recruiterName && (
                  <>
                    <span className="text-muted-foreground">•</span>

                    <span className="text-muted-foreground">
                      {job.recruiterName}
                    </span>
                  </>
                )}
              </div>
            </div>

            {(job.promoted || job.earlyApplicant) && (
              <div className="flex shrink-0 gap-2">
                {job.promoted && (
                  <Badge
                    variant="outline"
                    className="h-6 px-2 text-[11px] font-normal"
                  >
                    Promoted
                  </Badge>
                )}

                {job.earlyApplicant && (
                  <Badge
                    variant="outline"
                    className="h-6 px-2 text-[11px] font-normal"
                  >
                    Early Applicant
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location}</span>
            </div>

            {job.experienceLevel &&
              job.experienceLevel !== 'Not Applicable' && (
                <>
                  <Separator orientation="vertical" className="h-4" />

                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{job.experienceLevel}</span>
                  </div>
                </>
              )}

            {(job.postedDate || job.postedTime) && (
              <>
                <Separator orientation="vertical" className="h-4" />

                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />

                  <span>
                    {job.postedDate
                      ? formatDate(job.postedDate)
                      : job.postedTime}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          {(job.type || job.sector) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {job.type && <Badge variant="default">{job.type}</Badge>}

              {job.sector &&
                job.sector.split(',').map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill.trim()}
                  </Badge>
                ))}
            </div>
          )}

          {/* Description */}

          {job.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {job.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
