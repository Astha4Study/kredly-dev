/* eslint-disable react-hooks/exhaustive-deps */
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import LinkedinIcons from '@/assets/svg/Linkedin.svg';
import GlintsIcons from '@/assets/svg/Glints.svg';
import JobStreetIcons from '@/assets/svg/JobStreet.svg';

interface TrustProfile {
  field: string;
  sub: string;
  id: string;
  trustScore: number;
  recruiterViews: number;
  applications: number;
  interviews: number;
  jobs: {
    title: string;
    company: string;
    platform: string;
    match: number;
  }[];
}

const PLATFORMS = {
  linkedin: {
    label: 'LinkedIn',
    logo: LinkedinIcons,
    color: '#0a66c2',
    url: 'https://www.linkedin.com/jobs/search/?keywords=',
  },
  glints: {
    label: 'Glints',
    logo: GlintsIcons,
    color: '#4285f4',
    url: 'https://glints.com/id/opportunities/jobs/explore?keyword=',
  },
  jobstreet: {
    label: 'JobStreet',
    logo: JobStreetIcons,
    color: '#1a1a2e',
    url: 'https://www.jobstreet.co.id/jobs?keywords=',
  },
};

const PROFILE: TrustProfile = {
  field: 'Pemasaran Digital',
  sub: 'Manajemen Pemasaran',
  id: '2025-MKT-0847',
  trustScore: 98,
  recruiterViews: 247,
  applications: 12,
  interviews: 8,
  jobs: [
    {
      title: 'Digital Marketing Manager',
      company: 'Tokopedia',
      platform: 'linkedin',
      match: 98,
    },
    {
      title: 'Performance Marketing Lead',
      company: 'Gojek',
      platform: 'glints',
      match: 95,
    },
    {
      title: 'Brand Marketing Specialist',
      company: 'Shopee',
      platform: 'jobstreet',
      match: 92,
    },
  ],
};

const TODAY = (() => {
  const d = new Date();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${d.getFullYear()}-${months[d.getMonth()]}-${String(d.getDate()).padStart(2, '0')}`;
})();

function TrustIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function MetricPill({
  label,
  value,
  active,
  primary,
}: {
  label: string;
  value: number;
  active: boolean;
  primary?: boolean;
}) {
  return (
    <div
      className={[
        'relative flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1.5 sm:py-2 border-2 overflow-hidden bg-muted/30',
        active ? 'border-border' : 'border-border/60',
      ].join(' ')}
    >
      <span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <span
        className={[
          'font-mono text-[13px] sm:text-[15px] font-bold leading-none',
          primary ? 'text-primary' : 'text-foreground',
        ].join(' ')}
      >
        {value}
      </span>
      <motion.div
        className={[
          'absolute bottom-0 left-0 right-0 h-[2.5px]',
          primary ? 'bg-primary' : 'bg-foreground/60',
        ].join(' ')}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
}

function JobCard({
  job,
  visible,
  delay,
}: {
  job: {
    title: string;
    company: string;
    platform: string;
    match: number;
  };
  visible: boolean;
  delay: number;
}) {
  const platform = PLATFORMS[job.platform as keyof typeof PLATFORMS];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 10, scale: 0.95 }
      }
      transition={{
        duration: 0.5,
        delay: visible ? delay : 0,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="border border-border/40 rounded-md bg-background overflow-hidden hover:border-border transition-colors"
    >
      <div className="p-2 sm:p-2.5">
        <div className="flex items-start justify-between gap-2">
          {/* Platform Badge */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center text-white font-bold text-[9px] shrink-0 p-1">
            <img
              src={platform.logo}
              alt={platform.label}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] sm:text-[11px] font-semibold text-foreground truncate leading-tight">
              {job.title}
            </h4>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5">
              {job.company}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[7px] sm:text-[8px] font-medium text-muted-foreground">
                {platform.label}
              </span>
              <div className="h-0.5 w-0.5 rounded-full bg-border" />
              <span className="text-[7px] sm:text-[8px] font-mono font-semibold text-primary">
                {job.match}%
              </span>
            </div>
          </div>

          {/* External Link */}
          <a
            href={platform.url + encodeURIComponent(job.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </div>

        {/* Match Progress Bar */}
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={visible ? { width: `${job.match}%` } : { width: 0 }}
            transition={{
              duration: 0.8,
              delay: visible ? delay + 0.2 : 0,
              ease: 'easeOut',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

type Phase =
  | 'idle'
  | 'scan'
  | 'header'
  | 'presents'
  | 'title'
  | 'domain'
  | 'metrics'
  | 'metric-views'
  | 'metric-apps'
  | 'metric-interviews'
  | 'footer'
  | 'seal'
  | 'verified'
  | 'jobs'
  | 'hold';

const PHASE_ORDER: Phase[] = [
  'idle',
  'scan',
  'header',
  'presents',
  'title',
  'domain',
  'metrics',
  'metric-views',
  'metric-apps',
  'metric-interviews',
  'footer',
  'seal',
  'verified',
  'jobs',
  'hold',
];

function after(current: Phase, phases: Phase[]): boolean {
  return phases.some(
    (p) => PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(p),
  );
}

export function AccelerationCareerAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [isMobile, setIsMobile] = useState(false);
  const profile = PROFILE;
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const add = (fn: () => void, ms: number) =>
    timersRef.current.push(setTimeout(fn, ms));

  useEffect(() => {
    function updateMobile() {
      setIsMobile(window.innerWidth < 1024);
    }
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  const startLoop = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setPhase('idle');

    add(() => setPhase('scan'), 200);
    add(() => setPhase('header'), 500);
    add(() => setPhase('presents'), 1600);
    add(() => setPhase('title'), 1900);
    add(() => setPhase('domain'), 2200);
    add(() => setPhase('metrics'), 2600);
    add(() => setPhase('metric-views'), 3100);
    add(() => setPhase('metric-apps'), 3700);
    add(() => setPhase('metric-interviews'), 4300);
    add(() => setPhase('footer'), 4600);
    add(() => setPhase('seal'), 5200);
    add(() => setPhase('verified'), 5800);
    add(() => setPhase('jobs'), 6200);
    add(() => setPhase('hold'), 9000);
    add(() => startLoop(), 12000);
  };

  useEffect(() => {
    const t = setTimeout(startLoop, 400);
    return () => {
      clearTimeout(t);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const scanning = phase === 'scan';
  const headerVis = after(phase, ['header']);
  const presents = after(phase, ['presents']);
  const titleVis = after(phase, ['title']);
  const domainVis = after(phase, ['domain']);
  const metricsVis = after(phase, ['metrics']);
  const viewsActive = after(phase, ['metric-views']);
  const appsActive = after(phase, ['metric-apps']);
  const interviewsActive = after(phase, ['metric-interviews']);
  const footerVis = after(phase, ['footer']);
  const sealVis = after(phase, ['seal']);
  const verified = after(phase, ['verified']);
  const jobsVis = after(phase, ['jobs']);

  return (
    <div className="w-full px-3 sm:px-4">
      <div
        className="relative max-w-7xl mx-auto overflow-hidden lg:overflow-visible"
        style={{ minHeight: '500px' }}
      >
        <div className="flex gap-4 sm:gap-6 items-start relative">
          {/* Certificate Section - Left */}
          <motion.div
            animate={{
              x: jobsVis && isMobile ? '-100%' : 0,
              opacity: jobsVis && isMobile ? 0 : 1,
            }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="w-full lg:flex-1 lg:min-w-0 absolute lg:relative inset-0"
          >
            {/* Main Certificate */}
            <div className="relative top-22 w-full border-2 sm:border-[3px] border-border/30 bg-background overflow-hidden flex flex-col font-sans shadow-sm">
              {/* Inner decorative borders */}
              <div className="absolute inset-2 sm:inset-3 border sm:border-2 border-border/30 pointer-events-none z-0 rounded-sm" />
              <div className="absolute inset-3 sm:inset-5 border border-border/20 pointer-events-none z-0 hidden sm:block" />

              {/* Scan line */}
              <AnimatePresence>
                {scanning && (
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-primary/80 shadow-sm shadow-primary/50"
                    initial={{ bottom: 0, opacity: 0.8 }}
                    animate={{ bottom: '100%', opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, ease: 'linear' }}
                  />
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="relative z-3 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/30 shrink-0">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div>
                    <div className="text-[11px] sm:text-[13px] text-left font-bold text-foreground tracking-tight">
                      Kredly
                    </div>
                    <div className="font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
                      Trust Authority
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ opacity: headerVis ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-muted-foreground text-right leading-[1.6]"
                >
                  Recruiter
                  <br />
                  Confidence
                </motion.div>
              </div>

              {/* Body */}
              <div className="relative z-3 flex flex-col sm:flex-row px-4 sm:px-6 py-4 sm:py-5 gap-4 sm:gap-6 overflow-hidden">
                {/* Left content */}
                <div className="flex-1 flex flex-col justify-center sm:pr-6">
                  <motion.p
                    animate={{ opacity: presents ? 1 : 0, y: presents ? 0 : 6 }}
                    transition={{ duration: 0.4 }}
                    className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-2 sm:mb-2.5"
                  >
                    Recruiter trust for
                  </motion.p>

                  <motion.p
                    key={profile.field}
                    animate={{ opacity: titleVis ? 1 : 0, y: titleVis ? 0 : 8 }}
                    transition={{ duration: 0.5 }}
                    className="text-[20px] sm:text-[28px] leading-[1.15] tracking-tight text-foreground mb-1 sm:mb-1.5 font-serif"
                    style={{ fontWeight: 400 }}
                  >
                    {profile.field}
                  </motion.p>

                  <motion.p
                    key={profile.sub}
                    animate={{
                      opacity: domainVis ? 1 : 0,
                      y: domainVis ? 0 : 4,
                    }}
                    transition={{ duration: 0.4 }}
                    className="text-[10px] sm:text-[11px] text-muted-foreground mb-3 sm:mb-4"
                  >
                    {profile.sub}
                  </motion.p>

                  {/* Metrics */}
                  <motion.div
                    animate={{
                      opacity: metricsVis ? 1 : 0,
                      y: metricsVis ? 0 : 6,
                    }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-3 gap-1.5 sm:gap-2"
                  >
                    <MetricPill
                      label="Views"
                      value={profile.recruiterViews}
                      active={viewsActive}
                    />
                    <MetricPill
                      label="Applied"
                      value={profile.applications}
                      active={appsActive}
                    />
                    <MetricPill
                      label="Interviews"
                      value={profile.interviews}
                      active={interviewsActive}
                      primary
                    />
                  </motion.div>
                </div>

                {/* Vertical divider */}
                <div className="w-full sm:w-0.5 h-0.5 sm:h-auto bg-border shrink-0 sm:my-4" />

                {/* Right sidebar */}
                <div className="w-full sm:w-32.5 shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 sm:gap-4 sm:pl-4">
                  {/* Trust Score */}
                  <motion.div
                    animate={
                      sealVis
                        ? { opacity: 1, scale: 1, rotate: 0 }
                        : { opacity: 0, scale: 1.3, rotate: 10 }
                    }
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className={[
                      'relative w-16 h-16 sm:w-17.5 sm:h-17.5 rounded-full border-2 flex flex-col items-center justify-center gap-0.5 sm:gap-1 shrink-0',
                      verified
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-foreground text-foreground bg-muted/30',
                    ].join(' ')}
                  >
                    <div className="absolute inset-1.5 rounded-full border-[1.5px] border-dashed border-current/30" />
                    <TrustIcon className="relative z-1 w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="relative z-1 font-mono text-[10px] sm:text-[11px] font-bold">
                      {profile.trustScore}%
                    </span>
                  </motion.div>

                  {/* Meta info */}
                  <motion.div
                    animate={{ opacity: footerVis ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col sm:flex-col gap-3 sm:gap-2 w-full"
                  >
                    {[
                      { key: 'Issued', val: TODAY, mono: true },
                      {
                        key: 'Status',
                        val: verified ? 'Active' : 'Pending',
                        mono: false,
                      },
                      { key: 'Expires', val: '2027-06-14', mono: true },
                    ].map(({ key, val, mono }) => (
                      <div
                        key={key}
                        className="flex flex-row sm:flex-col gap-1 sm:gap-0.5 items-baseline sm:items-start"
                      >
                        <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-muted-foreground">
                          {key}:
                        </span>
                        <span
                          className={[
                            'text-[9px] sm:text-[10px] font-semibold text-foreground',
                            mono ? 'font-mono' : '',
                          ].join(' ')}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-3 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-border/30 shrink-0">
                <motion.div
                  animate={{ opacity: footerVis ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-0.5 sm:gap-1"
                >
                  <div className="h-0.5 w-12 sm:w-15 bg-foreground/40" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-foreground mt-0.5">
                    Kredly AI
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground">
                    Trust Validation
                  </span>
                </motion.div>

                <motion.div
                  animate={{ opacity: footerVis ? 1 : 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-right"
                >
                  <p className="font-mono text-[7px] sm:text-[8px] text-muted-foreground/60 mb-1 sm:mb-1.5">
                    {profile.id}
                  </p>
                  <div className="inline-flex items-center gap-1 sm:gap-1.5 font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.15em] font-semibold text-primary">
                    <motion.div
                      animate={{
                        scale: verified ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 0.4 }}
                      className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary"
                    />
                    {verified ? 'Trusted' : 'Validating'}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Job Cards Section - Right */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{
              x: jobsVis ? 0 : '100%',
              opacity: jobsVis ? 1 : 0,
            }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-22 left-0 right-0 lg:relative lg:w-80 lg:shrink-0 lg:opacity-100 lg:translate-x-0"
          >
            <div className="h-full flex flex-col bg-background px-3 sm:px-0 py-2 sm:py-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                  Lowongan Cocok
                </h3>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {profile.jobs.length} posisi
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                {profile.jobs.map((job, index) => (
                  <JobCard
                    key={`${profile.id}-job-${index}`}
                    job={job}
                    visible={jobsVis}
                    delay={index * 0.15}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
