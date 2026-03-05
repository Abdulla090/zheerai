import type { Variants, Easing } from "framer-motion";

const ease: Easing = [0.25, 0.1, 0.25, 1];

export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const containerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};
