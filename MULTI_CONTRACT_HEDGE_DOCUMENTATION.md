# Multi-Contract Hedge Strategy - Documentation

## Overview

The Multi-Contract Hedge Strategy system allows traders to manually configure and execute hedging strategies for digit trading by selecting OVER and UNDER barriers. This creates a risk-managed approach where multiple outcomes result in profit.

## Features

### 1. Manual Barrier Selection

- **OVER Barrier**: Select digits 0-8 (win if result > barrier)
- **UNDER Barrier**: Select digits 1-9 (win if result < barrier)
- Visual digit selector with disabled states to prevent invalid configurations
- Real-time coverage display showing which digits are covered

### 2. Stake Configuration

- Individual stake inputs for OVER and UNDER contracts
- Auto-optimize feature to distribute stakes based on probability
- Balance validation to prevent over-staking

### 3. Real-Time Analysis

- **Coverage Visualization**: 10-digit grid showing win/loss/partial outcomes
- **Win Probability**: Calculated based on covered digits
- **Profit Range**: Best case and worst case scenarios
- **Gap Analysis**: Shows which digits result in losses

### 4. Smart Validation

- Prevents invalid barrier combinations (OVER >= UNDER)
- Ensures at least one barrier is selected
- Validates stake amounts against balance
- Real-time error messages

## File Structure

```
src/
├── services/
│   └── multi-contract-hedge.service.ts    # Core hedging logic
├── components/
│   └── hedge-strategy/
│       ├── HedgeStrategyPanel.tsx         # Main UI component
│       └── HedgeStrategyPanel.scss        # Styling
└── pages/
    ├── hedge-strategy-page.tsx            # Page wrapper
    └── hedge-strategy-page.scss           # Page styling
```

## Usage

### Accessing the Page

Navigate to `/dashboard/hedge-strategy` in your application.

### Creating a Hedge

1. **Select OVER Barrier** (optional)
    - Click a digit from 0-8
    - Enter stake amount
    - See covered digits (all digits > barrier)

2. **Select UNDER Barrier** (optional)
    - Click a digit from 1-9
    - Enter stake amount
    - See covered digits (all digits < barrier)

3. **Configure Duration**
    - Set contract duration (1-100)
    - Choose unit: Ticks, Seconds, or Minutes

4. **Review Analysis**
    - Check coverage visualization
    - Review win probability
    - Verify profit/loss ranges

5. **Execute Strategy**
    - Click "Execute Hedge Strategy"
    - Confirm contract placement

## Example Strategies

### Conservative Strategy (High Win Rate)

```
OVER Barrier: 2
UNDER Barrier: 8
Stakes: Equal ($10 each)

Coverage: 0,1,3,4,5,6,7,9 (80%)
Gap: 2,8 (20%)
Win Probability: 80%
```

### Balanced Strategy (Medium Risk)

```
OVER Barrier: 3
UNDER Barrier: 7
Stakes: Equal ($10 each)

Coverage: 0,1,2,4,5,6,8,9 (80%)
Gap: 3,7 (20%)
Win Probability: 80%
```

### Aggressive Strategy (High Profit)

```
OVER Barrier: 4
UNDER Barrier: 6
Stakes: Equal ($10 each)

Coverage: 0,1,2,3,7,8,9 (70%)
Gap: 4,5,6 (30%)
Win Probability: 70%
Best Case: Higher profit when both win
```

## Service API

### `multiContractHedgeService`

#### Methods

**`analyzeHedgeConfiguration(config: HedgeConfiguration): HedgeAnalysis`**

- Analyzes a hedge configuration before execution
- Returns coverage, probabilities, and profit ranges

**`validateHedgeConfiguration(config: HedgeConfiguration): ValidationResult`**

- Validates configuration for errors
- Returns validation status and error messages

**`calculateOptimalStakes(overBarrier, underBarrier, totalBudget): Stakes`**

- Calculates optimal stake distribution based on probabilities
- Uses inverse probability weighting

**`getCoverageVisualization(config: HedgeConfiguration): CoverageData[]`**

- Returns digit-by-digit analysis for visualization
- Shows win/loss/partial status and profit for each digit

## Interfaces

### HedgeConfiguration

```typescript
interface HedgeConfiguration {
    overBarrier: number | null; // 0-9
    underBarrier: number | null; // 0-9
    overStake: number;
    underStake: number;
    symbol: string; // e.g., "1HZ100V"
    duration: number;
    durationUnit: 't' | 's' | 'm';
}
```

### HedgeAnalysis

```typescript
interface HedgeAnalysis {
    totalStake: number;
    coveredDigits: number[]; // Digits that result in profit
    gapDigits: number[]; // Digits that result in loss
    bestCaseProfit: number;
    worstCaseLoss: number;
    breakEvenDigits: number[];
    winProbability: number; // 0-1
}
```

## Integration Points

### Future Deriv API Integration

When ready to integrate with Deriv API:

1. **Get Proposals**

```typescript
// For OVER contract
ws.send(
    JSON.stringify({
        proposal: 1,
        contract_type: 'DIGITOVER',
        barrier: overBarrier,
        amount: overStake,
        basis: 'stake',
        currency: 'USD',
        duration: duration,
        duration_unit: durationUnit,
        underlying_symbol: symbol,
    })
);

// For UNDER contract
ws.send(
    JSON.stringify({
        proposal: 1,
        contract_type: 'DIGITUNDER',
        barrier: underBarrier,
        amount: underStake,
        basis: 'stake',
        currency: 'USD',
        duration: duration,
        duration_unit: durationUnit,
        underlying_symbol: symbol,
    })
);
```

2. **Buy Contracts**

```typescript
ws.send(
    JSON.stringify({
        buy: proposalId,
        price: askPrice,
    })
);
```

3. **Monitor Positions**

```typescript
ws.send(
    JSON.stringify({
        proposal_open_contract: 1,
        contract_id: contractId,
        subscribe: 1,
    })
);
```

## Risk Management

### Best Practices

1. **Stake Sizing**
    - Never risk more than 2-5% of balance per hedge
    - Use auto-optimize for balanced distribution

2. **Gap Management**
    - Wider gaps = higher risk, better payouts
    - Narrower gaps = lower risk, smaller profits
    - Aim for 70-85% win probability

3. **Duration Selection**
    - Shorter durations (5-10 ticks) = faster results
    - Longer durations = more time for analysis

4. **Symbol Selection**
    - Higher volatility indices (V75, V100) = more unpredictable
    - Lower volatility (V10, V25) = more stable patterns

## Styling

The component uses a dark gradient theme with:

- Purple/blue gradient accents (#667eea, #764ba2)
- Semi-transparent backgrounds
- Responsive grid layouts
- Color-coded coverage visualization:
    - Green: Win (profit)
    - Yellow: Partial (breakeven)
    - Red: Loss

## Future Enhancements

1. **Historical Analysis**
    - Track past hedge performance
    - Show success rates by strategy type

2. **Preset Strategies**
    - Save favorite configurations
    - Quick-load common strategies

3. **Live Monitoring**
    - Real-time contract status
    - Auto-close on profit targets

4. **Advanced Analytics**
    - Pattern recognition
    - Optimal barrier suggestions based on recent digits

5. **Multi-Symbol Hedging**
    - Hedge across different volatility indices
    - Correlation analysis

## Testing

To test the component:

1. Navigate to `/dashboard/hedge-strategy`
2. Select barriers and stakes
3. Review coverage visualization
4. Check analysis metrics
5. Click execute (currently shows alert, will integrate with API)

## Notes

- Component is standalone and not integrated with SignalsCenter
- Currently uses mock balance ($10,000)
- Ready for Deriv API integration
- All validation and analysis logic is complete
- UI is fully responsive and accessible

---

**Created**: 2025-03-07
**Status**: Complete - Ready for API Integration
**Route**: `/dashboard/hedge-strategy`
