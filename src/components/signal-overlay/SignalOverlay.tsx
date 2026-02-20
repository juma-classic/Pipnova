import React, { useState, useEffect, useCallback, useRef } from 'react';
import { signalOverlayEngine } from './signal-overlay-engine';
import { SignalData, TradeOutcome } from './types';
import './SignalOverlay.scss';

export const SignalOverlay: React.FC = () => {
    const [availableSignals, setAvailableSignals] = useState<SignalData[]>([]);
    const [selectedSignal, setSelectedSignal] = useState<SignalData | null>(null);
    const [isEngineRunning, setIsEngineRunning] = useState(false);
    const [tradeOutcome, setTradeOutcome] = useState<TradeOutcome>('none');
    const [error, setError] = useState<string | null>(null);
    const engineInitialized = useRef(false);
    
    // Dragging state
    const [position, setPosition] = useState({ x: window.innerWidth - 270, y: 70 });
    const [isDragging, setIsDragging] = useState(false);
    const [isDragMode, setIsDragMode] = useState(false); // Double-tap mode for mobile
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const overlayRef = useRef<HTMLDivElement>(null);
    const lastTapTime = useRef<number>(0);
    const DOUBLE_TAP_DELAY = 300; // ms

    // Handle signal updates from engine
    const handleSignalUpdate = useCallback((signal: SignalData | null) => {
        if (signal) {
            setAvailableSignals(prev => {
                const now = Date.now();
                const active = prev.filter(s => s.expiresAt > now);
                const exists = active.find(s => s.id === signal.id);
                if (exists) {
                    return active.map(s => s.id === signal.id ? signal : s);
                }
                return [signal, ...active].slice(0, 5);
            });
        }
    }, []);

    // Handle trade outcome changes
    const handleOutcomeChange = useCallback((outcome: TradeOutcome) => {
        setTradeOutcome(outcome);
    }, []);

    // Start/Stop engine
    const toggleEngine = useCallback(async () => {
        if (!isEngineRunning) {
            try {
                setError(null);
                if (!engineInitialized.current) {
                    await signalOverlayEngine.initialize(
                        { prediction1: 0, prediction2: 0, takeProfit: 0, stopLoss: 0 },
                        handleSignalUpdate,
                        handleOutcomeChange
                    );
                    engineInitialized.current = true;
                }
                setIsEngineRunning(true);
            } catch (err: any) {
                console.error('❌ Failed to start engine:', err);
                setError(err?.message || 'Failed to start. Please log in first.');
            }
        } else {
            setIsEngineRunning(false);
        }
    }, [isEngineRunning, handleSignalUpdate, handleOutcomeChange]);

    // Select a signal
    const handleSelectSignal = useCallback((signal: SignalData) => {
        setSelectedSignal(signal);
    }, []);

    // Handle double-tap for mobile drag mode
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
            if (engineInitialized.current) {
                signalOverlayEngine.destroy();
                engineInitialized.current = false;
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
                    .filter(signal => signal.remainingSeconds > 0);
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
                <h3 className="signal-overlay__title">
                    Signal Panel
                    {isDragMode && <span className="signal-overlay__drag-indicator"> 🔓</span>}
                </h3>
                <div className="signal-overlay__status">
                    {isEngineRunning && (
                        <span className="signal-overlay__status-indicator signal-overlay__status-indicator--active">
                            ●
                        </span>
                    )}
                </div>
            </div>

            <div className="signal-overlay__content">
                <button
                    className={`signal-overlay__engine-btn ${isEngineRunning ? 'signal-overlay__engine-btn--active' : ''}`}
                    onClick={toggleEngine}
                >
                    {isEngineRunning ? '⏸️ Pause' : '▶️ Start'} Engine
                </button>

                {error && (
                    <div className="signal-overlay__error-box">
                        <span className="signal-overlay__error-icon">⚠️</span>
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
                                ✕
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
                                <span className="signal-overlay__selected-value">{selectedSignal.confidence}%</span>
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
                            className={`signal-overlay__signal-card ${selectedSignal?.id === signal.id ? 'signal-overlay__signal-card--selected' : ''}`}
                            onClick={() => handleSelectSignal(signal)}
                        >
                            <div className="signal-overlay__signal-header">
                                <span className={`signal-overlay__signal-type signal-overlay__signal-type--${signal.type.toLowerCase()}`}>
                                    {signal.type}
                                </span>
                                <span className="signal-overlay__signal-time">
                                    {formatRemainingTime(signal.remainingSeconds)}
                                </span>
                            </div>
                            <div className="signal-overlay__signal-details">
                                <div className="signal-overlay__signal-row">
                                    <span className="signal-overlay__signal-label">Market:</span>
                                    <span className="signal-overlay__signal-value">{signal.market}</span>
                                </div>
                                <div className="signal-overlay__signal-row">
                                    <span className="signal-overlay__signal-label">Confidence:</span>
                                    <span className="signal-overlay__signal-value">{signal.confidence}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
