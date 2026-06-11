import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

export function CredentialAnimation() {
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="w-56 border bg-background p-4"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <span className="text-sm font-medium">Verified Credential</span>
        </div>

        <div className="mt-4 h-2 bg-muted" />

        <div className="mt-2 h-2 w-3/4 bg-muted" />

        <p className="mt-4 font-mono text-xs text-muted-foreground">
          0x7a9f...3c2e
        </p>
      </motion.div>
    </div>
  );
}
