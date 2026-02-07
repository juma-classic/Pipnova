import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) return null;
    return (
        <a
            href='https://www.autotrades.site/'
            target='_blank'
            rel='noopener noreferrer'
            className='app-header__logo autotrades-logo'
        >
            <span className='autotrades-text'>AUTOTRADES</span>
        </a>
    );
};
