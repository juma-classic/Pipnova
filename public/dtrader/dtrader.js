// DTrader Manual Trading JavaScript
console.log('🎯 DTrader Manual Trading Loaded');

// State
let tickHistory = [];
let digitCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let totalTicks = 0;
let basePrice = 1787.34;
let currentPrice = basePrice;
let selectedDigit = 5; // Default selected digit

// Generate realistic price tick
function generateTick() {
    // Random walk with slight upward bias
    const change = (Math.random() - 0.48) * 2;
    currentPrice = Math.max(1700, Math.min(1900, currentPrice + change));
    return parseFloat(currentPrice.toFixed(2));
}

// Get last digit of price
function getLastDigit(price) {
    const priceStr = price.toFixed(2);
    return parseInt(priceStr[priceStr.length - 1]);
}

// Update price display
function updatePriceDisplay() {
    const priceValue = document.querySelector('.price-value');
    const priceChange = document.querySelector('.price-change');
    const priceArrow = document.querySelector('.price-arrow path');
    
    if (priceValue && priceChange) {
        const change = currentPrice - basePrice;
        const changePercent = ((change / basePrice) * 100).toFixed(2);
        
        priceValue.textContent = currentPrice.toFixed(2);
        priceChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent}%)`;
        priceChange.classList.toggle('negative', change < 0);
        
        if (priceArrow) {
            if (change >= 0) {
                priceArrow.setAttribute('d', 'M6 3L2 7h8z');
            } else {
                priceArrow.setAttribute('d', 'M6 9L2 5h8z');
            }
        }
    }
}

// Add new tick
function addTick(price) {
    const lastDigit = getLastDigit(price);
    
    // Update digit counts
    digitCounts[lastDigit]++;
    totalTicks++;
    
    // Update digit statistics
    updateDigitStatistics();
    
    // Highlight current digit
    highlightCurrentDigit(lastDigit);
}

// Highlight current digit in statistics
function highlightCurrentDigit(digit) {
    // Remove all previous indicators
    document.querySelectorAll('.digit-circle').forEach(circle => {
        circle.classList.remove('active');
    });
    
    // Add indicator to current digit
    const digitCircles = document.querySelectorAll('.digit-circle');
    if (digitCircles[digit]) {
        digitCircles[digit].classList.add('active');
        
        // Keep visible longer
        setTimeout(() => {
            digitCircles[digit].classList.remove('active');
        }, 1000);
    }
}

// Update digit statistics display
function updateDigitStatistics() {
    const digitCircles = document.querySelectorAll('.digit-circle');
    
    digitCircles.forEach((circle, digit) => {
        const percentage = totalTicks > 0 ? ((digitCounts[digit] / totalTicks) * 100).toFixed(1) : 10;
        const percentageEl = circle.querySelector('.digit-percentage');
        const circleFill = circle.querySelector('.circle-fill');
        
        if (percentageEl) {
            percentageEl.textContent = `${percentage}%`;
        }
        
        if (circleFill) {
            circleFill.setAttribute('stroke-dasharray', `${percentage}, 100`);
            
            // Remove all color classes first
            circleFill.classList.remove('low', 'high', 'active');
            
            // Color based on percentage
            if (percentage >= 11) {
                circleFill.classList.add('high');
            } else if (percentage <= 9) {
                circleFill.classList.add('low');
            }
        }
    });
}

// Generate new tick
function generateNewTick() {
    const newPrice = generateTick();
    addTick(newPrice);
    updatePriceDisplay();
}

// Handle digit selector button clicks
document.querySelectorAll('.digit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const digit = parseInt(this.textContent);
        selectedDigit = digit;
        
        // Update active state
        document.querySelectorAll('.digit-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        console.log(`Selected digit: ${digit}`);
    });
});

// Handle trade button clicks
document.querySelectorAll('.trade-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const type = this.classList.contains('over') ? 'Over' : 'Under';
        console.log(`🎲 Placing ${type} trade for digit ${selectedDigit}`);
        
        // Visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
        
        // Simulate trade placement
        const stake = '10.00 AUD';
        const payout = type === 'Over' ? '22.62 AUD' : '18.45 AUD';
        
        // Show success message
        const message = `✅ Trade Placed Successfully!\n\nType: ${type} ${selectedDigit}\nStake: ${stake}\nPotential Payout: ${payout}\n\nWaiting for 5 ticks...`;
        alert(message);
        
        // Simulate trade result after 5 ticks
        setTimeout(() => {
            const lastDigit = getLastDigit(currentPrice);
            let won = false;
            
            if (type === 'Over') {
                won = lastDigit > selectedDigit;
            } else {
                won = lastDigit < selectedDigit;
            }
            
            if (won) {
                alert(`🎉 Congratulations! You won!\n\nLast digit: ${lastDigit}\nYour prediction: ${type} ${selectedDigit}\nPayout: ${payout}`);
            } else {
                alert(`😔 Trade lost\n\nLast digit: ${lastDigit}\nYour prediction: ${type} ${selectedDigit}\nBetter luck next time!`);
            }
        }, 5000);
    });
});

// Handle navigation arrows
document.querySelectorAll('.nav-arrow').forEach(arrow => {
    arrow.addEventListener('click', function() {
        const tickStream = document.getElementById('tickStream');
        if (!tickStream) return;
        
        const scrollAmount = 200;
        if (this.classList.contains('left')) {
            tickStream.scrollLeft -= scrollAmount;
        } else {
            tickStream.scrollLeft += scrollAmount;
        }
    });
});

// Handle market dropdown
const marketDropdown = document.querySelector('.market-dropdown');
if (marketDropdown) {
    marketDropdown.addEventListener('click', function() {
        console.log('Market selector clicked');
        alert('Market Selection\n\nAvailable Markets:\n• Volatility 100 (1s) Index\n• Volatility 75 (1s) Index\n• Volatility 50 (1s) Index\n• Volatility 25 (1s) Index\n\nCurrent: Volatility 100 (1s) Index');
    });
}

// Handle trade type selector
const tradeTypeCard = document.querySelector('.trade-type-card');
if (tradeTypeCard) {
    tradeTypeCard.addEventListener('click', function() {
        console.log('Trade type selector clicked');
        alert('Trade Types\n\nAvailable:\n• Over/Under\n• Even/Odd\n• Matches/Differs\n• Rise/Fall\n\nCurrent: Over/Under');
    });
}

// Handle risk disclaimer button
const riskDisclaimer = document.querySelector('.risk-disclaimer');
if (riskDisclaimer) {
    riskDisclaimer.addEventListener('click', function() {
        console.log('Risk disclaimer clicked');
        alert('Risk Disclaimer\n\nTrading derivatives carries a high level of risk to your capital and you should only trade with money you can afford to lose. Trading derivatives may not be suitable for all investors, so please ensure that you fully understand the risks involved and seek independent advice if necessary.\n\nA Deriv account will not protect you from losses.');
    });
}

// Initialize with some historical data
function initializeTickHistory() {
    console.log('📊 Initializing tick history...');
    // Generate realistic initial percentages
    for (let i = 0; i < 100; i++) {
        const price = generateTick();
        const lastDigit = getLastDigit(price);
        digitCounts[lastDigit]++;
        totalTicks++;
    }
    updateDigitStatistics();
}

// Start the application
console.log('🚀 Starting DTrader...');
initializeTickHistory();

// Generate new tick every 1 second
setInterval(generateNewTick, 1000);

console.log('✅ DTrader initialized successfully');
console.log('📈 Real-time ticks streaming...');
