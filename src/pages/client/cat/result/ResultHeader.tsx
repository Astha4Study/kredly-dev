import * as React from 'react';
import { Award } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultHeaderProps {
  role: string;
}

export default function ResultHeader({ role }: ResultHeaderProps) {
  return (
    <div className="text-center space-y-3">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2"
      >
        <Award className="size-8" />
      </motion.div>
      <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
        Assessment CAT Selesai
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Hasil evaluasi adaptif komprehensif Anda untuk posisi{' '}
        <strong className="text-foreground">{role}</strong>.
      </p>
    </div>
  );
}
