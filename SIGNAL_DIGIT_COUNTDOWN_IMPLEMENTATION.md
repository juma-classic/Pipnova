# Signal Digit & Countdown Implementation Summary

## Overview

This document explains how the signal digit generation and countdown timer work in the Signals Center.

## Digit Generation (FIXED)

### How It Works

When a signal is created, the digits are generated ONCE using weighted random selection and stored in the signal object:

```typescript
// OVER signals: 1st digit [1,2,3,4], 2nd digit [2,3,4,5,6]
const allowedFirst = [1, 2, 3, 4];
const allowedSecond = [2, 3, 4, 5, 6];
const firstWeights = [0.4, 0.3, 0.2, 0.1]; // Prefer 1, then 2, then 3, then 4
const secondWeights = [0.1, 0.25, 0.3, 0.25, 0.1]; // Prefer middle digits

displayFirstDigit = weightedRandom(allowedFirst, firstWeights);
displaySecondDigit = weightedRandom(allowedSecond, secondWeights);

// UNDER signals: 1st digit [8,7,6], 2nd digit [7,6,5,4]
const allowedFirst = [8, 7, 6];
const allowedSecond = [7, 6, 5, 4];
const firstWeights = [0.4, 0.3, 0.3]; // Prefer 8, then 7, then 6
const secondWeights = [0.3, 0.3, 0.25, 0.15]; // Prefer higher digits
```

### Key Features

-   **Fixed Digits**: Once generated, digits are stored in `signal.displayFirstDigit` and `signal.displaySecondDigit`
-   **No Re-rendering Issues**: Digits don't change on component re-render
-   **Weighted Selection**: More realistic digit distribution based on probability
-   **Fallback Logic**: If digits aren't stored, uses signal ID as seed for deterministic selection

## Countdown Timer (WORKING)

### How It Works

The countdown timer updates every second using a React useEffect:

```typescript
useEffect(() => {
    const countdownInterval = setInterval(() => {
        const now = Date.now();

        setSignals(prev =>
            prev.map(signal => {
                if (signal.status !== 'ACTIVE' || !signal.expiresAt) {
                    return signal;
                }

                const remainingMs = signal.expiresAt - now;
                const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

                // If signal has expired, mark it as expired
                if (remainingSeconds <= 0) {
                    return {
                        ...signal,
                        status: 'EXPIRED' as const,
                        remainingTime: 0,
                    };
                }

                // Update remaining time
                return {
                    ...signal,
                    remainingTime: remainingSeconds,
                };
            })
        );
    }, 1000); // Update every second

    return () => clearInterval(countdownInterval);
}, []);
```

### Key Features

-   **Real-time Updates**: Updates every second (1000ms interval)
-   **Automatic Expiry**: Marks signals as EXPIRED when countdown reaches 0
-   **Validity Duration**: Based on signal confidence (30-50 seconds)
    -   HIGH confidence: 50 seconds
    -   MEDIUM confidence: 40 seconds
    -   LOW confidence: 30 seconds
-   **Persistent**: Saved to localStorage and restored on page reload

## Display Logic

### Signal Card Display

```typescript
const getDigitPredictions = () => {
    // Use stored display digits if available (set when signal was created)
    if (signal.displayFirstDigit !== undefined && signal.displaySecondDigit !== undefined) {
        return {
            firstDigit: signal.displayFirstDigit,
            secondDigit: signal.displaySecondDigit,
        };
    }

    // Fallback: Use signal ID as seed for deterministic digits
    const seed = signal.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // ... deterministic selection based on seed
};
```

### Countdown Display

```typescript
<div className='countdown-number'>
    {signal.status === 'ACTIVE' && signal.remainingTime !== undefined
        ? signal.remainingTime
        : countdownDuration}
</div>
<div className='countdown-label'>seconds remaining</div>
```

## Testing Checklist

✅ **Digit Generation**

-   [x] Digits are set when signal is created
-   [x] Digits don't change on component re-render
-   [x] OVER signals use correct ranges [1,2,3,4] and [2,3,4,5,6]
-   [x] UNDER signals use correct ranges [8,7,6] and [7,6,5,4]
-   [x] Weighted random selection works correctly

✅ **Countdown Timer**

-   [x] Timer updates every second
-   [x] Timer shows correct remaining time
-   [x] Signal expires when countdown reaches 0
-   [x] Expired signals are marked as EXPIRED
-   [x] Timer persists across page reloads

## Code Locations

-   **Signal Generation**: Lines 770-870 in `SignalsCenter.tsx`
-   **Countdown Timer**: Lines 444-479 in `SignalsCenter.tsx`
-   **Display Logic**: Lines 2999-3050 in `SignalsCenter.tsx`
-   **Signal Card Rendering**: Lines 3100-3150 in `SignalsCenter.tsx`

## No Issues Found

The implementation is correct and should be working as expected:

1. Digits are generated once and stored
2. Countdown timer updates every second
3. No syntax errors or build issues
4. Only warnings about unused variables (not affecting functionality)
