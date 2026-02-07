// Nova Analysis - Simplified Trading Analytics
let ws;
let tickHistory = [];
let currentSymbol = localStorage.getItem('novaSymbol') || 'R_50';
let tickCount = parseInt(localStorage.getItem('novaTickCount')) || 500;
let digitChart, evenOddChart;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeControls();
    initializeCharts();
    startWebSocket();
});

// Initialize controls
function initializeControls() {
    const symbolSelect = document.getElementById('symbol-select');
    const tickCountInput = document.getElementById('tick-count-input');
    const reconnectBtn = document.getElementById('reconnect-btn');

    symbolSelect.value = currentSymbol;
    tickCountInput.value = tickCount;

    symbolSelect.addEventListener('change', (e) => {
        currentSymbol = e.target.value;
        localStorage.setItem('novaSymbol', currentSymbol);
        reconnect();
    });

    tickCountInput.addEventListener('change', (e) => {
        tickCount = parseInt(e.target.value) || 500;
        localStorage.setItem('novaTickCount', tickCount);
        reconnect();
    });

    reconnectBtn.addEventListener('click', reconnect);
}

// Initialize charts
function initializeCharts() {
    const digitCtx = document.getElementById('digit-chart').getContext('2d');
    const evenOddCtx = document.getElementById('even-odd-chart').getContext('2d');

    digitChart = new Chart(digitCtx, {
        type: 'bar',
        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            datasets: [{
                label: 'Digit Frequency',
                data: Array(10).fill(0),
                backgroundColor: 'rgba(0, 212, 255, 0.6)',
                borderColor: 'rgba(0, 212, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#8892b0' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#8892b0' }
                }
            }
        }
    });

    evenOddChart = new Chart(evenOddCtx, {
        type: 'doughnut',
        data: {
            labels: ['Even', 'Odd'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.6)',
                    'rgba(255, 100, 100, 0.6)'
                ],
                borderColor: [
                    'rgba(0, 212, 255, 1)',
                    'rgba(255, 100, 100, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#e0e6ed' }
                }
            }
        }
    });
}

// WebSocket connection
function startWebSocket() {
    updateConnectionStatus('connecting');
    
    ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=125428');
    
    ws.onopen = () => {
        console.log('✅ Connected to Deriv WebSocket');
        updateConnectionStatus('connected');
        requestTickHistory();
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        updateConnectionStatus('error');
    };
    
    ws.onclose = () => {
        console.log('🔌 WebSocket closed');
        updateConnectionStatus('disconnected');
        setTimeout(() => {
            if (ws.readyState === WebSocket.CLOSED) {
                startWebSocket();
            }
        }, 3000);
    };
}

// Request tick history
function requestTickHistory() {
    const request = {
        ticks_history: currentSymbol,
        adjust_start_time: 1,
        count: tickCount,
        end: 'latest',
        start: 1,
        style: 'ticks'
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
                    quote: parseFloat(data.history.prices[i])
                });
            }
        }
        updateUI();
        subscribeToTicks();
    } else if (data.msg_type === 'tick') {
        // Process live tick
        tickHistory.push({
            time: data.tick.epoch,
            quote: parseFloat(data.tick.quote)
        });
        
        // Keep only the specified number of ticks
        if (tickHistory.length > tickCount) {
            tickHistory.shift();
        }
        
        updateUI();
    }
}

// Subscribe to live ticks
function subscribeToTicks() {
    const request = {
        ticks: currentSymbol,
        subscribe: 1
    };
    ws.send(JSON.stringify(request));
}

// Update UI with current data
function updateUI() {
    if (tickHistory.length === 0) return;
    
    // Update stats
    document.getElementById('total-ticks').textContent = tickHistory.length;
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
    
    // Update last digit display
    const lastDigit = lastDigits[lastDigits.length - 1];
    document.getElementById('last-digit').textContent = lastDigit;
    
    // Update digit distribution display
    updateDigitDisplay(digitCounts);
    
    // Update digit chart
    digitChart.data.datasets[0].data = digitCounts;
    digitChart.update();
    
    // Update even/odd analysis
    updateEvenOddAnalysis(lastDigits);
    
    // Update recent digits
    updateRecentDigits(lastDigits.slice(-50));
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

// Update digit display
function updateDigitDisplay(digitCounts) {
    const container = document.getElementById('digit-display');
    const total = digitCounts.reduce((a, b) => a + b, 0);
    
    container.innerHTML = '';
    digitCounts.forEach((count, digit) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        const item = document.createElement('div');
        item.className = 'digit-item';
        item.innerHTML = `
            <div class="digit-number">${digit}</div>
            <div class="digit-count">${count}</div>
            <div class="digit-percentage">${percentage}%</div>
        `;
        container.appendChild(item);
    });
}

// Update even/odd analysis
function updateEvenOddAnalysis(lastDigits) {
    let evenCount = 0;
    let oddCount = 0;
    
    lastDigits.forEach(digit => {
        if (digit % 2 === 0) {
            evenCount++;
        } else {
            oddCount++;
        }
    });
    
    const total = evenCount + oddCount;
    const evenPercentage = total > 0 ? ((evenCount / total) * 100).toFixed(1) : 0;
    const oddPercentage = total > 0 ? ((oddCount / total) * 100).toFixed(1) : 0;
    
    // Update display
    const container = document.getElementById('even-odd-display');
    container.innerHTML = `
        <div class="even-odd-item">
            <div class="even-odd-label">⚪ Even</div>
            <div class="even-odd-count">${evenCount}</div>
            <div class="even-odd-percentage">${evenPercentage}%</div>
        </div>
        <div class="even-odd-item">
            <div class="even-odd-label">⚫ Odd</div>
            <div class="even-odd-count">${oddCount}</div>
            <div class="even-odd-percentage">${oddPercentage}%</div>
        </div>
    `;
    
    // Update percentage text
    document.getElementById('even-odd-percentage').textContent = 
        `Even: ${evenPercentage}% | Odd: ${oddPercentage}%`;
    
    // Update chart
    evenOddChart.data.datasets[0].data = [evenCount, oddCount];
    evenOddChart.update();
}

// Update recent digits display
function updateRecentDigits(recentDigits) {
    const container = document.getElementById('recent-digits');
    container.innerHTML = '';
    
    recentDigits.forEach(digit => {
        const item = document.createElement('div');
        item.className = `recent-digit ${digit % 2 === 0 ? 'even' : 'odd'}`;
        item.textContent = digit;
        container.appendChild(item);
    });
}

// Update connection status
function updateConnectionStatus(status) {
    const statusEl = document.getElementById('connection-status');
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('.status-text');
    
    dot.className = 'status-dot';
    
    switch(status) {
        case 'connecting':
            text.textContent = 'Connecting...';
            break;
        case 'connected':
            dot.classList.add('connected');
            text.textContent = 'Connected';
            break;
        case 'disconnected':
            text.textContent = 'Disconnected';
            break;
        case 'error':
            text.textContent = 'Connection Error';
            break;
    }
}

// Reconnect
function reconnect() {
    if (ws) {
        ws.close();
    }
    tickHistory = [];
    startWebSocket();
}

console.log('✨ Nova Analysis initialized');
