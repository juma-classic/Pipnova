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

    if (!isDesktop) return null;
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
