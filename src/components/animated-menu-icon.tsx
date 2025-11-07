"use client";

import { motion } from "framer-motion";

interface AnimatedMenuIconProps {
  isOpen: boolean;
}

const lineVariants = {
  transition: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

const top_line = {
  closed: {
    rotate: 0,
    translateY: 0,
  },
  open: {
    rotate: 45,
    translateY: 6, // Corrected value from 8 to 6
  },
};

const middle_line = {
  closed: {
    opacity: 1,
  },
  open: {
    opacity: 0,
  },
};

const bottom_line = {
  closed: {
    rotate: 0,
    translateY: 0,
  },
  open: {
    rotate: -45,
    translateY: -6, // Corrected value from -8 to -6
  },
};

export const AnimatedMenuIcon = ({ isOpen }: AnimatedMenuIconProps) => {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      className="stroke-current"
    >
      <motion.line
        x1="4"
        y1="6"
        x2="20"
        y2="6"
        variants={{ ...top_line, ...lineVariants }}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <motion.line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        variants={{ ...middle_line, ...lineVariants }}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <motion.line
        x1="4"
        y1="18"
        x2="20"
        y2="18"
        variants={{ ...bottom_line, ...lineVariants }}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
};