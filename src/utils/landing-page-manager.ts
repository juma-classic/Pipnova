/**
 * Landing Page Manager
 * Handles showing the landing page only once per day
 */

const LANDING_PAGE_KEY = 'lastLandingPageVisit';

/**
 * Check if the landing page should be shown
 * Returns true if this is the first visit of the day
 */
export const shouldShowLandingPage = (): boolean => {
    try {
        const lastVisit = localStorage.getItem(LANDING_PAGE_KEY);

        if (!lastVisit) {
            // First time ever visiting
            return true;
        }

        const lastVisitDate = new Date(lastVisit);
        const today = new Date();

        // Check if it's a different day
        const isDifferentDay =
            lastVisitDate.getDate() !== today.getDate() ||
            lastVisitDate.getMonth() !== today.getMonth() ||
            lastVisitDate.getFullYear() !== today.getFullYear();

        return isDifferentDay;
    } catch (error) {
        console.warn('Error checking landing page visit:', error);
        return true; // Show landing page on error to be safe
    }
};

/**
 * Mark that the landing page has been visited today
 */
export const markLandingPageVisited = (): void => {
    try {
        const now = new Date().toISOString();
        localStorage.setItem(LANDING_PAGE_KEY, now);
        console.log('✅ Landing page visit recorded:', now);
    } catch (error) {
        console.warn('Error marking landing page visit:', error);
    }
};

/**
 * Reset the landing page visit (for testing)
 */
export const resetLandingPageVisit = (): void => {
    try {
        localStorage.removeItem(LANDING_PAGE_KEY);
        console.log('🔄 Landing page visit reset');
    } catch (error) {
        console.warn('Error resetting landing page visit:', error);
    }
};
