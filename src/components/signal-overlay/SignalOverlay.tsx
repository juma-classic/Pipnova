import React, { useState, useEffect, useCallback, useRef } from 'react';
import { signalsCenterBridge, BridgedSignal } from '@/services/signals-center-bridge.service';
import { razielBotLoaderService, PatelSignalForBot } from '@/services/raziel-bot-loader.service';
import { useStore } from '@/hooks/useStore';
import './SignalOverlay.scss';

// Extended type with remaining seconds for UI
type SignalWithTimer = BridgedSignal & { remainingSeconds?: number };

export const SignalOverlay: React.FC = () => {
    const { dashboard } = useStore();
    const [availableSignals, setAvailableSignals] = useState<SignalWithTimer[]>([]);
    const [selectedSignal, setSelectedSignal] = useState<SignalWithTimer | null>(null);
    const [isEngineRunning] = useState(true); // Always "running" since we're just displaying signals
    const [error] = useState<string | null>(null);
    const [loadingSignalId, setLoadingSignalId] = useState<string | null>(null);
    const [loadedSignalIds, setLoadedSignalIds] = useState<Set<string>>(new Set()); // Track loaded signals
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for mobile
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Dragging state (desktop only)
    const [position, setPosition] = useState({ x: window.innerWidth - 270, y: 70 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const overlayRef = useRef<HTMLDivElement>(null);

    // Detect mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Subscribe to signals from SignalsCenter
    useEffect(() => {
        console.log('📡 SignalOverlay: Subscribing to SignalsCenter signals...');

        const unsubscribe = signalsCenterBridge.subscribe(signals => {
            console.log('📊 SignalOverlay: Received signals from SignalsCenter:', signals.length);
            // Add remaining seconds for countdown
            const signalsWithTimer = signals.map(s => ({
                ...s,
                remainingSeconds: Math.max(0, Math.floor((s.expiresAt - Date.now()) / 1000)),
            }));
            setAvailableSignals(signalsWithTimer.slice(0, 8)); // Up to 8 signals
        });

        unsubscribeRef.current = unsubscribe;
        console.log('✅ SignalOverlay: Subscribed to SignalsCenter');

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    // Load signal to NOVAGRID 2026 bot
    const handleLoadSignal = useCallback(
        async (signal: SignalWithTimer, e: React.MouseEvent) => {
            e.stopPropagation(); // Prevent card selection

            try {
                setLoadingSignalId(signal.id);
                console.log('🤖 Loading NOVAGRID 2026 bot with Patel signal:', signal);

                // Switch to Bot Builder tab IMMEDIATELY for instant feedback
                dashboard.setActiveTab(1);

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

                // Load bot in background (non-blocking)
                razielBotLoaderService
                    .loadNovagridBotWithPatelSignal(botSignal)
                    .then(() => {
                        console.log('✅ NOVAGRID 2026 bot loaded successfully with all parameters');
                        setLoadingSignalId(null);
                        // Mark signal as loaded
                        setLoadedSignalIds(prev => new Set(prev).add(signal.id));
                    })
                    .catch(error => {
                        console.error('❌ Failed to load bot:', error);
                        setError('Failed to load bot. Please try again.');
                        setLoadingSignalId(null);
                    });

                // KEEP MODAL OPEN on mobile for rapid bot loading
                // User can manually close when done
            } catch (error) {
                console.error('❌ Failed to load bot:', error);
                setError('Failed to load bot. Please try again.');
                setLoadingSignalId(null);
            }
        },
        [dashboard]
    );

    // Select a signal
    const handleSelectSignal = useCallback((signal: SignalWithTimer) => {
        setSelectedSignal(signal);
    }, []);

    // Detect window resize for mobile/desktop switch
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Drag handlers for desktop only
    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (isMobile) return; // Disable dragging on mobile
            if ((e.target as HTMLElement).closest('.signal-overlay__header')) {
                setIsDragging(true);
                setDragOffset({
                    x: e.clientX - position.x,
                    y: e.clientY - position.y,
                });
            }
        },
        [position, isMobile]
    );

    // Touch handlers removed - not needed for FAB approach

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging && !isMobile) {
                // Desktop only
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                const maxX = window.innerWidth - (overlayRef.current?.offsetWidth || 250);
                const maxY = window.innerHeight - (overlayRef.current?.offsetHeight || 100);
                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY)),
                });
            }
        },
        [isDragging, isMobile, dragOffset]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging && !isMobile) {
            // Desktop dragging only
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
    }, [isDragging, isMobile, handleMouseMove, handleMouseUp]);

    // Cleanup on unmount
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
                        remainingSeconds: Math.max(0, Math.floor((signal.expiresAt - now) / 1000)),
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

    // Render FAB for mobile
    if (isMobile) {
        return (
            <>
                {/* Floating Action Button */}
                <button
                    className={`signal-fab ${isEngineRunning ? 'signal-fab--active' : ''}`}
                    onClick={() => setIsModalOpen(true)}
                    title='Open Signal Panel'
                >
                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                            d='M12 2L2 7L12 12L22 7L12 2Z'
                            fill='currentColor'
                            opacity='0.6'
                            className='icon-layer-1'
                        />
                        <path
                            d='M2 17L12 22L22 17'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='icon-layer-2'
                        />
                        <path
                            d='M2 12L12 17L22 12'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='icon-layer-3'
                        />
                    </svg>
                    {availableSignals.length > 0 && (
                        <span className='signal-fab__badge'>{availableSignals.length}</span>
                    )}
                </button>

                {/* Full-Screen Modal */}
                {isModalOpen && (
                    <div className='signal-modal' onClick={() => setIsModalOpen(false)}>
                        <div className='signal-modal__content' onClick={e => e.stopPropagation()}>
                            <div className='signal-modal__header'>
                                <div className='signal-modal__title-wrapper'>
                                    <div className='signal-modal__title-icon'>
                                        <svg
                                            width='20'
                                            height='20'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                                d='M12 2L2 7L12 12L22 7L12 2Z'
                                                fill='currentColor'
                                                opacity='0.6'
                                                className='icon-layer-1'
                                            />
                                            <path
                                                d='M2 17L12 22L22 17'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                className='icon-layer-2'
                                            />
                                            <path
                                                d='M2 12L12 17L22 12'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                className='icon-layer-3'
                                            />
                                        </svg>
                                    </div>
                                    <h3 className='signal-modal__title'>Signal Panel</h3>
                                </div>
                                <button className='signal-modal__close' onClick={() => setIsModalOpen(false)}>
                                    <svg
                                        width='24'
                                        height='24'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M18 6L6 18M6 6l12 12'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className='signal-modal__body'>
                                {error && (
                                    <div className='signal-overlay__error-box'>
                                        <svg
                                            width='16'
                                            height='16'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='error-icon'
                                        >
                                            <circle
                                                cx='12'
                                                cy='12'
                                                r='10'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                className='error-circle'
                                            />
                                            <path
                                                d='M12 8v4M12 16h.01'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                className='error-mark'
                                            />
                                        </svg>
                                        <span className='signal-overlay__error-text'>{error}</span>
                                    </div>
                                )}

                                {selectedSignal && (
                                    <div className='signal-overlay__selected'>
                                        <div className='signal-overlay__selected-header'>
                                            <span className='signal-overlay__selected-label'>Selected:</span>
                                            <button
                                                className='signal-overlay__clear-btn'
                                                onClick={() => setSelectedSignal(null)}
                                            >
                                                <svg
                                                    width='14'
                                                    height='14'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                >
                                                    <path
                                                        d='M18 6L6 18M6 6l12 12'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className='signal-overlay__selected-info'>
                                            <div className='signal-overlay__selected-row'>
                                                <span className='signal-overlay__selected-key'>Market:</span>
                                                <span className='signal-overlay__selected-value'>
                                                    {selectedSignal.market}
                                                </span>
                                            </div>
                                            <div className='signal-overlay__selected-row'>
                                                <span className='signal-overlay__selected-key'>Signal:</span>
                                                <span
                                                    className={`signal-overlay__selected-value signal-overlay__selected-value--${selectedSignal.type.toLowerCase()}`}
                                                >
                                                    {selectedSignal.type}
                                                </span>
                                            </div>
                                            <div className='signal-overlay__selected-row'>
                                                <span className='signal-overlay__selected-key'>Confidence:</span>
                                                <span className='signal-overlay__selected-value'>
                                                    {selectedSignal.confidencePercentage}%
                                                </span>
                                            </div>
                                            <div className='signal-overlay__selected-row'>
                                                <span className='signal-overlay__selected-key'>Digit:</span>
                                                <span className='signal-overlay__selected-value'>
                                                    {selectedSignal.digit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className='signal-overlay__signals'>
                                    <div className='signal-overlay__signals-header'>
                                        <span>Available Signals ({availableSignals.length})</span>
                                    </div>

                                    {availableSignals.length === 0 && (
                                        <div className='signal-overlay__empty'>
                                            <p>No signals available</p>
                                            <p className='signal-overlay__empty-sub'>
                                                Signals from SignalsCenter will appear here
                                            </p>
                                        </div>
                                    )}

                                    {availableSignals.map(signal => (
                                        <div
                                            key={signal.id}
                                            className={`signal-overlay__signal-card ${selectedSignal?.id === signal.id ? 'signal-overlay__signal-card--selected' : ''} ${loadingSignalId === signal.id ? 'signal-overlay__signal-card--loading' : ''} ${loadedSignalIds.has(signal.id) ? 'signal-overlay__signal-card--loaded' : ''}`}
                                            onClick={() => handleSelectSignal(signal)}
                                        >
                                            <div className='signal-overlay__signal-header'>
                                                <span
                                                    className={`signal-overlay__signal-type signal-overlay__signal-type--${signal.type.toLowerCase()}`}
                                                >
                                                    {signal.type}
                                                </span>
                                                <span className='signal-overlay__signal-time'>
                                                    {formatRemainingTime(signal.remainingSeconds || 0)}
                                                </span>
                                            </div>
                                            <div className='signal-overlay__signal-details'>
                                                <div className='signal-overlay__signal-row'>
                                                    <span className='signal-overlay__signal-label'>Market:</span>
                                                    <span className='signal-overlay__signal-value'>
                                                        {signal.market}
                                                    </span>
                                                </div>
                                                <div className='signal-overlay__signal-row'>
                                                    <span className='signal-overlay__signal-label'>Confidence:</span>
                                                    <span className='signal-overlay__signal-value'>
                                                        {signal.confidencePercentage}%
                                                    </span>
                                                </div>
                                                <div className='signal-overlay__signal-row'>
                                                    <span className='signal-overlay__signal-label'>Digit:</span>
                                                    <span className='signal-overlay__signal-value'>{signal.digit}</span>
                                                </div>
                                            </div>
                                            <button
                                                className='signal-overlay__load-signal-btn'
                                                onClick={e => handleLoadSignal(signal, e)}
                                                disabled={loadingSignalId === signal.id}
                                            >
                                                <svg
                                                    width='14'
                                                    height='14'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    className='bot-icon'
                                                >
                                                    <rect
                                                        x='4'
                                                        y='4'
                                                        width='16'
                                                        height='16'
                                                        rx='2'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        className='bot-body'
                                                    />
                                                    <circle
                                                        cx='9'
                                                        cy='10'
                                                        r='1.5'
                                                        fill='currentColor'
                                                        className='bot-eye-1'
                                                    />
                                                    <circle
                                                        cx='15'
                                                        cy='10'
                                                        r='1.5'
                                                        fill='currentColor'
                                                        className='bot-eye-2'
                                                    />
                                                    <path
                                                        d='M8 15h8'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        className='bot-mouth'
                                                    />
                                                </svg>
                                                {loadingSignalId === signal.id
                                                    ? 'Loading...'
                                                    : loadedSignalIds.has(signal.id)
                                                      ? '✓ Loaded'
                                                      : 'Load Bot'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Render draggable panel for desktop
    return (
        <div
            ref={overlayRef}
            className={`signal-overlay ${isDragging ? 'signal-overlay--dragging' : ''}`}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={handleMouseDown}
        >
            <div className='signal-overlay__header'>
                <div className='signal-overlay__title-wrapper'>
                    <div className='signal-overlay__title-icon'>
                        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                                d='M12 2L2 7L12 12L22 7L12 2Z'
                                fill='currentColor'
                                opacity='0.6'
                                className='icon-layer-1'
                            />
                            <path
                                d='M2 17L12 22L22 17'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='icon-layer-2'
                            />
                            <path
                                d='M2 12L12 17L22 12'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='icon-layer-3'
                            />
                        </svg>
                    </div>
                    <h3 className='signal-overlay__title'>Signal Panel</h3>
                </div>
                <div className='signal-overlay__status'>
                    {isEngineRunning && (
                        <div className='signal-overlay__status-indicator signal-overlay__status-indicator--active'>
                            <svg
                                width='12'
                                height='12'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <circle cx='12' cy='12' r='10' fill='currentColor' className='pulse-circle' />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            <div className='signal-overlay__content'>
                {error && (
                    <div className='signal-overlay__error-box'>
                        <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                            className='error-icon'
                        >
                            <circle
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='2'
                                className='error-circle'
                            />
                            <path
                                d='M12 8v4M12 16h.01'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                className='error-mark'
                            />
                        </svg>
                        <span className='signal-overlay__error-text'>{error}</span>
                    </div>
                )}

                {selectedSignal && (
                    <div className='signal-overlay__selected'>
                        <div className='signal-overlay__selected-header'>
                            <span className='signal-overlay__selected-label'>Selected:</span>
                            <button className='signal-overlay__clear-btn' onClick={() => setSelectedSignal(null)}>
                                <svg
                                    width='14'
                                    height='14'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        d='M18 6L6 18M6 6l12 12'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className='signal-overlay__selected-info'>
                            <div className='signal-overlay__selected-row'>
                                <span className='signal-overlay__selected-key'>Market:</span>
                                <span className='signal-overlay__selected-value'>{selectedSignal.market}</span>
                            </div>
                            <div className='signal-overlay__selected-row'>
                                <span className='signal-overlay__selected-key'>Signal:</span>
                                <span
                                    className={`signal-overlay__selected-value signal-overlay__selected-value--${selectedSignal.type.toLowerCase()}`}
                                >
                                    {selectedSignal.type}
                                </span>
                            </div>
                            <div className='signal-overlay__selected-row'>
                                <span className='signal-overlay__selected-key'>Confidence:</span>
                                <span className='signal-overlay__selected-value'>
                                    {selectedSignal.confidencePercentage}%
                                </span>
                            </div>
                            <div className='signal-overlay__selected-row'>
                                <span className='signal-overlay__selected-key'>Digit:</span>
                                <span className='signal-overlay__selected-value'>{selectedSignal.digit}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className='signal-overlay__signals'>
                    <div className='signal-overlay__signals-header'>
                        <span>Available Signals ({availableSignals.length})</span>
                    </div>

                    {availableSignals.length === 0 && (
                        <div className='signal-overlay__empty'>
                            <p>No signals available</p>
                            <p className='signal-overlay__empty-sub'>Signals from SignalsCenter will appear here</p>
                        </div>
                    )}

                    {availableSignals.map(signal => (
                        <div
                            key={signal.id}
                            className={`signal-overlay__signal-card ${selectedSignal?.id === signal.id ? 'signal-overlay__signal-card--selected' : ''} ${loadingSignalId === signal.id ? 'signal-overlay__signal-card--loading' : ''} ${loadedSignalIds.has(signal.id) ? 'signal-overlay__signal-card--loaded' : ''}`}
                            onClick={() => handleSelectSignal(signal)}
                        >
                            <div className='signal-overlay__signal-header'>
                                <span
                                    className={`signal-overlay__signal-type signal-overlay__signal-type--${signal.type.toLowerCase()}`}
                                >
                                    {signal.type}
                                </span>
                                <span className='signal-overlay__signal-time'>
                                    {formatRemainingTime(signal.remainingSeconds || 0)}
                                </span>
                            </div>
                            <div className='signal-overlay__signal-details'>
                                <div className='signal-overlay__signal-row'>
                                    <span className='signal-overlay__signal-label'>Market:</span>
                                    <span className='signal-overlay__signal-value'>{signal.market}</span>
                                </div>
                                <div className='signal-overlay__signal-row'>
                                    <span className='signal-overlay__signal-label'>Confidence:</span>
                                    <span className='signal-overlay__signal-value'>{signal.confidencePercentage}%</span>
                                </div>
                                <div className='signal-overlay__signal-row'>
                                    <span className='signal-overlay__signal-label'>Digit:</span>
                                    <span className='signal-overlay__signal-value'>{signal.digit}</span>
                                </div>
                            </div>
                            <button
                                className='signal-overlay__load-signal-btn'
                                onClick={e => handleLoadSignal(signal, e)}
                                disabled={loadingSignalId === signal.id}
                            >
                                <svg
                                    width='14'
                                    height='14'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='bot-icon'
                                >
                                    <rect
                                        x='4'
                                        y='4'
                                        width='16'
                                        height='16'
                                        rx='2'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        className='bot-body'
                                    />
                                    <circle cx='9' cy='10' r='1.5' fill='currentColor' className='bot-eye-1' />
                                    <circle cx='15' cy='10' r='1.5' fill='currentColor' className='bot-eye-2' />
                                    <path
                                        d='M8 15h8'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        className='bot-mouth'
                                    />
                                </svg>
                                {loadingSignalId === signal.id
                                    ? 'Loading...'
                                    : loadedSignalIds.has(signal.id)
                                      ? '✓ Loaded'
                                      : 'Load Bot'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
