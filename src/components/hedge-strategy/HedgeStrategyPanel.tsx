import React, { useState, useEffect } from 'react';
import { multiContractHedgeService, HedgeConfiguration, HedgeAnalysis } from '@/services/multi-contract-hedge.service';
import './HedgeStrategyPanel.scss';

interface HedgeStrategyPanelProps {
    balance: number;
    symbol: string;
    onExecuteHedge?: (config: HedgeConfiguration) => void;
}

export const HedgeStrategyPanel: React.FC<HedgeStrategyPanelProps> = ({ balance, symbol, onExecuteHedge }) => {
    // Hedge configuration state
    const [overBarrier, setOverBarrier] = useState<number | null>(null);
    const [underBarrier, setUnderBarrier] = useState<number | null>(null);
    const [overStake, setOverStake] = useState<number>(10);
    const [underStake, setUnderStake] = useState<number>(10);
    const [duration, setDuration] = useState<number>(5);
    const [durationUnit, setDurationUnit] = useState<'t' | 's' | 'm'>('t');

    // Analysis state
    const [analysis, setAnalysis] = useState<HedgeAnalysis | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [autoOptimize, setAutoOptimize] = useState<boolean>(false);

    // Digits array for selection
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Update analysis when configuration changes
    useEffect(() => {
        const config: HedgeConfiguration = {
            overBarrier,
            underBarrier,
            overStake,
            underStake,
            symbol,
            duration,
            durationUnit,
        };

        // Validate configuration
        const validation = multiContractHedgeService.validateHedgeConfiguration(config);
        setErrors(validation.errors);

        // Analyze if valid
        if (validation.valid) {
            const hedgeAnalysis = multiContractHedgeService.analyzeHedgeConfiguration(config);
            setAnalysis(hedgeAnalysis);
        } else {
            setAnalysis(null);
        }
    }, [overBarrier, underBarrier, overStake, underStake, symbol, duration, durationUnit]);

    // Auto-optimize stakes
    useEffect(() => {
        if (autoOptimize && overBarrier !== null && underBarrier !== null) {
            const totalBudget = overStake + underStake;
            const optimal = multiContractHedgeService.calculateOptimalStakes(overBarrier, underBarrier, totalBudget);
            setOverStake(Number(optimal.overStake.toFixed(2)));
            setUnderStake(Number(optimal.underStake.toFixed(2)));
        }
    }, [autoOptimize, overBarrier, underBarrier]);

    const handleOverBarrierSelect = (digit: number) => {
        setOverBarrier(overBarrier === digit ? null : digit);
    };

    const handleUnderBarrierSelect = (digit: number) => {
        setUnderBarrier(underBarrier === digit ? null : digit);
    };

    const handleExecuteHedge = () => {
        if (errors.length === 0 && onExecuteHedge) {
            const config: HedgeConfiguration = {
                overBarrier,
                underBarrier,
                overStake,
                underStake,
                symbol,
                duration,
                durationUnit,
            };
            onExecuteHedge(config);
        }
    };

    const getCoverageVisualization = () => {
        if (!analysis) return [];
        const config: HedgeConfiguration = {
            overBarrier,
            underBarrier,
            overStake,
            underStake,
            symbol,
            duration,
            durationUnit,
        };
        return multiContractHedgeService.getCoverageVisualization(config);
    };

    const totalStake = overStake + underStake;
    const coverageData = getCoverageVisualization();

    return (
        <div className='hedge-strategy-panel'>
            <div className='hedge-header'>
                <h2>Multi-Contract Hedge Strategy</h2>
                <p className='hedge-subtitle'>Select OVER and UNDER barriers to create your hedge</p>
            </div>

            {/* Barrier Selection */}
            <div className='barrier-selection-section'>
                {/* OVER Barrier Selection */}
                <div className='barrier-group'>
                    <h3>OVER Barrier</h3>
                    <p className='barrier-description'>Win if digit is greater than selected barrier</p>
                    <div className='digit-selector'>
                        {digits.slice(0, 9).map(digit => (
                            <button
                                key={`over-${digit}`}
                                className={`digit-button ${overBarrier === digit ? 'selected' : ''} ${
                                    underBarrier !== null && digit >= underBarrier ? 'disabled' : ''
                                }`}
                                onClick={() => handleOverBarrierSelect(digit)}
                                disabled={underBarrier !== null && digit >= underBarrier}
                            >
                                {digit}
                            </button>
                        ))}
                    </div>
                    {overBarrier !== null && (
                        <div className='stake-input'>
                            <label>OVER Stake ($)</label>
                            <input
                                type='number'
                                min='1'
                                max={balance}
                                step='0.01'
                                value={overStake}
                                onChange={e => setOverStake(Number(e.target.value))}
                            />
                            <span className='coverage-info'>
                                Covers digits: {digits.filter(d => d > overBarrier).join(', ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* UNDER Barrier Selection */}
                <div className='barrier-group'>
                    <h3>UNDER Barrier</h3>
                    <p className='barrier-description'>Win if digit is less than selected barrier</p>
                    <div className='digit-selector'>
                        {digits.slice(1, 10).map(digit => (
                            <button
                                key={`under-${digit}`}
                                className={`digit-button ${underBarrier === digit ? 'selected' : ''} ${
                                    overBarrier !== null && digit <= overBarrier ? 'disabled' : ''
                                }`}
                                onClick={() => handleUnderBarrierSelect(digit)}
                                disabled={overBarrier !== null && digit <= overBarrier}
                            >
                                {digit}
                            </button>
                        ))}
                    </div>
                    {underBarrier !== null && (
                        <div className='stake-input'>
                            <label>UNDER Stake ($)</label>
                            <input
                                type='number'
                                min='1'
                                max={balance}
                                step='0.01'
                                value={underStake}
                                onChange={e => setUnderStake(Number(e.target.value))}
                            />
                            <span className='coverage-info'>
                                Covers digits: {digits.filter(d => d < underBarrier).join(', ')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Duration Settings */}
            <div className='duration-section'>
                <h3>Contract Duration</h3>
                <div className='duration-inputs'>
                    <input
                        type='number'
                        min='1'
                        max='100'
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                    />
                    <select value={durationUnit} onChange={e => setDurationUnit(e.target.value as 't' | 's' | 'm')}>
                        <option value='t'>Ticks</option>
                        <option value='s'>Seconds</option>
                        <option value='m'>Minutes</option>
                    </select>
                </div>
            </div>

            {/* Auto-Optimize Toggle */}
            <div className='auto-optimize-section'>
                <label className='checkbox-label'>
                    <input type='checkbox' checked={autoOptimize} onChange={e => setAutoOptimize(e.target.checked)} />
                    <span>Auto-optimize stake distribution</span>
                </label>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className='errors-section'>
                    {errors.map((error, idx) => (
                        <div key={idx} className='error-message'>
                            ⚠️ {error}
                        </div>
                    ))}
                </div>
            )}

            {/* Coverage Visualization */}
            {analysis && coverageData.length > 0 && (
                <div className='coverage-visualization'>
                    <h3>Coverage Analysis</h3>
                    <div className='digit-coverage-grid'>
                        {coverageData.map(({ digit, status, profit }) => (
                            <div key={digit} className={`coverage-cell coverage-cell--${status}`}>
                                <div className='coverage-digit'>{digit}</div>
                                <div className='coverage-status'>
                                    {status === 'win' ? '✓' : status === 'partial' ? '~' : '✗'}
                                </div>
                                <div className={`coverage-profit ${profit >= 0 ? 'positive' : 'negative'}`}>
                                    {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analysis Summary */}
            {analysis && (
                <div className='analysis-summary'>
                    <h3>Hedge Analysis</h3>
                    <div className='analysis-grid'>
                        <div className='analysis-item'>
                            <label>Total Stake</label>
                            <span className='value'>${totalStake.toFixed(2)}</span>
                        </div>
                        <div className='analysis-item'>
                            <label>Win Probability</label>
                            <span className='value'>{(analysis.winProbability * 100).toFixed(0)}%</span>
                        </div>
                        <div className='analysis-item'>
                            <label>Best Case Profit</label>
                            <span className='value positive'>+${analysis.bestCaseProfit.toFixed(2)}</span>
                        </div>
                        <div className='analysis-item'>
                            <label>Worst Case Loss</label>
                            <span className='value negative'>${analysis.worstCaseLoss.toFixed(2)}</span>
                        </div>
                        <div className='analysis-item'>
                            <label>Winning Digits</label>
                            <span className='value'>{analysis.coveredDigits.join(', ') || 'None'}</span>
                        </div>
                        <div className='analysis-item'>
                            <label>Gap Digits (Loss)</label>
                            <span className='value'>{analysis.gapDigits.join(', ') || 'None'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Execute Button */}
            <div className='execute-section'>
                <button
                    className='execute-hedge-btn'
                    onClick={handleExecuteHedge}
                    disabled={errors.length > 0 || !analysis}
                >
                    Execute Hedge Strategy
                </button>
                {analysis && (
                    <p className='execute-info'>
                        You will place {overBarrier !== null && underBarrier !== null ? '2' : '1'} contract(s) with a
                        total stake of ${totalStake.toFixed(2)}
                    </p>
                )}
            </div>
        </div>
    );
};
