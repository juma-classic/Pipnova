# OVER Signal Digit Rules Update

## Changes Made

Updated digit prediction logic for OVER signals to follow strict rules that prevent invalid digit combinations.

## New Rules for OVER Signals

1. **1st digit maximum: 4**
    - Entry digit is capped at 4
    - Example: If entryDigit is 7, it becomes 4

2. **2nd digit maximum: 5**
    - Recovery/martingale digit is capped at 5
    - Example: If calculated digit is 7, it becomes 5

3. **2nd digit must be >= 1st digit**
    - The second digit must equal or exceed the first digit
    - No downgrade recovery (e.g., OVER3 cannot recover with OVER2)
    - Example: If 1st digit is 3, 2nd digit must be 3, 4, or 5

## Implementation

### Formula

```typescript
// For OVER signals:
firstDigit = Math.min(entryDigit, 4); // Cap at 4
secondDigit = Math.min(Math.max(firstDigit, entryDigit), 5); // Between firstDigit and 5
```

### Examples

| Entry Digit | 1st Digit | 2nd Digit | Explanation                |
| ----------- | --------- | --------- | -------------------------- |
| 2           | 2         | 2         | Both capped, 2nd >= 1st    |
| 3           | 3         | 3         | Both valid, 2nd >= 1st     |
| 4           | 4         | 4         | At max for 1st, 2nd >= 1st |
| 5           | 4         | 5         | 1st capped at 4, 2nd at 5  |
| 7           | 4         | 5         | 1st capped at 4, 2nd at 5  |
| 9           | 4         | 5         | 1st capped at 4, 2nd at 5  |

## Files Modified

### src/components/signals/SignalsCenter.tsx

Updated in 4 locations:

1. **calculateDigitPattern()** (line ~347)
    - Main digit pattern calculation function
    - Used when creating signal display

2. **Recovery Strategy** (line ~1610)
    - Calculates digits for adaptive recovery
    - Used in martingale/recovery logic

3. **Signal Card Display** (line ~2895)
    - Calculates digits shown in UI
    - Used for visual representation

4. **getEntryDigits()** (line ~2865)
    - Generates entry strategy digits
    - Shows recommended entry points

## Benefits

1. **Prevents Invalid Combinations**
    - No more OVER7, OVER8, OVER9 with high first digits
    - Ensures realistic digit predictions

2. **Consistent Recovery**
    - Recovery always maintains or increases digit
    - No downgrade from OVER3 to OVER2

3. **Better Win Probability**
    - Keeps predictions within realistic ranges
    - 1st digit ≤ 4 and 2nd digit ≤ 5 are more achievable

4. **Logical Progression**
    - Natural escalation: 2→3→4→5
    - Follows market behavior patterns

## Testing

To verify the changes:

1. Generate OVER signals with various entry digits (0-9)
2. Check that 1st digit never exceeds 4
3. Check that 2nd digit never exceeds 5
4. Verify 2nd digit is always >= 1st digit
5. Test recovery/martingale scenarios

## Notes

- UNDER signals remain unchanged (separate logic)
- EVEN/ODD and RISE/FALL signals unaffected
- Only applies to OVER signal types (OVER1, OVER2, OVER3, etc.)
