// Nova Analysis - Exact Match to Screenshot
let ws;
let tickHistory = [];
let currentSymbol = 'R_50'; // Volatility 50 Index
let selectedDigit = 3;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeUI();
    startWebSocket();
});

// Initialize UI
function initializeUI() {
    renderDigitCircles();
    renderDigitSelector();
    updateMarketLabel();
    setupShowMoreButton();
}

// Setup show more button
function setupShowMoreButton() {
    const btn = document.getElementById('show-more-btn');
    let showing = 50;

    btn.addEventListener('click', () => {
        if (showing === 50) {
            showing = 100;
            btn.textContent = 'Show Less (50) →';
        } else {
            showing = 50;
            btn.textContent = 'Show More (100) →';
        }
        updateDigitsStream(showing);
    });
}

// Render digit circles (0-9)
function renderDigitCircles() {
    const container = document.getElementById('digit-circles');
    container.innerHTML = '';

    for (let i = 0; i <= 9; i++) {
        const circle = createDigitCircle(i);
        container.appendChild(circle);
    }
}

// Create a single digit circle with SVG progress ring
function createDigitCircle(digit) {
    const div = document.createElement('div');
    div.className = 'digit-circle';
    div.setAttribute('data-digit', digit);

    const radius = 34;
    const circumference = 2 * Math.PI * radius;

    div.innerHTML = `
        <svg class="circle-svg" width="80" height="80">
            <circle class="circle-bg" cx="40" cy="40" r="${radius}"></circle>
            <circle class="circle-progress" cx="40" cy="40" r="${radius}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${circumference}"></circle>
        </svg>
        <div class="digit-number">${digit}</div>
        <div class="digit-percentage">0.0%</div>
    `;

    return div;
}

// Render digit selector buttons
function renderDigitSelector() {
    const container = document.getElementById('digit-selector');
    container.innerHTML = '';

    for (let i = 0; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'digit-btn';
        btn.textContent = i;
        btn.setAttribute('data-digit', i);

        if (i === selectedDigit) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            selectedDigit = i;
            updateDigitSelector();
            updateComparison();
        });

        container.appendChild(btn);
    }
}

// Update digit selector active state
function updateDigitSelector() {
    document.querySelectorAll('.digit-btn').forEach(btn => {
        const digit = parseInt(btn.getAttribute('data-digit'));
        if (digit === selectedDigit) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update selected digit labels
    document.getElementById('selected-digit-over').textContent = selectedDigit;
    document.getElementById('selected-digit-under').textContent = selectedDigit;
    document.getElementById('selected-digit-equal').textContent = selectedDigit;
}

// Update market label
function updateMarketLabel() {
    const marketNames = {
        'R_10': 'Volatility 10 Index',
        'R_25': 'Volatility 25 Index',
        'R_50': 'Volatility 50 Index',
        'R_75': 'Volatility 75 Index',
        'R_100': 'Volatility 100 Index',
        '1HZ10V': 'Volatility 10 (1s) Index',
        '1HZ25V': 'Volatility 25 (1s) Index',
        '1HZ50V': 'Volatility 50 (1s) Index',
        '1HZ75V': 'Volatility 75 (1s) Index',
        '1HZ100V': 'Volatility 100 (1s) Index',
    };

    document.getElementById('market-label').textContent = marketNames[currentSymbol] || currentSymbol;
}

// WebSocket connection
function startWebSocket() {
    ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=125428');

    ws.onopen = () => {
        console.log('✅ Connected to Deriv WebSocket');
        requestTickHistory();
    };

    ws.onmessage = event => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    ws.onerror = error => {
        console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('🔌 WebSocket closed, reconnecting...');
        setTimeout(startWebSocket, 3000);
    };
}

// Request tick history
function requestTickHistory() {
    const request = {
        ticks_history: currentSymbol,
        adjust_start_time: 1,
        count: 1000,
        end: 'latest',
        start: 1,
        style: 'ticks',
    };

    ws.send(JSON.stringify(request));
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
    if (data.msg_type === 'history') {
        // Process historical ticks
        tickHistory = [];
        if (data.history && data.history.times && data.history.prices) {
            for (let i = 0; i < data.history.times.length; i++) {
                tickHistory.push({
                    time: data.history.times[i],
                    quote: parseFloat(data.history.prices[i]),
                });
            }
        }
        updateUI();
        subscribeToTicks();
    } else if (data.msg_type === 'tick') {
        // Process live tick
        tickHistory.push({
            time: data.tick.epoch,
            quote: parseFloat(data.tick.quote),
        });

        // Keep last 1000 ticks
        if (tickHistory.length > 1000) {
            tickHistory.shift();
        }

        updateUI();
    }
}

// Subscribe to live ticks
function subscribeToTicks() {
    const request = {
        ticks: currentSymbol,
        subscribe: 1,
    };
    ws.send(JSON.stringify(request));
}

// Update UI with current data
function updateUI() {
    if (tickHistory.length === 0) return;

    // Update current price
    const lastTick = tickHistory[tickHistory.length - 1];
    document.getElementById('current-price').textContent = lastTick.quote.toFixed(3);

    // Calculate digit distribution
    const digitCounts = Array(10).fill(0);
    const lastDigits = [];

    tickHistory.forEach(tick => {
        const digit = getLastDigit(tick.quote);
        digitCounts[digit]++;
        lastDigits.push(digit);
    });

    // Update digit circles
    updateDigitCircles(digitCounts);

    // Update comparison
    updateComparison();

    // Update even/odd pattern
    updateEvenOddPattern();

    // Update market movement
    updateMarketMovement();

    // Update digits stream
    updateDigitsStream(50);
}

// Get last digit from price
function getLastDigit(price) {
    const priceStr = price.toString();
    const parts = priceStr.split('.');
    if (parts.length > 1) {
        const decimals = parts[1];
        return parseInt(decimals[decimals.length - 1]);
    }
    return parseInt(priceStr[priceStr.length - 1]);
}

// Update digit circles with percentages and progress rings
function updateDigitCircles(digitCounts) {
    const total = digitCounts.reduce((a, b) => a + b, 0);
    if (total === 0) return;

    let highestDigit = 0;
    let lowestDigit = 0;
    let highestCount = digitCounts[0];
    let lowestCount = digitCounts[0];

    // Get current last digit
    const currentLastDigit = tickHistory.length > 0 ? getLastDigit(tickHistory[tickHistory.length - 1].quote) : null;

    digitCounts.forEach((count, digit) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const circle = document.querySelector(`.digit-circle[data-digit="${digit}"]`);

        if (circle) {
            // Remove active class from all circles first
            circle.classList.remove('active');

            // Add active class to current last digit
            if (digit === currentLastDigit) {
                circle.classList.add('active');
            }

            // Update percentage text
            const percentageEl = circle.querySelector('.digit-percentage');
            percentageEl.textContent = `${percentage}%`;

            // Update progress ring
            const progressCircle = circle.querySelector('.circle-progress');
            const radius = 34;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percentage / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }

        // Track highest and lowest
        if (count > highestCount) {
            highestCount = count;
            highestDigit = digit;
        }
        if (count < lowestCount) {
            lowestCount = count;
            lowestDigit = digit;
        }
    });

    // Update highest/lowest display
    const highestPercentage = ((highestCount / total) * 100).toFixed(1);
    const lowestPercentage = ((lowestCount / total) * 100).toFixed(1);

    document.getElementById('highest-digit').textContent = `${highestDigit} (${highestPercentage}%)`;
    document.getElementById('lowest-digit').textContent = `${lowestDigit} (${lowestPercentage}%)`;
}

// Update comparison section
function updateComparison() {
    if (tickHistory.length === 0) return;

    const lastDigits = tickHistory.map(tick => getLastDigit(tick.quote));
    const total = lastDigits.length;

    let overCount = 0;
    let underCount = 0;
    let equalCount = 0;

    lastDigits.forEach(digit => {
        if (digit > selectedDigit) {
            overCount++;
        } else if (digit < selectedDigit) {
            underCount++;
        } else {
            equalCount++;
        }
    });

    const overPercentage = ((overCount / total) * 100).toFixed(1);
    const underPercentage = ((underCount / total) * 100).toFixed(1);
    const equalPercentage = ((equalCount / total) * 100).toFixed(1);

    document.getElementById('over-value').textContent = `${overPercentage}%`;
    document.getElementById('under-value').textContent = `${underPercentage}%`;
    document.getElementById('equal-value').textContent = `${equalPercentage}%`;
}

// Update even/odd pattern
function updateEvenOddPattern() {
    if (tickHistory.length === 0) return;

    const lastDigits = tickHistory.map(tick => getLastDigit(tick.quote));
    const last50 = lastDigits.slice(-50);

    let evenCount = 0;
    let oddCount = 0;

    last50.forEach(digit => {
        if (digit % 2 === 0) {
            evenCount++;
        } else {
            oddCount++;
        }
    });

    const total = last50.length;
    const evenPercentage = ((evenCount / total) * 100).toFixed(1);
    const oddPercentage = ((oddCount / total) * 100).toFixed(1);

    document.getElementById('even-percentage').textContent = `${evenPercentage}%`;
    document.getElementById('odd-percentage').textContent = `${oddPercentage}%`;

    // Render pattern stream
    const container = document.getElementById('pattern-stream');
    container.innerHTML = '';

    last50.forEach(digit => {
        const badge = document.createElement('div');
        badge.className = `pattern-badge ${digit % 2 === 0 ? 'even' : 'odd'}`;
        badge.textContent = digit % 2 === 0 ? 'E' : 'O';
        container.appendChild(badge);
    });
}

// Update market movement (Rise/Fall)
function updateMarketMovement() {
    if (tickHistory.length < 2) return;

    let riseCount = 0;
    let fallCount = 0;

    for (let i = 1; i < tickHistory.length; i++) {
        if (tickHistory[i].quote > tickHistory[i - 1].quote) {
            riseCount++;
        } else if (tickHistory[i].quote < tickHistory[i - 1].quote) {
            fallCount++;
        }
    }

    const total = riseCount + fallCount;
    const risePercentage = total > 0 ? ((riseCount / total) * 100).toFixed(1) : '0.0';
    const fallPercentage = total > 0 ? ((fallCount / total) * 100).toFixed(1) : '0.0';

    document.getElementById('rise-percentage').textContent = `${risePercentage}%`;
    document.getElementById('fall-percentage').textContent = `${fallPercentage}%`;
}

// Update digits stream
function updateDigitsStream(count = 50) {
    if (tickHistory.length === 0) return;

    const lastDigits = tickHistory.map(tick => getLastDigit(tick.quote));
    const displayDigits = lastDigits.slice(-count);

    const container = document.getElementById('digits-stream');
    container.innerHTML = '';

    displayDigits.forEach(digit => {
        const badge = document.createElement('div');
        badge.className = `digit-badge ${digit % 2 === 0 ? 'even' : 'odd'}`;
        badge.textContent = digit;
        container.appendChild(badge);
    });
}

console.log('✨ Nova Analysis initialized');
