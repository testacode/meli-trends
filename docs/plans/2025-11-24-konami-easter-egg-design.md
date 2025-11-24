# Easter Egg Design

**Date**: 2025-11-24
**Status**: Implemented (Desktop Only)
**Feature**: "Toasty" Easter Egg (Mortal Kombat homage)
**Trigger**: Simplified sequence ↑↑↓↓ (desktop keyboards)
**Note**: Mobile shake detection removed due to iOS 13+ permission complexity (2025-11-24)
**Simplification**: Sequence simplified from full Konami code to ↑↑↓↓ (2025-11-24)

## Overview

This design implements a fun easter egg that displays the "Toasty" animation and sound from Mortal Kombat games when users discover the hidden trigger. The feature works on desktop via simplified keyboard sequence.

**Updates**:
- **Mobile removal (2025-11-24)**: Mobile shake detection was removed to keep implementation simple. iOS 13+ requires explicit user permission via button interaction, adding unnecessary complexity for an easter egg feature.
- **Sequence simplification (2025-11-24)**: Simplified from full Konami code (↑↑↓↓←→←→BA) to just ↑↑↓↓ for better user experience and easier discovery.

## Goals

- **Fun user experience**: Hidden surprise for users who discover the trigger
- **Desktop-focused**: Works on any device with a keyboard
- **Non-intrusive**: Doesn't interfere with normal app usage
- **Zero dependencies**: Uses native browser APIs only
- **Performance**: Minimal overhead when not triggered
- **Maintainable**: Well-tested with clear code structure
- **Simple**: No complex permission flows or mobile-specific code

## User Behavior

### Activation
1. User types the sequence on keyboard: ↑ ↑ ↓ ↓
2. "Toasty" image slides in from bottom-right corner
3. Sound plays (after 200ms delay for sync)
4. Animation auto-dismisses after 2.5 seconds
5. Can be triggered unlimited times
6. Works on any device with physical or virtual keyboard

## Technical Implementation

### File Structure

```
components/
  common/
    KonamiEasterEgg.tsx       # Main component
    KonamiEasterEgg.test.tsx  # Component tests
hooks/
  useShakeDetection.ts        # Shake detection hook
  useShakeDetection.test.ts   # Hook tests
lib/
  transitions.ts              # Mantine transitions (add toastySlide)
public/
  chango-toasty.png          # Toasty image asset
  toasty_tfCWsU6.mp3         # Toasty sound asset
```

### Architecture Components

#### 1. Main Component (`KonamiEasterEgg.tsx`)

**Technology choices:**
- **Mantine `Transition` component**: Follows project pattern (see `lib/transitions.ts`)
- **Native Audio API**: Zero dependencies, perfect for simple sound playback
- **React hooks pattern**: Separation of concerns with multiple `useEffect` calls

**Configurable constants:**
```typescript
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];
const SOUND_DELAY_MS = 200;        // Tune for audio/animation sync
const ANIMATION_DURATION_MS = 2500; // Total display time
const IMAGE_SIZE = 200;             // Width/height in pixels
```

**State management:**
- `showToasty` (boolean): Controls visibility of animation
- `keySequence` (string[]): Tracks last 4 keypresses for sequence detection
- `audioRef` (ref): Audio instance (prevents re-renders)
- `dismissTimeoutRef` (ref): Cleanup timeout reference

**Effects separation (following React best practices):**
1. **Audio initialization effect**: Creates Audio instance once on mount
2. **Keyboard listener effect**: Detects arrow key sequence
3. **Toasty display effect**: Handles sound playback + auto-dismiss

#### 2. Shake Detection Hook (`useShakeDetection.ts`)

**Technology choice:** Native `DeviceMotionEvent` API
- ✅ Zero dependencies
- ✅ Well-supported (iOS 13+, Android Chrome)
- ✅ Reusable pattern
- ❌ Requires permission prompt on iOS 13+ (handled gracefully)

**Configuration:**
```typescript
const SHAKE_THRESHOLD = 15;  // Acceleration delta threshold
const SHAKE_TIMEOUT = 1000;  // Cooldown between triggers (ms)
```

**Algorithm:**
1. Listen to `devicemotion` events
2. Calculate total acceleration delta: `|ΔX| + |ΔY| + |ΔZ|`
3. If delta > threshold AND cooldown passed → trigger callback
4. Throttle checks to every 100ms (performance)
5. Track refs for last position/time (avoid state updates)

#### 3. Animation Transition (`toastySlide`)

**Added to `lib/transitions.ts`:**
```typescript
export const toastySlide: MantineTransition = {
  in: { opacity: 1, transform: "translate(0, 0)" },
  out: { opacity: 0, transform: "translate(100%, 100%)" },
  common: { transformOrigin: "bottom right" },
  transitionProperty: "opacity, transform",
};
```

**Why Mantine Transition:**
- ✅ Follows existing project pattern (see `fadeSlide`)
- ✅ CSS-in-JS (no separate CSS files)
- ✅ Type-safe
- ✅ Fully configurable duration/timing

### Integration Point

**Root Layout** (`app/[locale]/layout.tsx`):
```typescript
<MantineProvider theme={mantineTheme} defaultColorScheme="auto">
  <QueryProvider>
    <AuthProvider>
      {children}
      <KonamiEasterEgg /> {/* ← Added here, works on all pages */}
    </AuthProvider>
  </QueryProvider>
</MantineProvider>
```

**Why this location:**
- Component is inside `MantineProvider` (required for Transition)
- Outside route-specific content (persists across navigation)
- Client component with `'use client'` directive

## Visual Design

### Animation Sequence

```
0-20% of duration:  Slide up from bottom-right (enter)
20-80% of duration: Hold at visible position
80-100% of duration: Slide down to bottom-right (exit)
```

### Positioning

- **Position**: Fixed at bottom: 20px, right: 20px
- **Z-index**: 9999 (appears above all content)
- **Pointer events**: None (doesn't block clicks)
- **Image size**: 200x200 pixels

### Sound Timing

- Delay: 200ms after animation starts (configurable via `SOUND_DELAY_MS`)
- Volume: 0.7 (70%)
- Error handling: Silent fail if autoplay blocked by browser

## Testing Strategy

### Component Tests (`KonamiEasterEgg.test.tsx`)

**Coverage areas:**
1. **Sequence detection**
   - Correct sequence triggers toasty
   - Incorrect sequence doesn't trigger
   - Sequence reset after trigger
   - Can trigger multiple times

2. **Auto-dismiss behavior**
   - Disappears after `ANIMATION_DURATION_MS`
   - Cleanup on unmount

3. **Audio playback**
   - Audio instance created with correct source
   - Volume set to 0.7
   - Play called after delay
   - Graceful failure handling (autoplay blocked)

4. **Rendering**
   - Fixed positioning at bottom-right
   - High z-index
   - No pointer events blocking

5. **Edge cases**
   - Rapid sequence inputs
   - Long key sequences before trigger (memory trimming)

**Mocking strategy:**
- Mock `Audio` constructor and methods (not available in jsdom)
- Use `userEvent` for realistic keyboard interactions
- Use `waitFor` for async state changes

### Hook Tests (`useShakeDetection.test.ts`)

**Coverage areas:**
1. **Event listener setup**
   - Adds `devicemotion` listener on mount
   - Removes listener on unmount

2. **Shake detection**
   - Triggers when threshold exceeded
   - Doesn't trigger below threshold
   - Handles null/undefined acceleration data

3. **Cooldown period**
   - Respects 1000ms cooldown
   - Allows trigger after cooldown

4. **Throttling**
   - Processes events every 100ms max

5. **Edge cases**
   - Negative acceleration values
   - Single-axis movement
   - Rapid shake/stop patterns

**Mocking strategy:**
- Mock `DeviceMotionEvent` (not available in jsdom)
- Use fake timers for cooldown/throttle testing
- Test callback stability across re-renders

## Configuration & Tuning

### Adjustable Parameters

**In `KonamiEasterEgg.tsx`:**
- `SOUND_DELAY_MS`: Sync sound with animation (default: 200ms)
- `ANIMATION_DURATION_MS`: Total display time (default: 2500ms)
- `IMAGE_SIZE`: Toasty image dimensions (default: 200px)

**In `useShakeDetection.ts`:**
- `SHAKE_THRESHOLD`: Sensitivity (default: 15, lower = more sensitive)
- `SHAKE_TIMEOUT`: Cooldown between shakes (default: 1000ms)

### Tuning Recommendations

**Sound sync:**
- Increase `SOUND_DELAY_MS` if sound plays before image appears
- Decrease if sound plays too late

**Shake sensitivity:**
- Increase `SHAKE_THRESHOLD` if too many false positives
- Decrease if users need to shake too hard

## Performance Considerations

### Impact When Not Triggered

- **Keyboard listener**: Minimal overhead (single global listener)
- **Shake detection**: Only active on devices with accelerometer
- **Audio**: Lazy-loaded on mount (not preloaded)
- **Animation**: Only renders when triggered (conditional render)

### Impact When Triggered

- **Animation**: Hardware-accelerated CSS transforms (GPU)
- **Audio**: Small MP3 file (~50KB)
- **Re-renders**: Only when `showToasty` changes (2 renders per trigger)

## Browser Compatibility

### Desktop
- ✅ **Keyboard events**: All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ **Audio API**: All modern browsers
- ✅ **Mantine Transition**: All browsers supported by Mantine 8

### Mobile
- ✅ **DeviceMotionEvent**: iOS 13+, Android Chrome
- ⚠️ **iOS 13+ permission**: Requires user gesture to enable motion (handled gracefully)
- ✅ **Audio**: May be blocked by autoplay policy (silent fail)

## Edge Cases & Error Handling

### Handled Gracefully

1. **Audio autoplay blocked**: Component still shows animation, sound fails silently
2. **Rapid triggers**: Sequence reset prevents spam, cleanup prevents memory leaks
3. **Component unmount during animation**: Proper cleanup of timeouts and audio

### Known Limitations

1. **Safari autoplay**: May require user interaction before audio plays
2. **Low-end devices**: Animation might be less smooth (hardware-dependent)
3. **Virtual keyboards**: Mobile virtual keyboards may not support arrow keys easily

## Future Enhancements (YAGNI - Not Implemented)

These features were considered but excluded following YAGNI principle:

- ❌ Multiple easter eggs (one is enough)
- ❌ Configuration UI (constants are sufficient)
- ❌ Analytics tracking (privacy concern)
- ❌ Custom gestures (shake is sufficient)
- ❌ Achievement system (scope creep)
- ❌ Sharing feature (unnecessary complexity)

## Success Criteria

✅ **Functionality:**
- Triggers on ↑↑↓↓ sequence (keyboard input)
- Plays sound and animation correctly
- Auto-dismisses after timeout
- Works on any device with keyboard

✅ **Code Quality:**
- All tests passing (100% coverage)
- TypeScript with no errors
- ESLint with no warnings
- Follows project patterns

✅ **Performance:**
- No performance degradation when not triggered
- Smooth animation on modern devices
- No memory leaks

✅ **User Experience:**
- Non-intrusive (doesn't block interaction)
- Works across all pages
- Delightful surprise for users who discover it

## Design Decision: Removing Mobile Shake Detection

**Date**: 2025-11-24
**Decision**: Remove `useShakeDetection` hook and mobile shake functionality
**Reason**: iOS 13+ permission complexity outweighs benefit for easter egg feature

### Why Mobile Was Removed

**The Problem:**
- iOS 13+ requires explicit user permission for DeviceMotionEvent
- Permission must be requested via user gesture (button click)
- Cannot auto-start - requires UI element for permission prompt
- All iOS browsers (Chrome, Safari, Firefox) have same restriction due to WebKit

**The Tradeoff:**
- **Benefit**: Mobile users could shake to trigger easter egg
- **Cost**: Add permission UI, handle denials, explain iOS Settings, increase code complexity

**Conclusion:**
For an easter egg feature, the added complexity isn't worth it. Desktop keyboard sequence provides the core experience without permission flows or mobile-specific code.

## Design Decision: Simplifying the Sequence

**Date**: 2025-11-24
**Decision**: Simplify sequence from full Konami code (↑↑↓↓←→←→BA) to ↑↑↓↓
**Reason**: Better UX and easier discovery

### Why Sequence Was Simplified

**The Problem:**
- Full Konami code (10 keys) is too long and hard to discover
- Letters B and A at the end are less intuitive on modern keyboards
- Many users may not know the complete Konami code sequence

**The Tradeoff:**
- **Benefit**: Easier to discover, faster to type, more accessible
- **Cost**: Loses some nostalgia factor of the complete Konami code

**Conclusion:**
For better user experience, a simplified 4-key sequence (↑↑↓↓) is more accessible while still being fun and hidden enough to be a surprise.

### Files Kept

The following files remain in the codebase for reference but are not actively used:
- `hooks/useShakeDetection.ts` - Shake detection implementation
- `hooks/useShakeDetection.test.ts` - Hook tests

These can be reintroduced if permission flow is added in the future.

## References

- [MDN: DeviceMotionEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent)
- [MDN: HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
- [Mantine: Transition Component](https://mantine.dev/core/transition/)
- [Konami Code Wikipedia](https://en.wikipedia.org/wiki/Konami_Code) (inspiration for simplified sequence)
- [iOS 13+ DeviceMotion Permissions](https://dev.to/li/how-to-requestpermission-for-devicemotion-and-deviceorientation-events-in-ios-13-46g2)
