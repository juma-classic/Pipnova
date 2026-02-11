/**
 * API Token Authentication Service
 * Handles authentication using Deriv API tokens
 */

import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';

interface AuthResult {
    success: boolean;
    loginid?: string;
    balance?: number;
    currency?: string;
    error?: string;
}

class ApiTokenAuthService {
    private static instance: ApiTokenAuthService;
    private authToken: string | null = null;
    private isAuthenticated = false;

    private constructor() {
        // Load token from localStorage if exists
        this.loadStoredToken();
    }

    public static getInstance(): ApiTokenAuthService {
        if (!ApiTokenAuthService.instance) {
            ApiTokenAuthService.instance = new ApiTokenAuthService();
        }
        return ApiTokenAuthService.instance;
    }

    /**
     * Authenticate with API token
     */
    public async authenticate(token: string): Promise<AuthResult> {
        try {
            console.log('🔐 Authenticating with API token...');

            // Get the Deriv API instance
            const api = generateDerivApiInstance();

            // Send authorize request
            const response = await api.send({ authorize: token });

            if (response.error) {
                console.error('❌ Authentication failed:', response.error);
                return {
                    success: false,
                    error: response.error.message || 'Authentication failed',
                };
            }

            // Store token and mark as authenticated
            this.authToken = token;
            this.isAuthenticated = true;
            this.storeToken(token);

            console.log('✅ Authentication successful:', response.authorize);

            return {
                success: true,
                loginid: response.authorize.loginid,
                balance: response.authorize.balance,
                currency: response.authorize.currency,
            };
        } catch (error) {
            console.error('❌ Authentication error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Authentication failed',
            };
        }
    }

    /**
     * Logout and clear stored token
     */
    public logout(): void {
        this.authToken = null;
        this.isAuthenticated = false;
        this.clearStoredToken();
        console.log('🔓 Logged out');
    }

    /**
     * Check if user is authenticated
     */
    public isAuth(): boolean {
        return this.isAuthenticated;
    }

    /**
     * Get stored token
     */
    public getToken(): string | null {
        return this.authToken;
    }

    /**
     * Store token in localStorage
     */
    private storeToken(token: string): void {
        try {
            localStorage.setItem('deriv_api_token', token);
        } catch (error) {
            console.error('Failed to store token:', error);
        }
    }

    /**
     * Load token from localStorage
     */
    private loadStoredToken(): void {
        try {
            const token = localStorage.getItem('deriv_api_token');
            if (token) {
                this.authToken = token;
                // Note: We don't set isAuthenticated here, it will be set after successful auth
                console.log('📦 Loaded stored token');
            }
        } catch (error) {
            console.error('Failed to load stored token:', error);
        }
    }

    /**
     * Clear stored token from localStorage
     */
    private clearStoredToken(): void {
        try {
            localStorage.removeItem('deriv_api_token');
        } catch (error) {
            console.error('Failed to clear stored token:', error);
        }
    }

    /**
     * Auto-authenticate with stored token on app load
     */
    public async autoAuthenticate(): Promise<boolean> {
        if (!this.authToken) {
            return false;
        }

        console.log('🔄 Auto-authenticating with stored token...');
        const result = await this.authenticate(this.authToken);
        return result.success;
    }
}

// Export singleton instance
export const apiTokenAuthService = ApiTokenAuthService.getInstance();
