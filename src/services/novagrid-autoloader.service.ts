/**
 * NOVAGRID 2026 Autoloader Service
 * Simplified autoloader that only changes:
 * 1. Prediction 1 (displayFirstDigit)
 * 2. Prediction 2 (displaySecondDigit)
 * 3. Trade Type (DIGITOVER/DIGITUNDER)
 * 4. Volatility Market (SYMBOL_LIST)
 */

export const novagridAutoloaderService = {
    /**
     * Configure NOVAGRID 2026 Bot XML with signal parameters
     */
    configureBot: (botXml: string, signal: any): string => {
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

            const predictionValues = xmlDoc.querySelectorAll('value[name="PREDICTION"]');
            let prediction1Updated = false;

            predictionValues.forEach(predictionValue => {
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
        return serializer.serializeToString(xmlDoc);
    },
};
