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
