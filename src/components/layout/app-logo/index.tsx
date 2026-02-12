import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import { secretAccessSystem } from '@/utils/secret-access';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    const handleLogoClick = (e: React.MouseEvent) => {
        // Don't prevent default navigation, but also handle secret access
        secretAccessSystem.handleLogoClick();
    };

    const handleLogoTap = (e: React.TouchEvent) => {
        // Handle mobile tap for secret access
        e.preventDefault(); // Prevent navigation on mobile for secret access
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

    return (
        <a
            href='https://www.pipnova.site/'
            target='_blank'
            rel='noopener noreferrer'
            className='app-header__logo pipnova-logo'
            onClick={handleLogoClick}
        >
            <span className='pipnova-text'>PIPNOVA</span>
        </a>
    );
};
