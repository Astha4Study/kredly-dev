import { cn } from '@/lib/utils';
import type React from 'react';
import { GridPattern } from '@/components/ui/grid-pattern';

type FeatureType = {
  title: string;
  icon: React.ReactNode;
  description: string;
};

export function WhyTrustUsCard({
  feature,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  feature: FeatureType;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden border border-primary/20 bg-white p-6',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10',
        className,
      )}
      {...props}
    >
      <div className="mask-[radial-gradient(farthest-side_at_top,white,transparent)] pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 size-full transition-opacity duration-300 group-hover:opacity-80">
        <GridPattern
          className="absolute inset-0 size-full stroke-primary/40 transition-all duration-300 group-hover:stroke-primary/60"
          height={40}
          width={40}
          x={20}
        />
      </div>
      <div className="[&_svg]:size-6 [&_svg]:text-primary [&_svg]:transition-all [&_svg]:duration-300 group-hover:[&_svg]:scale-110 group-hover:[&_svg]:text-primary/90">
        {feature.icon}
      </div>
      <h3 className="mt-10 text-sm transition-colors duration-300 group-hover:text-primary md:text-base">
        {feature.title}
      </h3>
      <p className="relative z-20 mt-2 font-light text-muted-foreground text-xs transition-colors duration-300 group-hover:text-foreground/80">
        {feature.description}
      </p>
    </div>
  );
}
