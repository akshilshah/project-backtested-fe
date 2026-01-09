import type { ReactNode } from 'react';
import type { Variants } from 'framer-motion';
import type { Theme, SxProps } from '@mui/material/styles';

import { m, AnimatePresence } from 'framer-motion';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type PageTransitionProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export function PageTransition({ children, sx }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <m.div
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
      >
        <Box sx={sx}>{children}</Box>
      </m.div>
    </AnimatePresence>
  );
}

// ----------------------------------------------------------------------

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  sx?: SxProps<Theme>;
};

export function FadeIn({ children, delay = 0, sx }: FadeInProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          delay,
          ease: 'easeOut',
        },
      }}
    >
      <Box sx={sx}>{children}</Box>
    </m.div>
  );
}

// ----------------------------------------------------------------------

type StaggerContainerProps = {
  children: ReactNode;
  staggerDelay?: number;
  sx?: SxProps<Theme>;
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
};

export function StaggerContainer({ children, staggerDelay = 0.1, sx }: StaggerContainerProps) {
  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={{
        ...staggerContainerVariants,
        visible: {
          ...staggerContainerVariants.visible,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      <Box sx={sx}>{children}</Box>
    </m.div>
  );
}

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export function StaggerItem({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <m.div variants={staggerItemVariants}>
      <Box sx={sx}>{children}</Box>
    </m.div>
  );
}
