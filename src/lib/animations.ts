/**
 * Centralized animation utilities for Framer Motion
 * Provides reusable animation variants, timing constants, and helper functions
 */

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Standard fade-in with slide-up - most common pattern
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * Fade-in slide-up with custom delay
 */
export const fadeInUpDelayed = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/**
 * Scale-in animation for cards and containers
 */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * Slide in from left
 */
export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * Slide in from right
 */
export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * Blur transition for AnimatePresence (carousels, modals)
 */
export const blurTransition = {
  initial: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
};

/**
 * Container for staggered children animations
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/**
 * Individual stagger item (use with staggerContainer parent)
 */
export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

export const ANIMATION_DURATION = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.7,
  verySlow: 1.0,
} as const;

export const ANIMATION_EASE = {
  smooth: [0.22, 1, 0.36, 1] as const,
  snappy: [0.4, 0, 0.2, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
};

export const STAGGER_DELAY = {
  fast: 0.05,
  normal: 0.08,
  slow: 0.1,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create staggered animation for list/grid items
 * @param index - Item index in the list
 * @param delay - Delay between items (default: 0.08s)
 */
export const createStaggerAnimation = (
  index: number,
  delay: number = STAGGER_DELAY.normal,
) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: {
    duration: ANIMATION_DURATION.normal,
    delay: index * delay,
    ease: ANIMATION_EASE.smooth,
  },
});

/**
 * Respect user's reduced motion preference
 * Returns animation props or instant transition based on preference
 */
export const respectReducedMotion = <T extends Record<string, any>>(
  variants: T,
): T => {
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      return {
        ...variants,
        initial: variants.whileInView || variants.animate,
        whileInView: variants.whileInView || variants.animate,
        animate: variants.whileInView || variants.animate,
        transition: { duration: 0 },
      } as T;
    }
  }

  return variants;
};

/**
 * Default viewport configuration
 * Triggers animation slightly before element enters viewport
 */
export const defaultViewport = {
  once: true,
  margin: '0px 0px -50px 0px',
} as const;

/**
 * Spring animation configuration (for smooth, bouncy transitions)
 */
export const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};
