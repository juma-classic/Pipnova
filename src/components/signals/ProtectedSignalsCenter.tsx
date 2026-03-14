import React, { useState } from 'react';
import { AUTH_CONFIG } from '@/config/auth.config';
import { usePasswordProtection } from '@/hooks/usePasswordProtection';
import { hasPremiumAccess } from '@/utils/premium-access-check';
import SignalsCenter from './SignalsCenter';
import { SignalsPasswordModal } from './SignalsPasswordModal';

export const ProtectedSignalsCenter: React.FC = () => {
    const [isCheckingAccess, setIsCheckingAccess] = useState(false);
    const [accessError, setAccessError] = useState<string | null>(null);

    const { isAuthenticated, isLoading, authenticate } = usePasswordProtection({
        correctPassword: AUTH_CONFIG.SIGNALS_PASSWORD,
        storageKey: AUTH_CONFIG.SIGNALS_STORAGE_KEY,
        sessionTimeout: AUTH_CONFIG.SESSION_TIMEOUT,
    });

    // Custom authentication handler that checks both password and whitelist
    const handleAuthentication = async (password: string): Promise<boolean> => {
        setIsCheckingAccess(true);
        setAccessError(null);

        try {
            // Step 1: Check password
            if (password !== AUTH_CONFIG.SIGNALS_PASSWORD) {
                setAccessError('Invalid access code. Please contact admin for access.');
                setIsCheckingAccess(false);
                return false;
            }

            // Step 2: Check whitelist access for "signals"
            console.log('🔐 SIGNALS ACCESS: Checking whitelist for signals access...');
            const hasWhitelistAccess = await hasPremiumAccess('signals');
            
            if (!hasWhitelistAccess) {
                console.error('❌ SIGNALS ACCESS DENIED: User not whitelisted for signals access');
                setAccessError('Access denied. Your account is not whitelisted for signals access. Contact Elvis Trades for access.');
                setIsCheckingAccess(false);
                return false;
            }

            console.log('✅ SIGNALS ACCESS GRANTED: Password and whitelist verified');
            setIsCheckingAccess(false);
            
            // Call the original authenticate function
            const success = await authenticate(password);
            if (!success) {
                setAccessError('Authentication failed. Please try again.');
            }
            return success;
        } catch (error) {
            console.error('❌ Error checking signals access:', error);
            setAccessError('Error verifying access. Please try again.');
            setIsCheckingAccess(false);
            return false;
        }
    };

    // Show loading state
    if (isLoading || isCheckingAccess) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    color: '#14b8a6',
                    fontSize: '1.2rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                        style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid transparent',
                            borderTop: '2px solid currentColor',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }}
                    ></div>
                    {isCheckingAccess ? 'Verifying Access...' : 'Loading Signals Center...'}
                </div>
            </div>
        );
    }

    // Show password protection modal if not authenticated
    if (!isAuthenticated) {
        return (
            <SignalsPasswordModal
                onAuthenticate={handleAuthentication}
                errorMessage={accessError}
            />
        );
    }

    // Show the actual signals center if authenticated
    return <SignalsCenter />;
};
