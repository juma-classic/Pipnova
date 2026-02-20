import React, { useState, useEffect, useCallback, useRef } from 'react';
import PatelSignalGenerator from '@/services/patel-signal-generator.service';
import RealtimeOverSignalGenerator from '@/services/realtime-over-signal-generator.service';
import type { PatelSignal } from '@/types/patel-signals';
import { razielBotLoaderService, PatelSignalForBot } from '@/services/raziel-bot-loader.service';
import { useStore } from '@/hooks/useStore';
import './SignalOverlay.scss';

// Extended type with remaining seconds for UI
type PatelSignalWithTimer = PatelSignal & { remainingSeconds?: number };

export const SignalOverlay: React.FC = () => {
    const { dashboard } = useStore();
    const [availableSignals, setAvailableSignals] = useState<PatelSignalWithTimer[]>([]);
    const [selectedSignal, setSelectedSignal] = useState<PatelSignalWithTimer | null>(null);
    const [isEngineRunning, setIsEngineRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingSignalId, setLoadingSignalId] = useState<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);
    
    // Dragging state
    const [position, setPosition] = useState({ x: window.innerWidth - 270, y: 70 });
    const [isDragging, setIsDragging] = useState(false);
    const [isDragMode, setIsDragMode] = useState(false); // Double-tap mode for mobile
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const overlayRef = useRef<HTMLDivElement>(null);
    const lastTapTime = useRef<number>(0);
    const DOUBLE_TAP_DELAY = 300; // ms

    // Start/Stop engine
    const toggleEngine = useCallback(async () => {
        if (!isEngineRunning) {
            try {
                setError(null);
                console.log('🚀 Starting Real-Time OVER Signal Generator (Deriv API)...');
                
                // Subscribe to real-time signals
                const unsubscribe = RealtimeOverSignalGenerator.subscribe((signals) => {
                    console.log('📊 Received real-time OVER signals:', signals.length);
                    // Ensure 2-minute validity
                    const validSignals = signals.map(s => ({
                        ...s,
                        validityDuration: 120, // Force 2 minutes (120 seconds)
                        expiresAt: s.timestamp + 120000, // 2 minutes from creation
                    }));
                    console.log('✅ OVER signals (2min validity):', validSignals.length);
                    setAvailableSignals(validSignals.slice(0, 5)); // Keep max 5 OVER signals
                });
                
                // Start the real-time engine
                await RealtimeOverSignalGenerator.start();
                
                unsubscribeRef.current = unsubscribe;
                setIsEngineRunning(true);
                console.log('✅ Real-Time OVER Signal Generator started - Live Deriv API, 2-minute validity');
            } catch (err: any) {
                console.error('❌ Failed to start engine:', err);
                setError(err?.message || 'Failed to start. Please try again.');
            }
        } else {
            // Stop engine
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            await RealtimeOverSignalGenerator.stop();
            setIsEngineRunning(false);
            setAvailableSignals([]);
            console.log('⏸️ Real-Time OVER Signal Generator stopped');
        }
    }, [isEngineRunning]);

    // Load signal to NOVAGRID 2026 bot
    const handleLoadSignal = useCallback(async (signal: PatelSignalWithTimer, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card selection
        
        try {
            setLoadingSignalId(signal.id);
            console.log('🤖 Loading NOVAGRID 2026 bot with Patel signal:', signal);
            
            // Convert Patel signal to bot-compatible format
            const botSignal: PatelSignalForBot = {
                market: signal.market,
                type: signal.type as 'OVER' | 'UNDER',
                digit: signal.digit,
                barrier: signal.barrier,
                confidencePercentage: signal.confidencePercentage,
                recommendedStake: signal.recommendedStake,
                recommendedRuns: signal.recommendedRuns,
            };
            
            // Use raziel bot loader service for comprehensive injection
            await razielBotLoaderService.loadNovagridBotWithPatelSignal(botSignal);
            
            // Switch to Bot Builder tab
            dashboard.setActiveTab(1);
            
            console.log('✅ NOVAGRID 2026 bot loaded successfully with all parameters');
            setLoadingSignalId(null);
        } catch (error) {
            console.error('❌ Failed to load bot:', error);
            setError('Failed to load bot. Please try again.');
            setLoadingSignalId(null);
        }
    }, [dashboard]);

    // Select a signal
    const handleSelectSignal = useCallback((signal: PatelSignalWithTimer) => {
        setSelectedSignal(signal);
    }, []);
    const handleDoubleTap = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        const currentTime = Date.now();
        const tapGap = currentTime - lastTapTime.current;
        
        if (tapGap < DOUBLE_TAP_DELAY && tapGap > 0) {
            // Double tap detected
            e.preventDefault();
            setIsDragMode(prev => !prev);
            console.log('🔄 Drag mode:', !isDragMode ? 'ENABLED' : 'DISABLED');
        }
        
        lastTapTime.current = currentTime;
    }, [isDragMode, DOUBLE_TAP_DELAY]);

    // Drag handlers for desktop
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.signal-overlay__header')) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    }, [position]);

    // Touch handlers for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragMode) return; // Only allow dragging in drag mode
        
        if ((e.target as HTMLElement).closest('.signal-overlay__header')) {
            const touch = e.touches[0];
            setIsDragging(true);
            setDragOffset({
                x: touch.clientX - position.x,
                y: touch.clientY - position.y,
            });
            e.preventDefault(); // Prevent scrolling
        }
    }, [position, isDragMode]);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (isDragging && isDragMode) {
            e.preventDefault(); // Prevent page scrolling
            const touch = e.touches[0];
            const newX = touch.clientX - dragOffset.x;
            const newY = touch.clientY - dragOffset.y;
            
            const maxX = window.innerWidth - (overlayRef.current?.offsetWidth || 250);
            const maxY = window.innerHeight - (overlayRef.current?.offsetHeight || 100);
            
            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            });
        }
    }, [isDragging, isDragMode, dragOffset]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging && !isDragMode) { // Desktop only (not in mobile drag mode)
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            const maxX = window.innerWidth - (overlayRef.current?.offsetWidth || 250);
            const maxY = window.innerHeight - (overlayRef.current?.offsetHeight || 100);
            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            });
        }
    }, [isDragging, isDragMode, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging && !isDragMode) { // Desktop dragging
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };
        }
    }, [isDragging, isDragMode, handleMouseMove, handleMouseUp]);

    // Prevent page scrolling when in drag mode
    useEffect(() => {
        if (isDragMode) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            return () => {
                document.body.style.overflow = '';
                document.body.style.touchAction = '';
            };
        }
    }, [isDragMode]);

    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setAvailableSignals(prev => {
                const now = Date.now();
                return prev
                    .map(signal => ({
                        ...signal,
                        remainingSeconds: Math.max(0, Math.floor((signal.expiresAt - now) / 1000))
                    }))
                    .filter(signal => {
                        const remaining = Math.floor((signal.expiresAt - now) / 1000);
                        return remaining > 0; // Only remove when countdown reaches 0
                    });
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatRemainingTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div 
            ref={overlayRef}
            className={`signal-overlay ${isDragging ? 'signal-overlay--dragging' : ''} ${isDragMode ? 'signal-overlay--drag-mode' : ''}`}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div 
                className="signal-overlay__header"
                onTouchEnd={handleDoubleTap}
            >
                <div className="signal-overlay__title-wrapper">
                    <div className="signal-overlay__title-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.6" className="icon-layer-1" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-layer-2" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-layer-3" />
                        </svg>
                    </div>
                    <h3 className="signal-overlay__title">
                        Signal Panel
                    </h3>
                    {isDragMode && (
                        <div className="signal-overlay__drag-indicator">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="unlock-circle" />
                                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="unlock-hand" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="signal-overlay__status">
                    {isEngineRunning && (
                        <div className="signal-overlay__status-indicator signal-overlay__status-indicator--active">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="currentColor" className="pulse-circle" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            <div className="signal-overlay__content">
                <button
                    className={`signal-overlay__engine-btn ${isEngineRunning ? 'signal-overlay__engine-btn--active' : ''}`}
                    onClick={toggleEngine}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="engine-icon">
                        {isEngineRunning ? (
                            <>
                                <rect x="6" y="4" width="4" height="16" fill="currentColor" className="pause-bar-1" />
                                <rect x="14" y="4" width="4" height="16" fill="currentColor" className="pause-bar-2" />
                            </>
                        ) : (
                            <path d="M8 5v14l11-7z" fill="currentColor" className="play-triangle" />
                        )}
                    </svg>
                    {isEngineRunning ? 'Pause' : 'Start'} Engine
                </button>

                {error && (
                    <div className="signal-overlay__error-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="error-icon">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="error-circle" />
                            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="error-mark" />
                        </svg>
                        <span className="signal-overlay__error-text">{error}</span>
                    </div>
                )}

                {selectedSignal && (
                    <div className="signal-overlay__selected">
                        <div className="signal-overlay__selected-header">
                            <span className="signal-overlay__selected-label">Selected:</span>
                            <button 
                                className="signal-overlay__clear-btn"
                                onClick={() => setSelectedSignal(null)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <div className="signal-overlay__selected-info">
                            <div className="signal-overlay__selected-row">
                                <span className="signal-overlay__selected-key">Market:</span>
                                <span className="signal-overlay__selected-value">{selectedSignal.market}</span>
                            </div>
                            <div className="signal-overlay__selected-row">
                                <span className="signal-overlay__selected-key">Signal:</span>
                                <span className={`signal-overlay__selected-value signal-overlay__selected-value--${selectedSignal.type.toLowerCase()}`}>
                                    {selectedSignal.type}
                                </span>
                            </div>
                            <div className="signal-overlay__selected-row">
                                <span className="signal-overlay__selected-key">Confidence:</span>
                                <span className="signal-overlay__selected-value">{selectedSignal.confidencePercentage}%</span>
                            </div>
                            <div className="signal-overlay__selected-row">
                                <span className="signal-overlay__selected-key">Digit:</span>
                                <span className="signal-overlay__selected-value">{selectedSignal.digit}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="signal-overlay__signals">
                    <div className="signal-overlay__signals-header">
                        <span>Available Signals ({availableSignals.length})</span>
                    </div>
                    
                    {availableSignals.length === 0 && isEngineRunning && (
                        <div className="signal-overlay__empty">
                            <p>Analyzing market...</p>
                            <p className="signal-overlay__empty-sub">Waiting for signals</p>
                        </div>
                    )}

                    {availableSignals.length === 0 && !isEngineRunning && (
                        <div className="signal-overlay__empty">
                            <p>Engine stopped</p>
                            <p className="signal-overlay__empty-sub">Start to see signals</p>
                        </div>
                    )}

                    {availableSignals.map(signal => (
                        <div
                            key={signal.id}
                            className={`signal-overlay__signal-card ${selectedSignal?.id === signal.id ? 'signal-overlay__signal-card--selected' : ''} ${loadingSignalId === signal.id ? 'signal-overlay__signal-card--loading' : ''}`}
                            onClick={() => handleSelectSignal(signal)}
                        >
                            <div className="signal-overlay__signal-header">
                                <span className={`signal-overlay__signal-type signal-overlay__signal-type--${signal.type.toLowerCase()}`}>
                                    {signal.type}
                                </span>
                                <span className="signal-overlay__signal-time">
                                    {formatRemainingTime(signal.remainingSeconds || 0)}
                                </span>
                            </div>
                            <div className="signal-overlay__signal-details">
                                <div className="signal-overlay__signal-row">
                                    <span className="signal-overlay__signal-label">Market:</span>
                                    <span className="signal-overlay__signal-value">{signal.market}</span>
                                </div>
                                <div className="signal-overlay__signal-row">
                                    <span className="signal-overlay__signal-label">Confidence:</span>
                                    <span className="signal-overlay__signal-value">{signal.confidencePercentage}%</span>
                                </div>
                                <div className="signal-overlay__signal-row">
                                    <span className="signal-overlay__signal-label">Digit:</span>
                                    <span className="signal-overlay__signal-value">{signal.digit}</span>
                                </div>
                            </div>
                            <button
                                className="signal-overlay__load-signal-btn"
                                onClick={(e) => handleLoadSignal(signal, e)}
                                disabled={loadingSignalId === signal.id}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bot-icon">
                                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" className="bot-body" />
                                    <circle cx="9" cy="10" r="1.5" fill="currentColor" className="bot-eye-1" />
                                    <circle cx="15" cy="10" r="1.5" fill="currentColor" className="bot-eye-2" />
                                    <path d="M8 15h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="bot-mouth" />
                                </svg>
                                {loadingSignalId === signal.id ? 'Loading...' : 'Load Bot'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
