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
      className={cn('relative overflow-hidden bg-white p-6', className)}
      {...props}
    >
      <div className="mask-[radial-gradient(farthest-side_at_top,white,transparent)] pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 size-full">
        <GridPattern
          className="absolute inset-0 size-full stroke-primary/40"
          height={40}
          width={40}
          x={20}
        />
      </div>
      <div className="[&_svg]:size-6 [&_svg]:text-primary">{feature.icon}</div>
      <h3 className="mt-10 text-sm md:text-base">{feature.title}</h3>
      <p className="relative z-20 mt-2 font-light text-muted-foreground text-xs">
        {feature.description}
      </p>
    </div>
  );
}
