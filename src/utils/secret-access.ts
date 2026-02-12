/**
 * Secret Access System
 * Provides hidden access to fake real mode via keyboard shortcuts
 * 
 * Secret Sequence: Press keys in order: P-I-P-N-O-V-A-6-7-7-6
 * Then click on the logo 3 times within 2 seconds
 */

class SecretAccessSystem {
    private static instance: SecretAccessSystem;
    private sequence: string[] = [];
    private readonly secretCode = ['p', 'i', 'p', 'n', 'o', 'v', 'a', '6', '7', '7', '6'];
    private readonly timeout = 3000; // 3 seconds to complete sequence
    private timer: NodeJS.Timeout | null = null;
    private logoClickCount = 0;
    private logoClickTimer: NodeJS.Timeout | null = null;
    private isSequenceComplete = false;

    private constructor() {
        this.initializeListeners();
    }

    public static getInstance(): SecretAccessSystem {
        if (!SecretAccessSystem.instance) {
            SecretAccessSystem.instance = new SecretAccessSystem();
        }
        return SecretAccessSystem.instance;
    }

    private initializeListeners(): void {
        // Listen for keyboard sequence
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input field
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const key = e.key.toLowerCase();
            
            // Reset timer on each keypress
            if (this.timer) {
                clearTimeout(this.timer);
            }

            // Add key to sequence
            this.sequence.push(key);

            // Keep only the last 11 keys (length of secret code)
            if (this.sequence.length > this.secretCode.length) {
                this.sequence.shift();
            }

            // Check if sequence matches
            if (this.checkSequence()) {
                this.isSequenceComplete = true;
                this.sequence = [];
                console.log('🔓 Secret sequence detected! Click the logo 3 times quickly...');
                
                // Show subtle visual feedback (very brief flash)
                document.body.style.transition = 'opacity 0.1s';
                document.body.style.opacity = '0.95';
                setTimeout(() => {
                    document.body.style.opacity = '1';
                }, 100);

                // Reset sequence complete after 5 seconds
                setTimeout(() => {
                    this.isSequenceComplete = false;
                }, 5000);
            }

            // Set timeout to reset sequence
            this.timer = setTimeout(() => {
                this.sequence = [];
            }, this.timeout);
        });
    }

    private checkSequence(): boolean {
        if (this.sequence.length !== this.secretCode.length) {
            return false;
        }

        return this.sequence.every((key, index) => key === this.secretCode[index]);
    }

    public handleLogoClick(): void {
        if (!this.isSequenceComplete) {
            return;
        }

        this.logoClickCount++;

        // Clear previous timer
        if (this.logoClickTimer) {
            clearTimeout(this.logoClickTimer);
        }

        // Check if 3 clicks within 2 seconds
        if (this.logoClickCount >= 3) {
            this.toggleFakeRealMode();
            this.logoClickCount = 0;
            this.isSequenceComplete = false;
        } else {
            // Reset click count after 2 seconds
            this.logoClickTimer = setTimeout(() => {
                this.logoClickCount = 0;
            }, 2000);
        }
    }

    private toggleFakeRealMode(): void {
        const isActive = localStorage.getItem('demo_icon_us_flag') === 'true';

        if (isActive) {
            localStorage.removeItem('demo_icon_us_flag');
            console.log('🔓 Fake Real Mode Deactivated via secret access');
            
            // Show subtle notification
            this.showNotification('Demo Mode Restored', '#10b981');
        } else {
            localStorage.setItem('demo_icon_us_flag', 'true');
            console.log('🎭 Fake Real Mode Activated via secret access');
            
            // Show subtle notification
            this.showNotification('Real Mode Activated', '#fbbf24');
        }

        // Reload page after short delay
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    private showNotification(message: string, color: string): void {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 2000);
    }

    /**
     * Check if fake real mode is currently active
     */
    public isFakeRealModeActive(): boolean {
        return localStorage.getItem('demo_icon_us_flag') === 'true';
    }
}

// Export singleton instance
export const secretAccessSystem = SecretAccessSystem.getInstance();
