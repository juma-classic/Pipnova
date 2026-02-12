/**
 * Check if a user has premium bot access
 * User must be whitelisted in the premium-whitelist.json file
 */
export const hasPremiumAccess = async (): Promise<boolean> => {
    try {
        // Get current user's account ID
        const activeLoginId = localStorage.getItem('active_loginid');
        
        if (!activeLoginId) {
            console.log('No active login ID found');
            return false;
        }

        // Fetch the whitelist from JSON file
        const response = await fetch('/premium-whitelist.json');
        if (!response.ok) {
            console.error('Failed to fetch premium whitelist');
            return false;
        }

        const data = await response.json();
        const premiumAccounts: string[] = data.premiumAccounts || [];
        
        // Check if current user's account is in the whitelist
        const hasAccess = premiumAccounts.includes(activeLoginId);
        console.log(`Premium access check for ${activeLoginId}:`, hasAccess ? '✅ GRANTED' : '❌ DENIED');
        console.log('Whitelist:', premiumAccounts);
        
        return hasAccess;
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

/**
 * Fetch the current premium whitelist from JSON file
 */
export const getPremiumWhitelist = async (): Promise<string[]> => {
    try {
        const response = await fetch('/premium-whitelist.json');
        if (!response.ok) {
            console.error('Failed to fetch premium whitelist');
            return [];
        }

        const data = await response.json();
        return data.premiumAccounts || [];
    } catch (error) {
        console.error('Error fetching premium whitelist:', error);
        return [];
    }
};
