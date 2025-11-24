"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Image, Transition } from "@mantine/core";
import { toastySlide } from "@/lib/transitions";

// Configuration constants for easy tuning
const KONAMI_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"];
const ENTER_DURATION_MS = 200; // How fast it enters (slide in)
const VISIBLE_DURATION_MS = 700; // How long it stays on screen
const EXIT_DURATION_MS = 150; // How fast it exits (slide out - faster than enter)
const SOUND_DELAY_MS = 200; // Adjust to sync sound with animation
const IMAGE_SIZE = 200; // Width and height of the toasty image

/**
 * Easter egg component that displays "Toasty" animation and sound
 * Triggered by sequence: ↑↑↓↓
 */
export function KonamiEasterEgg() {
  const [showToasty, setShowToasty] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio once on mount
  useEffect(() => {
    audioRef.current = new Audio("/toasty_tfCWsU6.mp3");
    audioRef.current.volume = 0.7;

    return () => {
      // Cleanup: pause and clear audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Desktop: Konami code detection
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Normalize key input (handle both 'b'/'B' and 'a'/'A')
      const key = event.key.toLowerCase();

      // Prevent browser extension errors by stopping propagation for arrow keys
      if (key.startsWith("arrow")) {
        event.stopPropagation();
      }

      setKeySequence((prev) => {
        const newSequence = [...prev, key];

        // Keep only the last N keys (where N = KONAMI_CODE length)
        const trimmedSequence = newSequence.slice(-KONAMI_CODE.length);

        // Check if sequence matches Konami code
        const isMatch = trimmedSequence.every(
          (k, index) => k === KONAMI_CODE[index].toLowerCase()
        );

        if (isMatch) {
          setShowToasty(true);
          return []; // Reset sequence after successful trigger
        }

        return trimmedSequence;
      });
    };

    window.addEventListener("keydown", handleKeyPress, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyPress, { capture: true });
  }, []);

  // Handle toasty display: play sound and auto-dismiss
  useEffect(() => {
    if (showToasty) {
      // Play sound after configurable delay
      const soundTimeout = setTimeout(() => {
        audioRef.current?.play().catch((err) => {
          // Silent fail - audio autoplay might be blocked by browser
          console.debug("Audio play failed:", err);
        });
      }, SOUND_DELAY_MS);

      // Auto-dismiss: wait for enter + visible time, then trigger exit
      dismissTimeoutRef.current = setTimeout(() => {
        setShowToasty(false);
      }, ENTER_DURATION_MS + VISIBLE_DURATION_MS);

      return () => {
        clearTimeout(soundTimeout);
        if (dismissTimeoutRef.current) {
          clearTimeout(dismissTimeoutRef.current);
        }
      };
    }
  }, [showToasty]);

  return (
    <Transition
      mounted={showToasty}
      transition={toastySlide}
      duration={ENTER_DURATION_MS}
      exitDuration={EXIT_DURATION_MS}
      timingFunction="ease-out"
    >
      {(styles) => (
        <Box
          style={{
            ...styles,
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 9999,
            pointerEvents: "none", // Doesn't block clicks
          }}
        >
          <Image
            src="/chango-toasty.png"
            alt="Toasty!"
            w={IMAGE_SIZE}
            h={IMAGE_SIZE}
            style={{ display: "block" }}
          />
        </Box>
      )}
    </Transition>
  );
}
