import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import { secretAccessSystem } from '@/utils/secret-access';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    const handleLogoClick = (e: React.MouseEvent) => {
        // Handle secret access on desktop
        secretAccessSystem.handleLogoClick();
    };

    const handleLogoTap = (e: React.TouchEvent) => {
        // Handle mobile tap for secret access
        e.preventDefault();
        secretAccessSystem.handleLogoTap();
    };

    if (!isDesktop) {
        // Mobile version with tap handler
        return (
            <div
                className='app-header__logo pipnova-logo'
                onTouchEnd={handleLogoTap}
                style={{ cursor: 'pointer' }}
            >
                <span className='pipnova-text'>PIPNOVA</span>
            </div>
        );
    }

    // Desktop version - no link, just div with click handler
    return (
        <div
            className='app-header__logo pipnova-logo'
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
        >
            <span className='pipnova-text'>PIPNOVA</span>
        </div>
    );
};
