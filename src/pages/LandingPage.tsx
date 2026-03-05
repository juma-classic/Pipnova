import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.scss';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className='landing-page'>
            {/* Header */}
            <header className='landing-header'>
                <div className='landing-header__container'>
                    <div className='landing-header__logo'>
                        <span className='logo-text'>NOVAPRIME</span>
                    </div>
                    <nav className='landing-header__nav'>
                        <a href='#features'>Features</a>
                        <a href='#markets'>Markets</a>
                        <a href='#pricing'>Pricing</a>
                        <button className='btn-login' onClick={() => navigate('/login')}>
                            Log in
                        </button>
                        <button className='btn-signup' onClick={() => navigate('/signup')}>
                            Sign up
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className='landing-hero'>
                <div className='landing-hero__container'>
                    <div className='landing-hero__content'>
                        <p className='landing-hero__subtitle'>FROM ASPIRING TRADER TO INFORMED DECISION MAKER</p>
                        <h1 className='landing-hero__title'>
                            ELEVATE YOUR
                            <br />
                            <span className='landing-hero__title--highlight'>TRADING JOURNEY</span>
                            <br />
                            TODAY
                        </h1>
                        <p className='landing-hero__description'>
                            Whether you're starting out or already experienced, the right tools can help you trade
                            smarter. Trading always carries risk. Our AI-powered tools are designed to help traders of
                            all levels make informed choices.
                        </p>
                        <button className='landing-hero__cta' onClick={() => navigate('/dashboard')}>
                            START TRADING NOW
                        </button>
                        <p className='landing-hero__disclaimer'>*Grow your trading today and start your journey.</p>

                        {/* Stats */}
                        <div className='landing-hero__stats'>
                            <div className='stat-item'>
                                <div className='stat-number'>24+</div>
                                <div className='stat-label'>Countries</div>
                                <div className='stat-sublabel'>Used in many markets</div>
                            </div>
                            <div className='stat-item'>
                                <div className='stat-number'>10K+</div>
                                <div className='stat-label'>Active Traders</div>
                            </div>
                            <div className='stat-item'>
                                <div className='stat-number'>24/7</div>
                                <div className='stat-label'>Market Access</div>
                            </div>
                        </div>

                        {/* Supported Markets */}
                        <div className='landing-hero__markets'>
                            <p className='markets-title'>Supported Markets</p>
                            <div className='markets-list'>
                                <span className='market-badge'>Forex</span>
                                <span className='market-badge'>Commodities</span>
                                <span className='market-badge'>Indices</span>
                                <span className='market-badge'>Crypto</span>
                            </div>
                        </div>
                    </div>

                    <div className='landing-hero__image'>
                        <div className='platform-preview-image'>
                            <img
                                src='/landingpic.png'
                                alt='Novaprime Trading Platform Preview'
                                className='platform-screenshot'
                            />
                        </div>
                        <p className='landing-hero__image-caption'>
                            *Trading involves risk and past results do not guarantee future performance.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className='landing-footer'>
                <div className='landing-footer__container'>
                    <p>2025-03-05 09:25:15 GMT</p>
                    <div className='footer-links'>
                        <a href='#terms'>Terms</a>
                        <a href='#privacy'>Privacy</a>
                        <a href='#support'>Support</a>
                    </div>
                    <div className='footer-language'>
                        <span>🌐 EN</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
