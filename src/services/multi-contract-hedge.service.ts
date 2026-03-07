/**
 * Multi-Contract Hedge Service
 * Handles hedging strategies for digit trading with manual barrier selection
 */

export interface HedgeContract {
    contractType: 'DIGITOVER' | 'DIGITUNDER';
    barrier: number; // 0-9
    stake: number;
    expectedPayout?: number;
    probability?: number;
    proposalId?: string;
    askPrice?: number;
}

export interface HedgeConfiguration {
    overBarrier: number | null; // 0-9
    underBarrier: number | null; // 0-9
    overStake: number;
    underStake: number;
    symbol: string;
    duration: number;
    durationUnit: 't' | 's' | 'm';
}

export interface ExecutedContract {
    contractId: number;
    contractType: 'DIGITOVER' | 'DIGITUNDER';
    barrier: number;
    stake: number;
    payout: number;
    buyPrice: number;
    purchaseTime: number;
}

export interface ExecutedHedge {
    hedgeId: string;
    contracts: ExecutedContract[];
    totalStake: number;
    timestamp: number;
    symbol: string;
    status: 'active' | 'completed' | 'cancelled';
}

export interface HedgeAnalysis {
    totalStake: number;
    coveredDigits: number[]; // Which digits result in profit
    gapDigits: number[]; // Which digits result in loss
    bestCaseProfit: number;
    worstCaseLoss: number;
    breakEvenDigits: number[];
    winProbability: number;
}

class MultiContractHedgeService {
    private activeHedges: Map<string, ExecutedHedge> = new Map();

    /**
     * Analyze hedge configuration before execution
     */
    analyzeHedgeConfiguration(config: HedgeConfiguration): HedgeAnalysis {
        const { overBarrier, underBarrier, overStake, underStake } = config;
        const totalStake = overStake + underStake;

        // Determine which digits are covered
        const coveredDigits: number[] = [];
        const gapDigits: number[] = [];

        for (let digit = 0; digit <= 9; digit++) {
            let wins = 0;
            let totalPayout = 0;

            // Check OVER contract
            if (overBarrier !== null && digit > overBarrier) {
                wins++;
                totalPayout += overStake * 1.9; // Approximate payout multiplier
            }

            // Check UNDER contract
            if (underBarrier !== null && digit < underBarrier) {
                wins++;
                totalPayout += underStake * 1.9;
            }

            if (totalPayout > totalStake) {
                coveredDigits.push(digit);
            } else if (wins === 0) {
                gapDigits.push(digit);
            }
        }

        // Calculate probabilities
        const winProbability = coveredDigits.length / 10;

        // Best case: both contracts win
        const bestCaseProfit = overStake * 1.9 + underStake * 1.9 - totalStake;

        // Worst case: both contracts lose
        const worstCaseLoss = -totalStake;

        // Break even: one contract wins with payout equal to total stake
        const breakEvenDigits: number[] = [];
        for (let digit = 0; digit <= 9; digit++) {
            let totalPayout = 0;
            if (overBarrier !== null && digit > overBarrier) {
                totalPayout += overStake * 1.9;
            }
            if (underBarrier !== null && digit < underBarrier) {
                totalPayout += underStake * 1.9;
            }
            if (Math.abs(totalPayout - totalStake) < 0.5) {
                breakEvenDigits.push(digit);
            }
        }

        return {
            totalStake,
            coveredDigits,
            gapDigits,
            bestCaseProfit,
            worstCaseLoss,
            breakEvenDigits,
            winProbability,
        };
    }

    /**
     * Validate hedge configuration
     */
    validateHedgeConfiguration(config: HedgeConfiguration): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Check if at least one barrier is set
        if (config.overBarrier === null && config.underBarrier === null) {
            errors.push('At least one barrier (OVER or UNDER) must be set');
        }

        // Validate barrier ranges
        if (config.overBarrier !== null && (config.overBarrier < 0 || config.overBarrier > 8)) {
            errors.push('OVER barrier must be between 0 and 8');
        }

        if (config.underBarrier !== null && (config.underBarrier < 1 || config.underBarrier > 9)) {
            errors.push('UNDER barrier must be between 1 and 9');
        }

        // Check for logical conflicts
        if (config.overBarrier !== null && config.underBarrier !== null && config.overBarrier >= config.underBarrier) {
            errors.push('OVER barrier must be less than UNDER barrier to create a valid hedge');
        }

        // Validate stakes
        if (config.overBarrier !== null && config.overStake <= 0) {
            errors.push('OVER stake must be greater than 0');
        }

        if (config.underBarrier !== null && config.underStake <= 0) {
            errors.push('UNDER stake must be greater than 0');
        }

        // Validate duration
        if (config.duration <= 0) {
            errors.push('Duration must be greater than 0');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Calculate optimal stake distribution
     */
    calculateOptimalStakes(
        overBarrier: number | null,
        underBarrier: number | null,
        totalBudget: number
    ): { overStake: number; underStake: number } {
        if (overBarrier === null && underBarrier !== null) {
            return { overStake: 0, underStake: totalBudget };
        }

        if (underBarrier === null && overBarrier !== null) {
            return { overStake: totalBudget, underStake: 0 };
        }

        if (overBarrier !== null && underBarrier !== null) {
            // Calculate probabilities
            const overProbability = (9 - overBarrier) / 10;
            const underProbability = underBarrier / 10;

            // Distribute stakes proportionally to inverse probability (Kelly Criterion inspired)
            const overWeight = 1 / overProbability;
            const underWeight = 1 / underProbability;
            const totalWeight = overWeight + underWeight;

            return {
                overStake: (totalBudget * overWeight) / totalWeight,
                underStake: (totalBudget * underWeight) / totalWeight,
            };
        }

        return { overStake: 0, underStake: 0 };
    }

    /**
     * Generate hedge ID
     */
    private generateHedgeId(): string {
        return `hedge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create hedge contracts from configuration
     */
    createHedgeContracts(config: HedgeConfiguration): HedgeContract[] {
        const contracts: HedgeContract[] = [];

        if (config.overBarrier !== null && config.overStake > 0) {
            contracts.push({
                contractType: 'DIGITOVER',
                barrier: config.overBarrier,
                stake: config.overStake,
                probability: (9 - config.overBarrier) / 10,
            });
        }

        if (config.underBarrier !== null && config.underStake > 0) {
            contracts.push({
                contractType: 'DIGITUNDER',
                barrier: config.underBarrier,
                stake: config.underStake,
                probability: config.underBarrier / 10,
            });
        }

        return contracts;
    }

    /**
     * Get active hedges
     */
    getActiveHedges(): ExecutedHedge[] {
        return Array.from(this.activeHedges.values()).filter(hedge => hedge.status === 'active');
    }

    /**
     * Get hedge by ID
     */
    getHedgeById(hedgeId: string): ExecutedHedge | undefined {
        return this.activeHedges.get(hedgeId);
    }

    /**
     * Update hedge status
     */
    updateHedgeStatus(hedgeId: string, status: 'active' | 'completed' | 'cancelled'): void {
        const hedge = this.activeHedges.get(hedgeId);
        if (hedge) {
            hedge.status = status;
            this.activeHedges.set(hedgeId, hedge);
        }
    }

    /**
     * Calculate coverage visualization data
     */
    getCoverageVisualization(config: HedgeConfiguration): {
        digit: number;
        status: 'win' | 'loss' | 'partial';
        profit: number;
    }[] {
        const visualization: { digit: number; status: 'win' | 'loss' | 'partial'; profit: number }[] = [];

        for (let digit = 0; digit <= 9; digit++) {
            let totalPayout = 0;
            let wins = 0;

            if (config.overBarrier !== null && digit > config.overBarrier) {
                totalPayout += config.overStake * 1.9;
                wins++;
            }

            if (config.underBarrier !== null && digit < config.underBarrier) {
                totalPayout += config.underStake * 1.9;
                wins++;
            }

            const totalStake = config.overStake + config.underStake;
            const profit = totalPayout - totalStake;

            let status: 'win' | 'loss' | 'partial';
            if (profit > 0) {
                status = 'win';
            } else if (wins > 0) {
                status = 'partial';
            } else {
                status = 'loss';
            }

            visualization.push({ digit, status, profit });
        }

        return visualization;
    }
}

export const multiContractHedgeService = new MultiContractHedgeService();
