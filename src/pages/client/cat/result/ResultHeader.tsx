import * as React from 'react';
import pialaImg from '@/assets/images/piala.png';

interface ResultHeaderProps {
  role: string;
  level: string;
}

export default function ResultHeader({ role, level }: ResultHeaderProps) {
  return (
    <div className="relative text-left space-y-2 borer-t-4 border-t-primary border border-foreground/10 p-6 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md pr-24 select-none">
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
        Luar biasa, kamu {level} di {role}!
      </h1>
      <p className="text-sm md:text-base text-muted-foreground">
        Unduh dan bagikan bukti kompetensimu yang
        sudah terverifikasi blockchain.
      </p>
      <img
        src={pialaImg}
        alt="Piala"
        className="absolute -right-6 -bottom-4 size-43 md:size-40  object-contain pointer-events-none select-none"
      />
    </div>
  );
}
