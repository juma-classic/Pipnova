import React, { useState } from 'react';
import './RiskDisclaimer.scss';

export const RiskDisclaimer: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            {/* Fixed Risk Disclaimer Button */}
            <button className='global-risk-disclaimer-btn' onClick={() => setShowModal(true)} title='Risk Disclaimer'>
                ⚠️ Risk Disclaimer
            </button>

            {/* Risk Disclaimer Modal */}
            {showModal && (
                <div className='modal-overlay' onClick={() => setShowModal(false)}>
                    <div className='modal-content risk-disclaimer-modal' onClick={e => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h2>⚠️ Risk Disclaimer</h2>
                            <button className='modal-close' onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className='modal-body'>
                            <p className='disclaimer-text'>
                                Deriv offers complex derivatives, such as options and contracts for difference ("CFDs").
                                These products may not be suitable for all clients, and trading them puts you at risk.
                            </p>
                            <p className='disclaimer-text'>
                                Please make sure that you understand the following risks before trading Deriv products:
                            </p>
                            <ul className='disclaimer-list'>
                                <li>
                                    <strong>a)</strong> You may lose some or all of the money you invest in the trade
                                </li>
                                <li>
                                    <strong>b)</strong> If your trade involves currency conversion, exchange rates will
                                    affect your profit and loss
                                </li>
                            </ul>
                            <p className='disclaimer-warning'>
                                <strong>
                                    You should never trade with borrowed money or with money that you cannot afford to
                                    lose.
                                </strong>
                            </p>
                        </div>
                        <div className='modal-footer'>
                            <button className='btn-acknowledge' onClick={() => setShowModal(false)}>
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RiskDisclaimer;
