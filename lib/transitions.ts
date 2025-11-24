import type { MantineTransition } from "@mantine/core";

/**
 * Custom transition that combines fade with a subtle upward slide
 * Perfect for smooth country transitions in the trends pages
 */
export const fadeSlide: MantineTransition = {
  in: { opacity: 1, transform: "translateY(0)" },
  out: { opacity: 0, transform: "translateY(-10px)" },
  transitionProperty: "opacity, transform",
};

/**
 * Custom transition for the Toasty easter egg
 * Slides in from bottom-right corner and slides out the same way
 */
export const toastySlide: MantineTransition = {
  in: {
    opacity: 1,
    transform: "translate(0, 0)",
  },
  out: {
    opacity: 0,
    transform: "translate(100%, 100%)",
  },
  common: {
    transformOrigin: "bottom right",
  },
  transitionProperty: "opacity, transform",
};
