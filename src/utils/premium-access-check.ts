/**
 * Check if a user has premium bot access
 * User must be whitelisted in the admin panel to access premium bots
 */
export const hasPremiumAccess = (): boolean => {
    try {
        // Get current user's account ID from localStorage
        const accountList = localStorage.getItem('accountsList');
        if (!accountList) {
            return false;
        }

        const accounts = JSON.parse(accountList);
        const activeLoginId = localStorage.getItem('active_loginid');
        
        if (!activeLoginId) {
            return false;
        }

        // Get the whitelisted premium accounts
        const premiumAccountsStr = localStorage.getItem('pipnova_premium_accounts');
        if (!premiumAccountsStr) {
            return false;
        }

        const premiumAccounts: string[] = JSON.parse(premiumAccountsStr);
        
        // Check if current user's account is in the whitelist
        return premiumAccounts.includes(activeLoginId);
    } catch (error) {
        console.error('Error checking premium access:', error);
        return false;
    }
};

/**
 * Get the current user's account ID
 */
export const getCurrentAccountId = (): string | null => {
    try {
        const activeLoginId = localStorage.getItem('active_loginid');
        return activeLoginId;
    } catch (error) {
        console.error('Error getting current account ID:', error);
        return null;
    }
};
