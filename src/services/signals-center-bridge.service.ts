/**
 * Signals Center Bridge Service
 * Bridges signals from SignalsCenter to SignalOverlay
 */

export interface BridgedSignal {
    id: string;
    timestamp: number;
    market: string;
    type: 'OVER' | 'UNDER';
    digit: number;
    barrier: number;
    confidencePercentage: number;
    recommendedStake: number;
    recommendedRuns: number;
    expiresAt: number;
}

class SignalsCenterBridgeService {
    private static instance: SignalsCenterBridgeService;
    private listeners: Set<(signals: BridgedSignal[]) => void> = new Set();
    private currentSignals: BridgedSignal[] = [];

    private constructor() {}

    static getInstance(): SignalsCenterBridgeService {
        if (!SignalsCenterBridgeService.instance) {
            SignalsCenterBridgeService.instance = new SignalsCenterBridgeService();
        }
        return SignalsCenterBridgeService.instance;
    }

    /**
     * Update signals from SignalsCenter
     */
    updateSignals(signals: BridgedSignal[]): void {
        this.currentSignals = signals;
        this.notifyListeners();
    }

    /**
     * Subscribe to signal updates
     */
    subscribe(listener: (signals: BridgedSignal[]) => void): () => void {
        this.listeners.add(listener);
        // Send current signals immediately
        listener(this.currentSignals);

        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Notify all listeners
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            listener(this.currentSignals);
        });
    }

    /**
     * Get current signals
     */
    getCurrentSignals(): BridgedSignal[] {
        return this.currentSignals;
    }
}

export const signalsCenterBridge = SignalsCenterBridgeService.getInstance();
