import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shouldShowLandingPage, markLandingPageVisited } from '@/utils/landing-page-manager';
import { LandingPage } from './LandingPage';

/**
 * Wrapper for the landing page that handles the "once per day" logic
 */
export const LandingPageWrapper: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we should show the landing page
        if (!shouldShowLandingPage()) {
            // Already visited today, redirect to dashboard
            console.log('🔄 Already visited today, redirecting to dashboard...');
            navigate('/dashboard', { replace: true });
        } else {
            // First visit of the day, mark it
            console.log('✨ First visit of the day, showing landing page');
            markLandingPageVisited();
        }
    }, [navigate]);

    // If we should show the landing page, render it
    // Otherwise, show nothing (will redirect)
    if (!shouldShowLandingPage()) {
        return null;
    }

    return <LandingPage />;
};
