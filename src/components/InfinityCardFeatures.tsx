import { cn } from '@/lib/utils';
import {
  Brain,
  Shield,
  Zap,
  Eye,
  Target,
  Cpu,
  type LucideIcon,
} from 'lucide-react';
import { Marquee } from './ui/marquee';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: 'AI Assessment',
    description:
      'Machine learning yang menganalisis skill secara mendalam dengan akurasi tinggi',
  },
  {
    icon: Shield,
    title: 'Blockchain Verified',
    description:
      'Credential tersimpan di blockchain yang tidak dapat dimanipulasi',
  },
  {
    icon: Zap,
    title: 'Real-time Validation',
    description: 'Verifikasi instan yang dapat diakses kapan saja, dimana saja',
  },
  {
    icon: Eye,
    title: 'Public Transparency',
    description:
      'Semua credential dapat diverifikasi secara publik dengan QR code',
  },
  {
    icon: Target,
    title: 'Skill Matching',
    description:
      'AI yang mencocokkan skill dengan job requirements secara otomatis',
  },
  {
    icon: Cpu,
    title: 'Live Sandbox',
    description:
      'Testing environment untuk membuktikan kemampuan coding secara real-time',
  },
];

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) => {
  return (
    <figure
      className={cn(`
        group
        relative
        w-80
        overflow-hidden
        border
        border-zinc-200
        bg-white
        p-6
        transition-all
        duration-500
        ease-out
        hover:-translate-y-1
        hover:border-primary/30
        hover:shadow-xl
      `)}
    >
      {/* Glow Effect */}
      <div
        className="
          absolute
          inset-0
          opacity-0
          transition-opacity
          duration-500
          group-hover:opacity-100
        "
      >
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Watermark Icon */}
      <Icon
        className="
          absolute
          -right-10
          -bottom-10
          size-40
          text-zinc-100
          transition-all
          duration-500
          ease-out
          group-hover:scale-110
          group-hover:text-primary/10
        "
        strokeWidth={1}
      />

      {/* Left Accent */}
      <div
        className="
          absolute
          left-0
          top-0
          h-full
          w-1
          origin-top
          scale-y-0
          bg-primary
          transition-transform
          duration-500
          group-hover:scale-y-100
        "
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Icon */}
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            border
            border-primary/20
            bg-primary/5
            text-primary
            transition-all
            duration-500
            group-hover:border-primary/30
            group-hover:bg-primary/10
          "
        >
          <Icon className="size-5" />
        </div>

        {/* Content */}
        <div className="mt-5">
          <h3
            className="
              text-xl
              font-semibold
              tracking-tight
              text-foreground
              transition-colors
              duration-500
              group-hover:text-primary
            "
          >
            {title}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Bottom Accent */}
        <div
          className="
            absolute
            bottom-0
            left-0
            h-0.5
            w-0
            bg-primary
            transition-all
            duration-500
            group-hover:w-full
          "
        />
      </div>
    </figure>
  );
};

export default function InfinityCardFeatures() {
  return (
    <div className="relative w-full overflow-hidden pb-8">
      <Marquee pauseOnHover className="[--duration:30s]">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </Marquee>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-linear-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-linear-to-l from-background" />
    </div>
  );
}