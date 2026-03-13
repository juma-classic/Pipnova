import React, { useEffect, useState } from 'react';
import './NovaprimeLoader.scss';

interface NovaprimeLoaderProps {
    onLoadComplete?: () => void;
    duration?: number;
}

export const NovaprimeLoader: React.FC<NovaprimeLoaderProps> = ({ onLoadComplete, duration = 6000 }) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [chartBars, setChartBars] = useState<number[]>([]);
    const [candlestickData, setCandlestickData] = useState<Array<{open: number, high: number, low: number, close: number}>>([]);
    const [volumeData, setVolumeData] = useState<number[]>([]);
    const [movingAverages, setMovingAverages] = useState<{ma20: number[], ma50: number[], ma200: number[]}>({ma20: [], ma50: [], ma200: []});
    const [rsiData, setRsiData] = useState<number[]>([]);
    const [macdData, setMacdData] = useState<{macd: number[], signal: number[], histogram: number[]}>({macd: [], signal: [], histogram: []});

    // Generate sophisticated chart data
    useEffect(() => {
        const generateAdvancedChartData = () => {
            const dataPoints = 50;
            let basePrice = 1.2500;
            const candlesticks = [];
            const volumes = [];
            const prices = [];

            // Generate realistic candlestick data
            for (let i = 0; i < dataPoints; i++) {
                const volatility = 0.002;
                const trend = Math.sin(i * 0.1) * 0.001;
                const noise = (Math.random() - 0.5) * volatility;
                
                const open = basePrice;
                const close = basePrice + trend + noise;
                const high = Math.max(open, close) + Math.random() * volatility;
                const low = Math.min(open, close) - Math.random() * volatility;
                
                candlesticks.push({ open, high, low, close });
                volumes.push(Math.random() * 1000 + 200);
                prices.push(close);
                basePrice = close;
            }

            // Calculate moving averages
            const calculateMA = (data: number[], period: number) => {
                const ma = [];
                for (let i = period - 1; i < data.length; i++) {
                    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                    ma.push(sum / period);
                }
                return ma;
            };

            // Calculate RSI
            const calculateRSI = (data: number[], period: number = 14) => {
                const rsi = [];
                for (let i = period; i < data.length; i++) {
                    let gains = 0, losses = 0;
                    for (let j = i - period + 1; j <= i; j++) {
                        const change = data[j] - data[j - 1];
                        if (change > 0) gains += change;
                        else losses -= change;
                    }
                    const avgGain = gains / period;
                    const avgLoss = losses / period;
                    const rs = avgGain / avgLoss;
                    rsi.push(100 - (100 / (1 + rs)));
                }
                return rsi;
            };

            // Calculate MACD
            const calculateMACD = (data: number[]) => {
                const ema12 = calculateMA(data, 12);
                const ema26 = calculateMA(data, 26);
                const macd = ema12.slice(-ema26.length).map((val, i) => val - ema26[i]);
                const signal = calculateMA(macd, 9);
                const histogram = macd.slice(-signal.length).map((val, i) => val - signal[i]);
                return { macd, signal, histogram };
            };

            setCandlestickData(candlesticks);
            setVolumeData(volumes);
            setMovingAverages({
                ma20: calculateMA(prices, 20),
                ma50: calculateMA(prices, 50),
                ma200: calculateMA(prices, 200)
            });
            setRsiData(calculateRSI(prices));
            setMacdData(calculateMACD(prices));

            // Legacy bar chart for compatibility
            const bars = Array.from({ length: 20 }, () => Math.random() * 60 + 20);
            setChartBars(bars);
        };

        generateAdvancedChartData();
        
        // Update data periodically for animation
        const dataInterval = setInterval(generateAdvancedChartData, 500);
        return () => clearInterval(dataInterval);
    }, []);

    // Progress Updates
    useEffect(() => {
        const progressInterval = 30;
        const progressIncrement = 100 / (duration / progressInterval);

        const progressTimer = setInterval(() => {
            setProgress(prev => {
                const next = prev + progressIncrement;
                return next >= 100 ? 100 : next;
            });
        }, progressInterval);

        const completeTimer = setTimeout(() => {
            setIsComplete(true);
            setTimeout(() => {
                if (onLoadComplete) {
                    onLoadComplete();
                }
            }, 800);
        }, duration);

        return () => {
            clearInterval(progressTimer);
            clearTimeout(completeTimer);
        };
    }, [duration, onLoadComplete]);

    return (
        <div className={`novaprime-loader ${isComplete ? 'fade-out' : ''}`}>
            {/* Mechanical Background Elements */}
            <div className="mechanical-bg">
                <div className="gear gear-1"></div>
                <div className="gear gear-2"></div>
                <div className="gear gear-3"></div>
                <div className="gear gear-4"></div>
                <div className="piston piston-1"></div>
                <div className="piston piston-2"></div>
                <div className="circuit-lines">
                    <div className="circuit-line line-1"></div>
                    <div className="circuit-line line-2"></div>
                    <div className="circuit-line line-3"></div>
                    <div className="circuit-line line-4"></div>
                </div>
            </div>

            {/* Background circles */}
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>

            <div className="loader-content">
                {/* Logo */}
                <div className="logo-section">
                    <div className="logo-icon">
                        <div className="icon-p">P</div>
                        <div className="logo-gears">
                            <div className="mini-gear gear-a"></div>
                            <div className="mini-gear gear-b"></div>
                        </div>
                    </div>
                    <h1 className="logo-text">NOVAPRIME</h1>
                    <div className="logo-subtitle">Advanced Trading Engine</div>
                </div>

                {/* Advanced Trading Interface */}
                <div className="advanced-trading-interface">
                    {/* Main Chart Panel */}
                    <div className="chart-panel">
                        <div className="chart-header">
                            <div className="chart-title">EUR/USD • M15</div>
                            <div className="chart-controls">
                                <div className="timeframe-selector">
                                    <span className="tf-btn active">M15</span>
                                    <span className="tf-btn">H1</span>
                                    <span className="tf-btn">H4</span>
                                    <span className="tf-btn">D1</span>
                                </div>
                                <div className="chart-indicators">
                                    <span className="indicator active" title="Connected"></span>
                                    <span className="indicator warning" title="Processing"></span>
                                    <span className="indicator" title="Standby"></span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Candlestick Chart */}
                        <div className="candlestick-chart">
                            <div className="price-axis">
                                {[1.2520, 1.2510, 1.2500, 1.2490, 1.2480].map((price, i) => (
                                    <div key={i} className="price-level" style={{top: `${i * 20}%`}}>
                                        {price.toFixed(4)}
                                    </div>
                                ))}
                            </div>
                            <div className="chart-grid">
                                {Array.from({length: 10}).map((_, i) => (
                                    <div key={i} className="grid-line horizontal" style={{top: `${i * 10}%`}}></div>
                                ))}
                                {Array.from({length: 8}).map((_, i) => (
                                    <div key={i} className="grid-line vertical" style={{left: `${i * 12.5}%`}}></div>
                                ))}
                            </div>
                            <div className="candlesticks">
                                {candlestickData.slice(-20).map((candle, index) => {
                                    const isGreen = candle.close > candle.open;
                                    const bodyHeight = Math.abs(candle.close - candle.open) * 10000;
                                    const wickTop = (candle.high - Math.max(candle.open, candle.close)) * 10000;
                                    const wickBottom = (Math.min(candle.open, candle.close) - candle.low) * 10000;
                                    
                                    return (
                                        <div key={index} className="candlestick" style={{left: `${index * 4.5}%`}}>
                                            <div className="wick" style={{
                                                height: `${wickTop + bodyHeight + wickBottom}px`,
                                                backgroundColor: isGreen ? '#00ff88' : '#ff4444'
                                            }}></div>
                                            <div className={`body ${isGreen ? 'green' : 'red'}`} style={{
                                                height: `${Math.max(bodyHeight, 2)}px`,
                                                top: `${wickTop}px`
                                            }}></div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Moving Averages */}
                            <svg className="ma-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polyline 
                                    className="ma-20" 
                                    points={movingAverages.ma20.slice(-10).map((val, i) => `${i * 10},${(1.252 - val) * 50000}`).join(' ')}
                                />
                                <polyline 
                                    className="ma-50" 
                                    points={movingAverages.ma50.slice(-10).map((val, i) => `${i * 10},${(1.252 - val) * 50000}`).join(' ')}
                                />
                            </svg>
                        </div>

                        {/* Volume Chart */}
                        <div className="volume-chart">
                            {volumeData.slice(-20).map((volume, index) => (
                                <div key={index} className="volume-bar" style={{
                                    height: `${(volume / 1200) * 100}%`,
                                    left: `${index * 4.5}%`
                                }}></div>
                            ))}
                        </div>
                    </div>

                    {/* Technical Indicators Panel */}
                    <div className="indicators-panel">
                        {/* RSI */}
                        <div className="indicator-widget">
                            <div className="indicator-header">RSI (14)</div>
                            <div className="rsi-chart">
                                <div className="rsi-levels">
                                    <div className="level overbought">70</div>
                                    <div className="level oversold">30</div>
                                </div>
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polyline 
                                        className="rsi-line" 
                                        points={rsiData.slice(-10).map((val, i) => `${i * 11},${100 - val}`).join(' ')}
                                    />
                                </svg>
                                <div className="rsi-value">{rsiData[rsiData.length - 1]?.toFixed(1) || '0.0'}</div>
                            </div>
                        </div>

                        {/* MACD */}
                        <div className="indicator-widget">
                            <div className="indicator-header">MACD</div>
                            <div className="macd-chart">
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <polyline 
                                        className="macd-line" 
                                        points={macdData.macd.slice(-10).map((val, i) => `${i * 11},${50 - val * 10000}`).join(' ')}
                                    />
                                    <polyline 
                                        className="signal-line" 
                                        points={macdData.signal.slice(-10).map((val, i) => `${i * 11},${50 - val * 10000}`).join(' ')}
                                    />
                                </svg>
                                <div className="histogram">
                                    {macdData.histogram.slice(-10).map((val, i) => (
                                        <div key={i} className={`hist-bar ${val > 0 ? 'positive' : 'negative'}`} 
                                             style={{height: `${Math.abs(val) * 100000}%`}}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Market Depth */}
                        <div className="indicator-widget">
                            <div className="indicator-header">Market Depth</div>
                            <div className="depth-chart">
                                <div className="order-book">
                                    <div className="asks">
                                        {[1.2505, 1.2504, 1.2503, 1.2502, 1.2501].map((price, i) => (
                                            <div key={i} className="order-level ask">
                                                <span className="price">{price.toFixed(4)}</span>
                                                <span className="volume">{(Math.random() * 100).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="spread">Spread: 0.8</div>
                                    <div className="bids">
                                        {[1.2500, 1.2499, 1.2498, 1.2497, 1.2496].map((price, i) => (
                                            <div key={i} className="order-level bid">
                                                <span className="price">{price.toFixed(4)}</span>
                                                <span className="volume">{(Math.random() * 100).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Action Panel */}
                    <div className="advanced-actions">
                        <div className="action-group">
                            <div className="action-btn primary">
                                <div className="btn-icon">⚡</div>
                                <div className="btn-label">EXECUTE</div>
                                <div className="btn-sublabel">Lightning Fast</div>
                            </div>
                            <div className="action-btn secondary">
                                <div className="btn-icon">🎯</div>
                                <div className="btn-label">ANALYZE</div>
                                <div className="btn-sublabel">AI Powered</div>
                            </div>
                        </div>
                        <div className="action-group">
                            <div className="action-btn tertiary">
                                <div className="btn-icon">🤖</div>
                                <div className="btn-label">AUTO TRADE</div>
                                <div className="btn-sublabel">Bot Engine</div>
                            </div>
                            <div className="action-btn quaternary">
                                <div className="btn-icon">📊</div>
                                <div className="btn-label">SIGNALS</div>
                                <div className="btn-sublabel">Live Feed</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Loading Progress */}
                <div className="loading-section">
                    <div className="system-status">
                        <div className="status-item">
                            <div className="status-icon active"></div>
                            <span>Market Data Feed</span>
                        </div>
                        <div className="status-item">
                            <div className="status-icon active"></div>
                            <span>Trading Engine</span>
                        </div>
                        <div className="status-item">
                            <div className="status-icon processing"></div>
                            <span>AI Analysis Core</span>
                        </div>
                        <div className="status-item">
                            <div className="status-icon"></div>
                            <span>Risk Management</span>
                        </div>
                    </div>
                    
                    <div className="progress-container">
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}>
                                <div className="progress-glow"></div>
                            </div>
                            <div className="progress-segments">
                                {Array.from({length: 20}).map((_, i) => (
                                    <div key={i} className={`segment ${i < (progress / 5) ? 'active' : ''}`}></div>
                                ))}
                            </div>
                        </div>
                        <div className="loading-text">
                            <span className="main-text">Initializing NOVAPRIME Trading Engine</span>
                            <span className="progress-text">{Math.round(progress)}% Complete</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NovaprimeLoader;
