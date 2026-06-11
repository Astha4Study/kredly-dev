import { motion } from 'motion/react';

export function TrustAnimation() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-60 border bg-background p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Recruiter Confidence</span>

          <motion.span
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-primary"
          >
            +98%
          </motion.span>
        </div>

        <div className="mt-4 h-2 bg-muted">
          <motion.div
            animate={{
              width: ['40%', '92%', '40%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="h-full bg-primary"
          />
        </div>
      </div>
    </div>
  );
}
