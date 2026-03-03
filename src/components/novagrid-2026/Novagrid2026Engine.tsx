/**
 * Novagrid 2026 - High-Performance Weighted Signal Engine
 * For Deriv Digit Overs / Unders
 *
 * Architecture:
 * - Tick Stream Listener (WebSocket)
 * - Digit Distribution Analyzer
 * - Weighted Probability Engine
 * - Signal Decision Engine
 * - Confidence Scoring Module (70-98%)
 * - 60-second Signal Lifecycle
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { derivAPIService } from '@/services/deriv-api.service';
import { api_base } from '@/external/bot-skeleton';
import './Novagrid2026Engine.scss';

// Signal Types
interface TickData {
    quote: number;
    epoch: number;
    lastDigit: number;
}

interface DigitFrequency {
    digit: number;
    frequency: number;
    percentage: number;
    momentum: number; // 20-tick momentum
}

interface WeightedSignal {
    id: string;
    volatility: string;
    type: 'Overs' | 'Unders';
    firstDigit: number;
    secondDigit: number;
    confidence: number; // 70-98%
    weightScore: number;
    createdAt: number;
    expiresAt: number;
    timeToLive: number;
    status: 'active' | 'expired';
}

export const Novagrid2026Engine: React.FC = () => {
    // State
    const [isConnected, setIsConnected] = useState(false);
    const [tickBuffer, setTickBuffer] = useState<TickData[]>([]);
    const [activeSignals, setActiveSignals] = useState<WeightedSignal[]>([]);
    const [digitFrequencies, setDigitFrequencies] = useState<DigitFrequency[]>([]);
    const [selectedVolatility, setSelectedVolatility] = useState<string>('R_50');
    const [isEngineRunning, setIsEngineRunning] = useState(false);

    const unsubscribeRef = useRef<(() => void) | null>(null);
    const lastSignalTimeRef = useRef<number>(0);

    // Constants
    const TICK_WINDOW = 100;
    const MAX_ACTIVE_SIGNALS = 10;
    const MIN_SIGNAL_INTERVAL = 10000; // 10 seconds
    const SIGNAL_TTL = 60000; // 60 seconds

    /**
     * Extract last digit from price
     */
    const extractLastDigit = (price: number): number => {
        return Math.abs(Math.floor(price * 100)) % 10;
    };

    /**
     * Calculate digit frequency matrix
     */
    const calculateDigitFrequencies = useCallback((ticks: TickData[]): DigitFrequency[] => {
        if (ticks.length < 20) return [];

        const frequencies = Array(10).fill(0);
        const recentFrequencies = Array(10).fill(0);

        // Count all ticks
        ticks.forEach(tick => {
            frequencies[tick.lastDigit]++;
        });

        // Count last 20 ticks for momentum
        ticks.slice(-20).forEach(tick => {
            recentFrequencies[tick.lastDigit]++;
        });

        return Array.from({ length: 10 }, (_, digit) => ({
            digit,
            frequency: frequencies[digit],
            percentage: (frequencies[digit] / ticks.length) * 100,
            momentum: (recentFrequencies[digit] / 20) * 100,
        }));
    }, []);

    /**
     * Calculate digit weight using weighted formula
     * Weight = (0.4 × Current Frequency %) + (0.3 × 20-tick Momentum %) +
     *          (0.2 × Volatility Factor) + (0.1 × Reversal Risk)
     */
    const calculateDigitWeight = (freq: DigitFrequency, volatilityFactor: number): number => {
        const reversalRisk = freq.percentage > 15 ? -5 : 0; // Penalize overused digits
        return 0.4 * freq.percentage + 0.3 * freq.momentum + 0.2 * volatilityFactor + 0.1 * reversalRisk;
    };

    /**
     * Generate OVERS signal
     * Valid: 1st digit [1,2,3,4], 2nd digit [2,3,4,5,6], 1st ≤ 2nd
     */
    const generateOversSignal = (frequencies: DigitFrequency[], volatilityFactor: number): WeightedSignal | null => {
        if (frequencies.length < 10) return null;

        const validFirstDigits = [1, 2, 3, 4];
        const validSecondDigits = [2, 3, 4, 5, 6];

        let bestFirst = 0;
        let bestSecond = 0;
        let bestWeight = -Infinity;

        validFirstDigits.forEach(first => {
            validSecondDigits.forEach(second => {
                if (first <= second) {
                    const firstFreq = frequencies[first];
                    const secondFreq = frequencies[second];

                    if (!firstFreq || !secondFreq) return;

                    const firstWeight = calculateDigitWeight(firstFreq, volatilityFactor);
                    const secondWeight = calculateDigitWeight(secondFreq, volatilityFactor);
                    const pairWeight = firstWeight + secondWeight;

                    if (pairWeight > bestWeight) {
                        bestFirst = first;
                        bestSecond = second;
                        bestWeight = pairWeight;
                    }
                }
            });
        });

        if (bestWeight === -Infinity) return null;

        // Calculate confidence (70-98%)
        const normalizedWeight = Math.min(100, Math.max(0, bestWeight));
        const confidence = Math.min(98, Math.max(70, 70 + (normalizedWeight / 100) * 28));

        const now = Date.now();
        return {
            id: `novagrid-${now}`,
            volatility: selectedVolatility,
            type: 'Overs' as const,
            firstDigit: bestFirst,
            secondDigit: bestSecond,
            confidence: Math.round(confidence * 10) / 10,
            weightScore: Math.round(bestWeight * 10) / 10,
            createdAt: now,
            expiresAt: now + SIGNAL_TTL,
            timeToLive: 60,
            status: 'active' as const,
        };
    };

    /**
     * Generate UNDERS signal
     * Valid: 1st digit [8,7,6,5], 2nd digit [8,7,6,5,4], 1st ≥ 2nd
     */
    const generateUndersSignal = (frequencies: DigitFrequency[], volatilityFactor: number): WeightedSignal | null => {
        if (frequencies.length < 10) return null;

        const validFirstDigits = [8, 7, 6, 5];
        const validSecondDigits = [8, 7, 6, 5, 4];

        let bestFirst = 0;
        let bestSecond = 0;
        let bestWeight = -Infinity;

        validFirstDigits.forEach(first => {
            validSecondDigits.forEach(second => {
                if (first >= second) {
                    const firstFreq = frequencies[first];
                    const secondFreq = frequencies[second];

                    if (!firstFreq || !secondFreq) return;

                    const firstWeight = calculateDigitWeight(firstFreq, volatilityFactor);
                    const secondWeight = calculateDigitWeight(secondFreq, volatilityFactor);
                    const pairWeight = firstWeight + secondWeight;

                    if (pairWeight > bestWeight) {
                        bestFirst = first;
                        bestSecond = second;
                        bestWeight = pairWeight;
                    }
                }
            });
        });

        if (bestWeight === -Infinity) return null;

        // Calculate confidence (70-98%)
        const normalizedWeight = Math.min(100, Math.max(0, bestWeight));
        const confidence = Math.min(98, Math.max(70, 70 + (normalizedWeight / 100) * 28));

        const now = Date.now();
        return {
            id: `novagrid-${now}`,
            volatility: selectedVolatility,
            type: 'Unders' as const,
            firstDigit: bestFirst,
            secondDigit: bestSecond,
            confidence: Math.round(confidence * 10) / 10,
            weightScore: Math.round(bestWeight * 10) / 10,
            createdAt: now,
            expiresAt: now + SIGNAL_TTL,
            timeToLive: 60,
            status: 'active' as const,
        };
    };

    /**
     * Auto-generate signal based on market conditions
     */
    const generateAutoSignal = useCallback(() => {
        if (tickBuffer.length < TICK_WINDOW) return;
        if (activeSignals.length >= MAX_ACTIVE_SIGNALS) return;

        const now = Date.now();
        if (now - lastSignalTimeRef.current < MIN_SIGNAL_INTERVAL) return;

        const frequencies = calculateDigitFrequencies(tickBuffer);
        if (frequencies.length === 0) return;

        // Calculate volatility factor (simplified)
        const recentTicks = tickBuffer.slice(-20);
        const priceChanges = recentTicks.slice(1).map((tick, i) => Math.abs(tick.quote - recentTicks[i].quote));
        const avgChange = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length;
        const volatilityFactor = Math.min(100, avgChange * 10000);

        // Decide: Overs or Unders based on digit distribution
        const upperDigits = frequencies.slice(5).reduce((sum, f) => sum + f.percentage, 0);
        const lowerDigits = frequencies.slice(0, 5).reduce((sum, f) => sum + f.percentage, 0);

        let newSignal: WeightedSignal | null = null;

        if (upperDigits > lowerDigits) {
            // More upper digits → generate UNDERS (mean reversion)
            newSignal = generateUndersSignal(frequencies, volatilityFactor);
        } else {
            // More lower digits → generate OVERS (mean reversion)
            newSignal = generateOversSignal(frequencies, volatilityFactor);
        }

        if (newSignal && newSignal.confidence >= 70) {
            setActiveSignals(prev => [newSignal!, ...prev].slice(0, MAX_ACTIVE_SIGNALS));
            lastSignalTimeRef.current = now;
            console.log('🚀 Novagrid 2026 Signal Generated:', newSignal);
        }
    }, [tickBuffer, activeSignals, calculateDigitFrequencies, selectedVolatility]);

    /**
     * Connect to Deriv WebSocket
     */
    const startEngine = useCallback(async () => {
        try {
            setIsEngineRunning(true);
            console.log('🚀 Starting Novagrid 2026 Engine...');
            console.log('📡 Selected volatility:', selectedVolatility);

            // Check if API is available
            if (!api_base?.api) {
                throw new Error('Deriv API not initialized. Please ensure you are logged in.');
            }

            const subscriptionId = await derivAPIService.subscribeToTicks(selectedVolatility, tickData => {
                console.log('📊 Novagrid received tick:', tickData);

                if (tickData?.tick?.quote && tickData?.tick?.epoch) {
                    const lastDigit = extractLastDigit(tickData.tick.quote);

                    setTickBuffer(prev => {
                        const newBuffer = [
                            ...prev,
                            {
                                quote: tickData.tick.quote,
                                epoch: tickData.tick.epoch,
                                lastDigit,
                            },
                        ];
                        return newBuffer.slice(-TICK_WINDOW);
                    });
                }
            });

            if (!subscriptionId) {
                throw new Error('Failed to get subscription ID from Deriv API');
            }

            // Set connected immediately after successful subscription
            setIsConnected(true);

            // Store unsubscribe function
            unsubscribeRef.current = () => {
                if (subscriptionId) {
                    console.log('🔌 Unsubscribing from Novagrid ticks:', subscriptionId);
                    derivAPIService.unsubscribe(subscriptionId);
                }
            };

            console.log('✅ Novagrid 2026 Engine Started with subscription:', subscriptionId);
        } catch (error) {
            console.error('❌ Failed to start Novagrid engine:', error);
            setIsConnected(false);
            setIsEngineRunning(false);
            alert(`Failed to start Novagrid engine: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [selectedVolatility]);

    /**
     * Stop engine
     */
    const stopEngine = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
        setIsEngineRunning(false);
        setIsConnected(false);
        console.log('⏸️ Novagrid 2026 Engine Stopped');
    }, []);

    /**
     * Update digit frequencies
     */
    useEffect(() => {
        if (tickBuffer.length >= 20) {
            const frequencies = calculateDigitFrequencies(tickBuffer);
            setDigitFrequencies(frequencies);
        }
    }, [tickBuffer, calculateDigitFrequencies]);

    /**
     * Auto-generate signals
     */
    useEffect(() => {
        if (!isEngineRunning) return;

        const interval = setInterval(() => {
            generateAutoSignal();
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [isEngineRunning, generateAutoSignal]);

    /**
     * Expiry controller
     */
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setActiveSignals(
                prev =>
                    prev
                        .map(signal => {
                            if (signal.status === 'active' && now >= signal.expiresAt) {
                                return { ...signal, status: 'expired' as const, timeToLive: 0 };
                            }
                            if (signal.status === 'active') {
                                return {
                                    ...signal,
                                    timeToLive: Math.max(0, Math.floor((signal.expiresAt - now) / 1000)),
                                };
                            }
                            return signal;
                        })
                        .filter(signal => signal.status === 'active' || now - signal.expiresAt < 5000) // Keep expired for 5s
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    /**
     * Cleanup
     */
    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    return (
        <div className='novagrid-2026-engine'>
            <div className='novagrid-header'>
                <div className='novagrid-title'>
                    <h1>Novagrid Premium Signals</h1>
                    <p>Use these signals on your Novagrid Premium Bot</p>
                </div>
                <div className='novagrid-status'>
                    <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                    <span className='tick-count'>
                        Ticks: {tickBuffer.length}/{TICK_WINDOW}
                    </span>
                </div>
            </div>

            <div className='novagrid-controls'>
                <select
                    value={selectedVolatility}
                    onChange={e => setSelectedVolatility(e.target.value)}
                    disabled={isEngineRunning}
                >
                    <optgroup label='Standard Volatility (1s ticks)'>
                        <option value='R_10'>Volatility 10</option>
                        <option value='R_25'>Volatility 25</option>
                        <option value='R_50'>Volatility 50</option>
                        <option value='R_75'>Volatility 75</option>
                        <option value='R_100'>Volatility 100</option>
                    </optgroup>
                    <optgroup label='High-Frequency (100 ticks/s)'>
                        <option value='1HZ10V'>Volatility 10 (1s)</option>
                        <option value='1HZ25V'>Volatility 25 (1s)</option>
                        <option value='1HZ50V'>Volatility 50 (1s)</option>
                        <option value='1HZ75V'>Volatility 75 (1s)</option>
                        <option value='1HZ100V'>Volatility 100 (1s)</option>
                    </optgroup>
                </select>

                <button
                    onClick={isEngineRunning ? stopEngine : startEngine}
                    className={`engine-btn ${isEngineRunning ? 'stop' : 'start'}`}
                >
                    {isEngineRunning ? '⏸️ Stop Engine' : '▶️ Start Engine'}
                </button>
            </div>

            <div className='novagrid-content'>
                <div className='digit-matrix'>
                    <h3>Digit Distribution Matrix</h3>
                    <div className='matrix-grid'>
                        {digitFrequencies.map(freq => (
                            <div key={freq.digit} className='digit-cell'>
                                <div className='digit-number'>{freq.digit}</div>
                                <div className='digit-bar' style={{ width: `${freq.percentage}%` }}></div>
                                <div className='digit-stats'>
                                    <span>{freq.percentage.toFixed(1)}%</span>
                                    <span className='momentum'>↗ {freq.momentum.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='active-signals'>
                    <h3>
                        Active Signals ({activeSignals.length}/{MAX_ACTIVE_SIGNALS})
                    </h3>
                    {activeSignals.length === 0 && (
                        <div className='no-signals'>
                            <p>No active signals</p>
                            <p className='hint'>
                                {isEngineRunning ? 'Analyzing market...' : 'Start engine to generate signals'}
                            </p>
                        </div>
                    )}
                    <div className='signals-grid'>
                        {activeSignals.map(signal => (
                            <div
                                key={signal.id}
                                className={`signal-card ${signal.type.toLowerCase()} ${signal.status}`}
                            >
                                <div className='signal-header'>
                                    <span className='signal-type'>{signal.type}</span>
                                    <span className='signal-ttl'>{signal.timeToLive}s</span>
                                </div>
                                <div className='signal-digits'>
                                    <div className='digit-pair'>
                                        <span className='label'>1st:</span>
                                        <span className='value'>{signal.firstDigit}</span>
                                    </div>
                                    <div className='digit-pair'>
                                        <span className='label'>2nd:</span>
                                        <span className='value'>{signal.secondDigit}</span>
                                    </div>
                                </div>
                                <div className='signal-confidence'>
                                    <div className='confidence-bar'>
                                        <div
                                            className='confidence-fill'
                                            style={{ width: `${signal.confidence}%` }}
                                        ></div>
                                    </div>
                                    <span className='confidence-text'>{signal.confidence}%</span>
                                </div>
                                <div className='signal-meta'>
                                    <span>Weight: {signal.weightScore}</span>
                                    <span>{signal.volatility}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
