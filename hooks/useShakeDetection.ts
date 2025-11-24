import { useEffect, useRef } from "react";

type ShakeCallback = () => void;

const SHAKE_THRESHOLD = 15; // Configurable sensitivity
const SHAKE_TIMEOUT = 1000; // Cooldown between shakes (ms)

/**
 * Hook to detect device shake on mobile devices
 * Uses DeviceMotionEvent API to detect sudden acceleration changes
 *
 * @param callback - Function to call when shake is detected
 */
export function useShakeDetection(callback: ShakeCallback) {
  const lastShakeTimeRef = useRef(0);
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const current = Date.now();

      // Throttle: only check every 100ms
      if (current - lastUpdateRef.current < 100) return;

      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x, y, z } = acceleration;

      // Handle null values (default to 0)
      const xVal = x ?? 0;
      const yVal = y ?? 0;
      const zVal = z ?? 0;

      // Calculate movement delta
      const deltaX = Math.abs(xVal - lastPositionRef.current.x);
      const deltaY = Math.abs(yVal - lastPositionRef.current.y);
      const deltaZ = Math.abs(zVal - lastPositionRef.current.z);

      const totalDelta = deltaX + deltaY + deltaZ;

      // Check if shake threshold is exceeded and cooldown period has passed
      if (totalDelta > SHAKE_THRESHOLD) {
        const timeSinceLastShake = current - lastShakeTimeRef.current;

        if (timeSinceLastShake > SHAKE_TIMEOUT) {
          callback();
          lastShakeTimeRef.current = current;
        }
      }

      // Update last position and time
      lastPositionRef.current = { x: xVal, y: yVal, z: zVal };
      lastUpdateRef.current = current;
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [callback]);
}
