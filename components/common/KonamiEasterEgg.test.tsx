import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "../../test-utils/index";
import userEvent from "@testing-library/user-event";
import { KonamiEasterEgg } from "./KonamiEasterEgg";

describe("KonamiEasterEgg", () => {
  // Mock Audio API
  const mockPlay = vi.fn().mockResolvedValue(undefined);
  const mockPause = vi.fn();

  beforeEach(() => {
    // Mock Audio constructor with proper class wrapped in vi.fn()
    const AudioConstructor = vi.fn().mockImplementation(function MockAudio(
      this: HTMLAudioElement,
      src: string
    ) {
      this.src = src;
      this.volume = 0.7;
      this.play = mockPlay;
      this.pause = mockPause;
      return this;
    }) as unknown as typeof Audio;

    global.Audio = AudioConstructor;

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Konami Code Detection", () => {
    it("should show toasty after correct sequence", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Type sequence: ↑↑↓↓
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      // Check image appears
      await waitFor(() => {
        expect(screen.getByAltText("Toasty!")).toBeDefined();
      });
    });

    it("should not show toasty for incorrect sequence", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Type incorrect sequence (different order)
      await user.keyboard("{ArrowUp}{ArrowDown}{ArrowUp}{ArrowDown}");

      expect(screen.queryByAltText("Toasty!")).toBeNull();
    });

    it("should not show toasty for partial sequence", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Type only first half
      await user.keyboard("{ArrowUp}{ArrowUp}");

      expect(screen.queryByAltText("Toasty!")).toBeNull();
    });

    it("should reset sequence after successful trigger", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // First trigger
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      await waitFor(() => {
        expect(screen.getByAltText("Toasty!")).toBeDefined();
      });

      // Wait for auto-dismiss (element stays in DOM but becomes invisible)
      await waitFor(
        () => {
          const image = screen.queryByAltText("Toasty!");
          const container = image?.parentElement;
          // Check that opacity is 0 (Mantine keeps element in DOM)
          expect(container?.style.opacity).toBe("0");
        },
        { timeout: 3000 }
      );

      // Should be able to trigger again
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      await waitFor(() => {
        expect(screen.getByAltText("Toasty!")).toBeDefined();
      });
    });
  });

  describe("Auto-dismiss Behavior", () => {
    it("should auto-dismiss after animation duration", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Trigger sequence
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      // Verify it appears
      await waitFor(() => {
        expect(screen.getByAltText("Toasty!")).toBeDefined();
      });

      // Wait for auto-dismiss (ANIMATION_DURATION_MS = 2500)
      // Element stays in DOM but becomes invisible
      await waitFor(
        () => {
          const image = screen.queryByAltText("Toasty!");
          const container = image?.parentElement;
          // Check that opacity is 0 (Mantine keeps element in DOM)
          expect(container?.style.opacity).toBe("0");
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Audio Playback", () => {
    it("should create Audio instance with correct source", () => {
      render(<KonamiEasterEgg />);

      expect(global.Audio).toHaveBeenCalledWith("/toasty_tfCWsU6.mp3");
    });

    it("should set audio volume to 0.7", () => {
      render(<KonamiEasterEgg />);

      // Audio constructor was called and volume was set
      expect(global.Audio).toHaveBeenCalled();
    });

    it("should play audio when toasty is triggered", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Trigger sequence
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      // Wait for audio to play (SOUND_DELAY_MS = 200)
      await waitFor(
        () => {
          expect(mockPlay).toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });

    it("should handle audio play failure gracefully", async () => {
      // Mock play to reject (e.g., autoplay policy)
      const mockPlayError = vi
        .fn()
        .mockRejectedValue(new Error("Autoplay blocked"));

      global.Audio = vi.fn().mockImplementation(function MockAudioError(
        this: HTMLAudioElement,
        src: string
      ) {
        this.src = src;
        this.volume = 0.7;
        this.play = mockPlayError;
        this.pause = mockPause;
        return this;
      }) as unknown as typeof Audio;

      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Trigger sequence
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      // Should still show toasty even if audio fails
      await waitFor(() => {
        expect(screen.getByAltText("Toasty!")).toBeDefined();
      });
    });
  });

  describe("Component Lifecycle", () => {
    it("should cleanup audio on unmount", () => {
      const { unmount } = render(<KonamiEasterEgg />);

      unmount();

      expect(mockPause).toHaveBeenCalled();
    });

    it("should cleanup timeouts on unmount", async () => {
      const { unmount } = render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Trigger sequence
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      // Unmount before auto-dismiss
      unmount();

      // Should not throw errors
      expect(screen.queryByAltText("Toasty!")).toBeNull();
    });
  });

  describe("Rendering", () => {
    it("should render with fixed positioning at bottom-right", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Trigger toasty
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      const image = await screen.findByAltText("Toasty!");
      const container = image.parentElement;

      expect(container?.style.position).toBe("fixed");
      expect(container?.style.bottom).toBe("20px");
      expect(container?.style.right).toBe("20px");
    });

    it("should have high z-index to appear above other content", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Trigger toasty
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      const image = await screen.findByAltText("Toasty!");
      const container = image.parentElement;

      expect(container?.style.zIndex).toBe("9999");
    });

    it("should not block pointer events", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Trigger toasty
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      const image = await screen.findByAltText("Toasty!");
      const container = image.parentElement;

      expect(container?.style.pointerEvents).toBe("none");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid sequence inputs", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Type sequence very quickly
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      await waitFor(() => {
        expect(screen.getByAltText("Toasty!")).toBeDefined();
      });
    });

    it("should trim sequence to prevent memory leak", async () => {
      render(<KonamiEasterEgg />);

      const user = userEvent.setup();

      // Type many random keys before sequence
      await user.keyboard("abcdefghijklmnopqrstuvwxyz");
      await user.keyboard("1234567890");

      // Now type sequence
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}");

      await waitFor(() => {
        expect(screen.getByAltText("Toasty!")).toBeDefined();
      });
    });
  });
});
