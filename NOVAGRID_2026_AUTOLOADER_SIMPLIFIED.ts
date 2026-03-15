// SIMPLIFIED NOVAGRID 2026 AUTOLOADER
// Only changes: Prediction 1, Prediction 2, Trade Type, Volatility Market

const loadNovagridBot = async (signal: SignalsCenterSignal) => {
    try {
        console.log('🎯 Loading NOVAGRID 2026 Bot for', signal.type);
        console.log('📋 Signal details:', {
            type: signal.type,
            market: signal.market,
            marketDisplay: signal.marketDisplay,
            displayFirstDigit: signal.displayFirstDigit,
            displaySecondDigit: signal.displaySecondDigit,
        });

        // 🔐 PREMIUM ACCESS CHECK
        const hasAccess = await hasPremiumAccess('Novagrid 2026');
        if (!hasAccess) {
            console.error('❌ PREMIUM ACCESS DENIED');
            return;
        }

        // Verify market value
        if (!signal.market) {
            throw new Error('Signal market is not defined');
        }

        // Fetch NOVAGRID 2026 Bot XML
        const response = await fetch('/NOVAGRID 2026.xml');
        if (!response.ok) {
            throw new Error(`Failed to fetch NOVAGRID 2026 Bot: ${response.statusText}`);
        }

        let botXml = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(botXml, 'text/xml');

        // ============================================
        // 1. SET VOLATILITY MARKET (SYMBOL_LIST)
        // ============================================
        const symbolFields = xmlDoc.querySelectorAll('field[name="SYMBOL_LIST"]');
        symbolFields.forEach(field => {
            const oldValue = field.textContent;
            field.textContent = signal.market;
            console.log(`📊 Market: "${oldValue}" → "${signal.market}" (${signal.marketDisplay})`);
        });

        // ============================================
        // 2. SET TRADE TYPE (DIGITOVER or DIGITUNDER)
        // ============================================
        const contractType = signal.type.startsWith('OVER') ? 'DIGITOVER' : 'DIGITUNDER';

        // Update TYPE_LIST
        const typeFields = xmlDoc.querySelectorAll('field[name="TYPE_LIST"]');
        typeFields.forEach(field => {
            field.textContent = contractType;
            console.log(`📝 Trade Type: "${field.textContent}" → "${contractType}"`);
        });

        // Update PURCHASE_LIST
        const purchaseFields = xmlDoc.querySelectorAll('field[name="PURCHASE_LIST"]');
        purchaseFields.forEach(field => {
            field.textContent = contractType;
            console.log(`💰 Purchase Type: "${contractType}"`);
        });

        // ============================================
        // 3. SET PREDICTION 1 (displayFirstDigit)
        // ============================================
        if (signal.displayFirstDigit !== undefined) {
            console.log(`🎯 Setting Prediction 1 to: ${signal.displayFirstDigit}`);

            // Find PREDICTION value elements
            const predictionValues = xmlDoc.querySelectorAll('value[name="PREDICTION"]');
            let prediction1Updated = false;

            predictionValues.forEach((predictionValue, index) => {
                const shadowBlock = predictionValue.querySelector('shadow[type="math_number_positive"]');
                if (shadowBlock && !prediction1Updated) {
                    const numField = shadowBlock.querySelector('field[name="NUM"]');
                    if (numField) {
                        const oldValue = numField.textContent;
                        numField.textContent = signal.displayFirstDigit.toString();
                        prediction1Updated = true;
                        console.log(`✅ Prediction 1: "${oldValue}" → "${signal.displayFirstDigit}"`);
                    }
                }
            });

            if (!prediction1Updated) {
                console.warn('⚠️ Could not update Prediction 1');
            }
        }

        // ============================================
        // 4. SET PREDICTION 2 (displaySecondDigit)
        // ============================================
        if (signal.displaySecondDigit !== undefined) {
            console.log(`🎯 Setting Prediction 2 to: ${signal.displaySecondDigit}`);

            // Find PREDICTION value elements (second one)
            const predictionValues = xmlDoc.querySelectorAll('value[name="PREDICTION"]');
            let prediction2Updated = false;
            let predictionCount = 0;

            predictionValues.forEach(predictionValue => {
                const shadowBlock = predictionValue.querySelector('shadow[type="math_number_positive"]');
                if (shadowBlock) {
                    predictionCount++;
                    if (predictionCount === 2 && !prediction2Updated) {
                        const numField = shadowBlock.querySelector('field[name="NUM"]');
                        if (numField) {
                            const oldValue = numField.textContent;
                            numField.textContent = signal.displaySecondDigit.toString();
                            prediction2Updated = true;
                            console.log(`✅ Prediction 2: "${oldValue}" → "${signal.displaySecondDigit}"`);
                        }
                    }
                }
            });

            if (!prediction2Updated) {
                console.warn('⚠️ Could not update Prediction 2');
            }
        }

        // Serialize back to XML
        const serializer = new XMLSerializer();
        botXml = serializer.serializeToString(xmlDoc);

        // Switch to Bot Builder tab
        setActiveTab(DBOT_TABS.BOT_BUILDER);

        // Wait for tab to load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Load the bot
        if (window.load_modal && typeof window.load_modal.loadStrategyToBuilder === 'function') {
            console.log('📤 Loading NOVAGRID 2026 Bot to builder...');
            console.log('🎯 NOVAGRID 2026 Configuration Summary:');
            console.log(`   Market: ${signal.market} (${signal.marketDisplay})`);
            console.log(`   Type: ${signal.type} (${contractType})`);
            console.log(`   Prediction 1: ${signal.displayFirstDigit}`);
            console.log(`   Prediction 2: ${signal.displaySecondDigit}`);

            await window.load_modal.loadStrategyToBuilder({
                id: `novagrid-${signal.id}`,
                name: `NOVAGRID 2026 - ${signal.marketDisplay} - ${signal.type}`,
                xml: botXml,
                save_type: 'LOCAL',
                timestamp: Date.now(),
            });

            console.log('✅ NOVAGRID 2026 Bot loaded successfully!');

            // Auto-run the bot after loading
            setTimeout(() => {
                console.log('🚀 AUTO-RUN: Starting NOVAGRID 2026 Bot...');
                try {
                    const runButton = document.getElementById('db-animation__run-button');
                    if (runButton) {
                        console.log('✅ Run button found, clicking now...');
                        runButton.click();
                        console.log('🎉 NOVAGRID 2026 Bot auto-started!');
                    } else {
                        console.warn('⚠️ Run button not found');
                    }
                } catch (error) {
                    console.error('❌ Failed to auto-run bot:', error);
                }
            }, 100);
        } else {
            throw new Error('Bot loader not available');
        }
    } catch (error) {
        console.error('❌ Failed to load NOVAGRID 2026 Bot:', error);
    }
};
