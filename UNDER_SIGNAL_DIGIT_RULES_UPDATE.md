# UNDER Signal Digit Rules Update

## Changes Made

Updated digit prediction logic for UNDER signals to follow strict rules that ensure valid digit combinations.

## New Rules for UNDER Signals

1. **1st digit minimum: 5**
    - Entry digit is floored at 5
    - Example: If entryDigit is 3, it becomes 5

2. **2nd digit minimum: 4**
    - Recovery/martingale digit is floored at 4
    - Example: If calculated digit is 2, it becomes 4

3. **2nd digit must be <= 1st digit**
    - The second digit must equal or be less than the first digit
    - Recovery goes down, not up (e.g., UNDER7 can recover with UNDER6 or UNDER5)
    - Example: If 1st digit is 5, 2nd digit must be 4 or 5

## Implementation

### Formula

```typescript
// For UNDER signals:
firstDigit = Math.max(entryDigit, 5); // Floor at 5
secondDigit = Math.max(Math.min(firstDigit, entryDigit), 4); // Between 4 and firstDigit
```

### Examples

| Entry Digit | 1st Digit | 2nd Digit | Explanation                |
| ----------- | --------- | --------- | -------------------------- |
| 2           | 5         | 4         | 1st floored at 5, 2nd at 4 |
| 3           | 5         | 4         | 1st floored at 5, 2nd at 4 |
| 4           | 5         | 4         | 1st floored at 5, 2nd at 4 |
| 5           | 5         | 5         | Both valid, 2nd <= 1st     |
| 6           | 6         | 6         | Both valid, 2nd <= 1st     |
| 7           | 7         | 7         | Both valid, 2nd <= 1st     |
| 8           | 8         | 8         | Both valid, 2nd <= 1st     |
| 9           | 9         | 9         | Both valid, 2nd <= 1st     |

## Complete Rules Summary

### OVER Signals

- 1st digit: max 4
- 2nd digit: max 5
- 2nd digit >= 1st digit (recovery goes up)

### UNDER Signals

- 1st digit: min 5
- 2nd digit: min 4
- 2nd digit <= 1st digit (recovery goes down)

## Files Modified

### src/components/signals/SignalsCenter.tsx

Updated in 3 locations:

1. **Recovery Strategy** (line ~1610)
    - Calculates digits for adaptive recovery
    - Used in martingale/recovery logic

2. **Signal Card Display - getDigitPredictions()** (line ~2900)
    - Calculates digits shown in UI
    - Used for visual representation

3. **Signal Card Display - getEntryDigits()** (line ~2865)
    - Generates entry strategy digits
    - Shows recommended entry points

## Logic Comparison

### OVER Signals (Ascending Recovery)

```
Entry: 2 → Digits: [2, 2] → Recovery: 2→3→4→5
Entry: 3 → Digits: [3, 3] → Recovery: 3→4→5
Entry: 4 → Digits: [4, 4] → Recovery: 4→5
Entry: 5 → Digits: [4, 5] → Recovery: 4→5
```

### UNDER Signals (Descending Recovery)

```
Entry: 5 → Digits: [5, 5] → Recovery: 5→4
Entry: 6 → Digits: [6, 6] → Recovery: 6→5→4
Entry: 7 → Digits: [7, 7] → Recovery: 7→6→5→4
Entry: 8 → Digits: [8, 8] → Recovery: 8→7→6→5→4
```

## Benefits

1. **Prevents Invalid Combinations**
    - No more UNDER2, UNDER3 with low first digits
    - Ensures realistic digit predictions

2. **Consistent Recovery**
    - OVER recovery escalates (2→3→4→5)
    - UNDER recovery descends (7→6→5→4)

3. **Better Win Probability**
    - Keeps predictions within realistic ranges
    - Symmetric logic for OVER/UNDER

4. **Logical Progression**
    - OVER: Ascending (more aggressive)
    - UNDER: Descending (more conservative)

## Testing

To verify the changes:

1. Generate UNDER signals with various entry digits (0-9)
2. Check that 1st digit is never less than 5
3. Check that 2nd digit is never less than 4
4. Verify 2nd digit is always <= 1st digit
5. Test recovery/martingale scenarios

## Notes

- OVER signals use ascending recovery (2→3→4→5)
- UNDER signals use descending recovery (7→6→5→4)
- EVEN/ODD and RISE/FALL signals unaffected
- Only applies to UNDER signal types (UNDER1, UNDER2, UNDER3, etc.)
