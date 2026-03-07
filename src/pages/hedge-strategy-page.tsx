import React, { useState } from 'react';
import { HedgeStrategyPanel } from '@/components/hedge-strategy/HedgeStrategyPanel';
import { HedgeConfiguration } from '@/services/multi-contract-hedge.service';
import './hedge-strategy-page.scss';

export const HedgeStrategyPage: React.FC = () => {
    const [balance] = useState<number>(10000); // Mock balance
    const [symbol] = useState<string>('1HZ100V'); // Volatility 100 Index

    const handleExecuteHedge = (config: HedgeConfiguration) => {
        console.log('Executing hedge strategy:', config);

        // TODO: Integrate with Deriv API
        // 1. Get proposals for each contract
        // 2. Buy contracts
        // 3. Monitor positions

        alert(
            `Hedge strategy configured!\n\nOVER Barrier: ${config.overBarrier ?? 'None'}\nUNDER Barrier: ${config.underBarrier ?? 'None'}\nTotal Stake: $${(config.overStake + config.underStake).toFixed(2)}`
        );
    };

    return (
        <div className='hedge-strategy-page'>
            <div className='page-header'>
                <h1>Multi-Contract Hedge Strategy</h1>
                <div className='account-info'>
                    <div className='info-item'>
                        <span className='label'>Balance:</span>
                        <span className='value'>${balance.toFixed(2)}</span>
                    </div>
                    <div className='info-item'>
                        <span className='label'>Symbol:</span>
                        <span className='value'>{symbol}</span>
                    </div>
                </div>
            </div>

            <HedgeStrategyPanel balance={balance} symbol={symbol} onExecuteHedge={handleExecuteHedge} />

            <div className='strategy-guide'>
                <h3>How Multi-Contract Hedging Works</h3>
                <div className='guide-content'>
                    <div className='guide-section'>
                        <h4>🎯 What is Hedging?</h4>
                        <p>
                            Hedging involves placing multiple contracts to reduce risk. By selecting both OVER and UNDER
                            barriers, you create a "safety net" that covers multiple digit outcomes.
                        </p>
                    </div>

                    <div className='guide-section'>
                        <h4>📊 Example Strategy</h4>
                        <p>
                            <strong>OVER 3</strong> ($10 stake) + <strong>UNDER 7</strong> ($10 stake)
                        </p>
                        <ul>
                            <li>✅ Win if digit is 0, 1, 2, 4, 5, 6, 8, 9 (80% coverage)</li>
                            <li>❌ Lose if digit is 3 or 7 (20% gap)</li>
                            <li>💰 Best case: Both win (digit outside 3-7 range)</li>
                        </ul>
                    </div>

                    <div className='guide-section'>
                        <h4>💡 Tips for Success</h4>
                        <ul>
                            <li>Keep a gap between OVER and UNDER barriers (e.g., OVER 3, UNDER 7)</li>
                            <li>Use auto-optimize to balance stakes based on probabilities</li>
                            <li>Check the coverage visualization to see winning digits</li>
                            <li>Start with small stakes to test your strategy</li>
                        </ul>
                    </div>

                    <div className='guide-section'>
                        <h4>⚠️ Risk Management</h4>
                        <ul>
                            <li>Never risk more than 2-5% of your balance per hedge</li>
                            <li>Wider gaps = higher risk but better payouts</li>
                            <li>Narrower gaps = lower risk but smaller profits</li>
                            <li>Monitor your win probability before executing</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HedgeStrategyPage;
