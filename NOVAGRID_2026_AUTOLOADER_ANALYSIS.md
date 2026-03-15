# NOVAGRID 2026 Autoloader Analysis & Proposed Changes

## Current State

### Signal Card Display

The signal cards currently show:

-   Market name and code (e.g., "VOLATILITY 10 (1s)")
-   1st and 2nd digit predictions
-   Trade direction (OVER/UNDER)
-   Signal duration countdown (seconds remaining)
-   Strength (confidence %) and duration

### NOVAGRID 2026 Engine Parameters

The Novagrid2026Engine generates signals with:

-   `type`: 'Overs' or 'Unders'
-   `firstDigit` and `secondDigit`: Digit predictions (1-4 for Overs, 8-7 for Unders)
-   `confidence`: 70-98% (calculated from weighted formula)
-   `weightScore`: Weight score from digit analysis
-   `timeToLive`: Remaining time in seconds
-   `volatility`: Market symbol (R_50, 1HZ10V, etc.)
-   `status`: 'active' or 'expired'

### Current Autoloader (loadNovagridBot)

The function currently:

1. Sets market (SYMBOL_LIST) from signal.market
2. Sets contract type (DIGITOVER/DIGITUNDER) based on signal.type
3. Sets search number to signal.entryDigit
4. Applies adaptive recovery strategy
5. Updates prediction digit with smart barrier adjustment
6. Applies StakeManager settings (stake, martingale)
7. Sets Amount = Initial Stake
8. Auto-runs the bot

## Proposed Changes to Autoloader

### Option 1: Align with NOVAGRID 2026 Digit Ranges

**Current behavior**: Uses signal.entryDigit as search number
**Proposed change**: Use firstDigit and secondDigit from NOVAGRID 2026 engine

```
For OVER signals:
- 1st digit: [1, 2, 3, 4] (weighted)
- 2nd digit: [2, 3, 4, 5, 6] (weighted)
- Set search number to firstDigit
- Set prediction barrier to secondDigit

For UNDER signals:
- 1st digit: [8, 7, 6] (weighted)
- 2nd digit: [7, 6, 5, 4] (weighted)
- Set search number to firstDigit
- Set prediction barrier to secondDigit
```

### Option 2: Use Confidence Score for Dynamic Stake

**Current behavior**: Uses StakeManager.getStake() (fixed)
**Proposed change**: Scale stake based on confidence percentage

```
confidence 70-75% → 1x stake
confidence 75-85% → 1.5x stake
confidence 85-95% → 2x stake
confidence 95-98% → 2.5x stake
```

### Option 3: Use Weight Score for Martingale Adjustment

**Current behavior**: Uses StakeManager.getMartingale() (fixed)
**Proposed change**: Adjust martingale based on weightScore

```
weightScore < 50 → 2x martingale
weightScore 50-75 → 3x martingale
weightScore 75-100 → 4x martingale
weightScore > 100 → 5x martingale
```

### Option 4: Use Volatility for Market Selection

**Current behavior**: Uses signal.market directly
**Proposed change**: Map NOVAGRID 2026 volatility to bot markets

```
R_10 → VOLATILITY 10
R_25 → VOLATILITY 25
R_50 → VOLATILITY 50
R_75 → VOLATILITY 75
R_100 → VOLATILITY 100
1HZ10V → VOLATILITY 10 (1s)
1HZ25V → VOLATILITY 25 (1s)
etc.
```

### Option 5: Use Time-to-Live for Signal Expiry

**Current behavior**: Uses fixed 60-second countdown
**Proposed change**: Use signal.timeToLive from NOVAGRID 2026

```
Set bot timeout = signal.timeToLive
Auto-stop bot if signal expires
```

## Questions for User

1. **Which digit ranges should the autoloader use?**

    - Option A: Use firstDigit and secondDigit from NOVAGRID 2026 engine
    - Option B: Keep using entryDigit as search number
    - Option C: Use both (firstDigit as search, secondDigit as barrier)

2. **Should stake be dynamic based on confidence?**

    - Yes: Scale stake based on confidence percentage
    - No: Keep using StakeManager fixed stake

3. **Should martingale be dynamic based on weight score?**

    - Yes: Adjust martingale based on weightScore
    - No: Keep using StakeManager fixed martingale

4. **Should the bot respect signal expiry time?**

    - Yes: Auto-stop bot when signal expires
    - No: Keep using fixed 60-second timeout

5. **Are there any other bot block parameters that need to be set?**
    - List any additional parameters from the new bot blocks

## Implementation Priority

1. **High Priority**: Align digit ranges (Option 1) - Core functionality
2. **Medium Priority**: Use confidence for stake (Option 2) - Risk management
3. **Medium Priority**: Use weight score for martingale (Option 3) - Risk management
4. **Low Priority**: Use time-to-live for expiry (Option 5) - Signal lifecycle
5. **Low Priority**: Volatility mapping (Option 4) - Already working
