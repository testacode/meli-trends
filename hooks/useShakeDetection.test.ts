import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@/test-utils";
import { useShakeDetection } from "./useShakeDetection";

type ShakeCallback = () => void;

describe("useShakeDetection", () => {
  let mockCallback: ShakeCallback;

  beforeEach(() => {
    mockCallback = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Event Listener Setup", () => {
    it("should add devicemotion event listener on mount", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");

      renderHook(() => useShakeDetection(mockCallback));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "devicemotion",
        expect.any(Function)
      );
    });

    it("should remove devicemotion event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useShakeDetection(mockCallback));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "devicemotion",
        expect.any(Function)
      );
    });
  });

  describe("Shake Detection", () => {
    it("should trigger callback when shake threshold is exceeded", () => {
      vi.useFakeTimers();

      renderHook(() => useShakeDetection(mockCallback));

      // Simulate first motion event (establish baseline)
      const event1 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event1);

      // Wait for throttle (100ms)
      vi.advanceTimersByTime(100);

      // Simulate shake (large acceleration change)
      const event2 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event2);

      // Should trigger callback (total delta = 60 > threshold 15)
      expect(mockCallback).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it("should not trigger callback when shake is below threshold", () => {
      vi.useFakeTimers();

      renderHook(() => useShakeDetection(mockCallback));

      // Simulate first motion event
      const event1 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event1);

      vi.advanceTimersByTime(100);

      // Simulate small movement (below threshold)
      const event2 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 1, y: 1, z: 1 },
      });
      window.dispatchEvent(event2);

      // Should not trigger (total delta = 3 < threshold 15)
      expect(mockCallback).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it("should handle null acceleration data gracefully", () => {
      renderHook(() => useShakeDetection(mockCallback));

      // Simulate event with no acceleration data
      const event = new DeviceMotionEvent("devicemotion");
      window.dispatchEvent(event);

      // Should not throw or trigger callback
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should handle undefined acceleration values", () => {
      vi.useFakeTimers();

      renderHook(() => useShakeDetection(mockCallback));

      // Simulate first event with undefined values
      const event1 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: {},
      });
      window.dispatchEvent(event1);

      vi.advanceTimersByTime(100);

      // Simulate second event
      const event2 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 10, y: 10, z: 10 },
      });
      window.dispatchEvent(event2);

      // Should handle gracefully (default to 0 for undefined values)
      expect(mockCallback).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("Cooldown Period", () => {
    it("should respect cooldown period between shake triggers", () => {
      vi.useFakeTimers();

      renderHook(() => useShakeDetection(mockCallback));

      // First shake
      const event1 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event1);

      vi.advanceTimersByTime(100);

      const event2 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event2);

      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Immediate second shake (within cooldown)
      vi.advanceTimersByTime(100);

      const event3 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event3);

      vi.advanceTimersByTime(100);

      const event4 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event4);

      // Should not trigger (within 1000ms cooldown)
      expect(mockCallback).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it("should allow shake trigger after cooldown period", () => {
      vi.useFakeTimers();

      renderHook(() => useShakeDetection(mockCallback));

      // First shake
      const event1 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event1);

      vi.advanceTimersByTime(100);

      const event2 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event2);

      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Wait for cooldown period to pass (1000ms)
      vi.advanceTimersByTime(1100);

      // Second shake after cooldown
      const event3 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event3);

      vi.advanceTimersByTime(100);

      const event4 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event4);

      // Should trigger again (cooldown period passed)
      expect(mockCallback).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe("Throttling", () => {
    it("should throttle motion events to every 100ms", () => {
      vi.useFakeTimers();

      let callCount = 0;
      const throttledCallback = vi.fn(() => {
        callCount++;
      });

      renderHook(() => useShakeDetection(throttledCallback));

      // Establish baseline
      const baseline = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(baseline);
      vi.advanceTimersByTime(100);

      // Send multiple shake events rapidly (every 10ms)
      // Due to throttling, not all should be processed
      for (let i = 0; i < 10; i++) {
        const event = new DeviceMotionEvent("devicemotion", {
          accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
        });
        window.dispatchEvent(event);
        vi.advanceTimersByTime(10);

        // Reset position
        const resetEvent = new DeviceMotionEvent("devicemotion", {
          accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
        });
        window.dispatchEvent(resetEvent);
        vi.advanceTimersByTime(10);
      }

      // Should only process some events, not all 10
      // With 100ms throttle and 10ms intervals, we expect 1-2 callbacks max
      expect(callCount).toBeLessThanOrEqual(2);
      expect(callCount).toBeGreaterThanOrEqual(1);

      vi.useRealTimers();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid shake and stop pattern", () => {
      vi.useFakeTimers();

      renderHook(() => useShakeDetection(mockCallback));

      // Rapid shakes
      const event1 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event1);

      vi.advanceTimersByTime(100);

      const event2 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event2);

      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Stop shaking
      vi.advanceTimersByTime(100);

      const event3 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event3);

      // No change in position, should not trigger again
      expect(mockCallback).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it("should handle negative acceleration values", () => {
      vi.useFakeTimers();

      renderHook(() => useShakeDetection(mockCallback));

      const event1 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: -10, y: -10, z: -10 },
      });
      window.dispatchEvent(event1);

      vi.advanceTimersByTime(100);

      const event2 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 10, y: 10, z: 10 },
      });
      window.dispatchEvent(event2);

      // Should calculate absolute delta correctly
      expect(mockCallback).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it("should calculate delta correctly for single axis movement", () => {
      vi.useFakeTimers();

      renderHook(() => useShakeDetection(mockCallback));

      const event1 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event1);

      vi.advanceTimersByTime(100);

      // Large movement on single axis
      const event2 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 0, z: 0 },
      });
      window.dispatchEvent(event2);

      // Should trigger (delta = 20 > threshold 15)
      expect(mockCallback).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("Multiple Triggers", () => {
    it("should trigger callback multiple times after cooldown", () => {
      vi.useFakeTimers();

      renderHook(() => useShakeDetection(mockCallback));

      // First shake
      const event1 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event1);

      vi.advanceTimersByTime(100);

      const event2 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event2);

      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Wait for cooldown
      vi.advanceTimersByTime(1100);

      // Second shake
      const event3 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event3);

      vi.advanceTimersByTime(100);

      const event4 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event4);

      expect(mockCallback).toHaveBeenCalledTimes(2);

      // Third shake after cooldown
      vi.advanceTimersByTime(1100);

      const event5 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      });
      window.dispatchEvent(event5);

      vi.advanceTimersByTime(100);

      const event6 = new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 20, y: 20, z: 20 },
      });
      window.dispatchEvent(event6);

      expect(mockCallback).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });
  });
});
