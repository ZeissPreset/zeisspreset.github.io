// Security System Configuration
let config = {
    ddosProtection: true,
    bruteForceProtection: true,
    exploitProtection: true,
    autoIPBlocking: true,
    requestThreshold: 100, // Requests per minute
    blockDuration: 60, // Minutes
    monitoring: false
};

// System State
let state = {
    totalRequests: 0,
    blockedRequests: 0,
    activeThreats: 0,
    blockedIPs: [],
    requestLogs: [],
    requestTimestamps: {},
    ipThreatLevel: {}
};

// DOM Elements
const elements = {
    totalRequests: document.getElementById('total-requests'),
    blockedRequests: document.getElementById('blocked-requests'),
    activeThreats: document.getElementById('active-threats'),
    blockedIps: document.getElementById('blocked-ips'),
    requestLogs: document.getElementById('request-logs'),
    blockedIpList: document.getElementById('blocked-ip-list'),
    startMonitoring: document.getElementById('start-monitoring'),
    stopMonitoring: document.getElementById('stop-monitoring'),
    clearLogs: document.getElementById('clear-logs'),
    ddosMeter: document.getElementById('ddos-meter'),
    bruteMeter: document.getElementById('brute-meter'),
    exploitMeter: document.getElementById('exploit-meter'),
    ddosValue: document.getElementById('ddos-value'),
    bruteValue: document.getElementById('brute-value'),
    exploitValue: document.getElementById('exploit-value'),
    enableDdos: document.getElementById('enable-ddos'),
    enableBrute: document.getElementById('enable-brute'),
    enableExploit: document.getElementById('enable-exploit'),
    enableIpBlocking: document.getElementById('enable-ip-blocking'),
    requestThreshold: document.getElementById('request-threshold'),
    blockDuration: document.getElementById('block-duration'),
    saveSettings: document.getElementById('save-settings')
};

// Initialize the system
function init() {
    loadSettings();
    setupEventListeners();
    updateUI();
}

// Load settings from localStorage
function loadSettings() {
    const savedConfig = localStorage.getItem('securityConfig');
    if (savedConfig) {
        config = JSON.parse(savedConfig);
        elements.enableDdos.checked = config.ddosProtection;
        elements.enableBrute.checked = config.bruteForceProtection;
        elements.enableExploit.checked = config.exploitProtection;
        elements.enableIpBlocking.checked = config.autoIPBlocking;
        elements.requestThreshold.value = config.requestThreshold;
        elements.blockDuration.value = config.blockDuration;
    }
}

// Save settings to localStorage
function saveSettings() {
    config.ddosProtection = elements.enableDdos.checked;
    config.bruteForceProtection = elements.enableBrute.checked;
    config.exploitProtection = elements.enableExploit.checked;
    config.autoIPBlocking = elements.enableIpBlocking.checked;
    config.requestThreshold = parseInt(elements.requestThreshold.value);
    config.blockDuration = parseInt(elements.blockDuration.value);
    
    localStorage.setItem('securityConfig', JSON.stringify(config));
    alert('Settings saved successfully!');
}

// Setup event listeners
function setupEventListeners() {
    elements.startMonitoring.addEventListener('click', startMonitoring);
    elements.stopMonitoring.addEventListener('click', stopMonitoring);
    elements.clearLogs.addEventListener('click', clearLogs);
    elements.saveSettings.addEventListener('click', saveSettings);
}

// Start monitoring requests
function startMonitoring() {
    config.monitoring = true;
    elements.startMonitoring.disabled = true;
    elements.stopMonitoring.disabled = false;
    
    // Simulate incoming requests (in a real system, this would be actual requests)
    simulateRequests();
    
    logEvent('SYSTEM', 'Monitoring started');
}

// Stop monitoring
function stopMonitoring() {
    config.monitoring = false;
    elements.startMonitoring.disabled = false;
    elements.stopMonitoring.disabled = true;
    
    logEvent('SYSTEM', 'Monitoring stopped');
}

// Clear all logs
function clearLogs() {
    state.requestLogs = [];
    updateRequestLogs();
    logEvent('SYSTEM', 'Logs cleared');
}

// Log an event
function logEvent(source, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${source}] ${message}`;
    
    state.requestLogs.push(logEntry);
    if (state.requestLogs.length > 1000) {
        state.requestLogs.shift();
    }
    
    updateRequestLogs();
}

// Update the request logs display
function updateRequestLogs() {
    elements.requestLogs.textContent = state.requestLogs.join('\n');
    elements.requestLogs.scrollTop = elements.requestLogs.scrollHeight;
}

// Update all UI elements
function updateUI() {
    elements.totalRequests.textContent = state.totalRequests;
    elements.blockedRequests.textContent = state.blockedRequests;
    elements.activeThreats.textContent = state.activeThreats;
    elements.blockedIps.textContent = state.blockedIPs.length;
    
    // Update blocked IP list
    if (state.blockedIPs.length === 0) {
        elements.blockedIpList.innerHTML = '<p>No IPs blocked yet</p>';
    } else {
        elements.blockedIpList.innerHTML = state.blockedIPs.map(ip => 
            `<p><i class="fas fa-ban" style="color: var(--danger);"></i> ${ip}</p>`
        ).join('');
    }
}

// Simulate incoming requests (for demonstration)
function simulateRequests() {
    if (!config.monitoring) return;
    
    // Generate a random number of requests (0-5)
    const requestCount = Math.floor(Math.random() * 6);
    
    for (let i = 0; i < requestCount; i++) {
        setTimeout(() => {
            if (!config.monitoring) return;
            
            // Generate a random IP
            const ip = generateRandomIP();
            processRequest(ip);
        }, Math.random() * 2000);
    }
    
    // Occasionally simulate an attack
    if (Math.random() < 0.1) {
        simulateAttack();
    }
    
    // Continue simulating
    setTimeout(simulateRequests, 2000);
}

// Simulate an attack (DDoS, brute force, or exploit)
function simulateAttack() {
    if (!config.monitoring) return;
    
    const attackType = ['ddos', 'brute', 'exploit'][Math.floor(Math.random() * 3)];
    const ip = generateRandomIP();
    
    switch (attackType) {
        case 'ddos':
            simulateDDoS(ip);
            break;
        case 'brute':
            simulateBruteForce(ip);
            break;
        case 'exploit':
            simulateExploit(ip);
            break;
    }
}

// Simulate a DDoS attack from a single IP
function simulateDDoS(ip) {
    const requestCount = 50 + Math.floor(Math.random() * 50);
    
    logEvent('THREAT', `Potential DDoS detected from ${ip} (${requestCount} requests)`);
    
    for (let i = 0; i < requestCount; i++) {
        setTimeout(() => {
            if (!config.monitoring) return;
            processRequest(ip, true);
        }, i * 10);
    }
    
    // Update threat meter
    updateThreatMeter('ddos', 80 + Math.floor(Math.random() * 20));
}

// Simulate a brute force attack
function simulateBruteForce(ip) {
    logEvent('THREAT', `Brute force attempt detected from ${ip}`);
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            if (!config.monitoring) return;
            processRequest(ip, true);
        }, i * 300);
    }
    
    // Update threat meter
    updateThreatMeter('brute', 70 + Math.floor(Math.random() * 30));
}

// Simulate an exploit attempt
function simulateExploit(ip) {
    const exploits = [
        'SQL injection attempt',
        'XSS attempt',
        'Remote code execution attempt',
        'Path traversal attempt'
    ];
    const exploit = exploits[Math.floor(Math.random() * exploits.length)];
    
    logEvent('THREAT', `${exploit} detected from ${ip}`);
    processRequest(ip, true);
    
    // Update threat meter
    updateThreatMeter('exploit', 60 + Math.floor(Math.random() * 40));
}

// Process an incoming request
function processRequest(ip, isThreat = false) {
    state.totalRequests++;
    
    // Check if IP is blocked
    if (state.blockedIPs.includes(ip)) {
        state.blockedRequests++;
        logEvent('BLOCKED', `Request from blocked IP: ${ip}`);
        updateUI();
        return;
    }
    
    // Track request timestamps for rate limiting
    if (!state.requestTimestamps[ip]) {
        state.requestTimestamps[ip] = [];
    }
    
    const now = Date.now();
    state.requestTimestamps[ip].push(now);
    
    // Clean up old timestamps (older than 1 minute)
    state.requestTimestamps[ip] = state.requestTimestamps[ip].filter(
        timestamp => now - timestamp < 60000
    );
    
    // Check request rate
    const requestRate = state.requestTimestamps[ip].length;
    const isRateLimited = requestRate > config.requestThreshold;
    
    // Determine if request is malicious
    let isMalicious = isThreat || isRateLimited;
    
    // Update threat level for IP
    if (!state.ipThreatLevel[ip]) {
        state.ipThreatLevel[ip] = 0;
    }
    
    if (isMalicious) {
        state.ipThreatLevel[ip] += 10;
        state.activeThreats++;
    } else {
        state.ipThreatLevel[ip] = Math.max(0, state.ipThreatLevel[ip] - 1);
    }
    
    // Block IP if threat level is high and auto-blocking is enabled
    if (config.autoIPBlocking && state.ipThreatLevel[ip] >= 30 && !state.blockedIPs.includes(ip)) {
        state.blockedIPs.push(ip);
        logEvent('BLOCKED', `IP ${ip} blocked automatically due to high threat level`);
        
        // Unblock after configured duration
        setTimeout(() => {
            state.blockedIPs = state.blockedIPs.filter(blockedIp => blockedIp !== ip);
            logEvent('UNBLOCKED', `IP ${ip} unblocked after timeout`);
            updateUI();
        }, config.blockDuration * 60000);
    }
    
    // Log the request
    if (isMalicious) {
        state.blockedRequests++;
        logEvent('BLOCKED', `Malicious request blocked from ${ip}`);
    } else {
        logEvent('REQUEST', `Request from ${ip}`);
    }
    
    updateUI();
}

// Update threat meter display
function updateThreatMeter(type, value) {
    value = Math.min(100, Math.max(0, value));
    
    const meterElement = elements[`${type}Meter`];
    const valueElement = elements[`${type}Value`];
    
    meterElement.style.width = `${value}%`;
    valueElement.textContent = `${value}%`;
    
    // Change color based on threat level
    if (value > 80) {
        meterElement.style.backgroundColor = 'var(--danger)';
        meterElement.classList.add('alert');
    } else if (value > 50) {
        meterElement.style.backgroundColor = 'var(--warning)';
        meterElement.classList.remove('alert');
    } else {
        meterElement.style.backgroundColor = 'var(--success)';
        meterElement.classList.remove('alert');
    }
}

// Generate a random IP address
function generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Initialize the system when the page loads
window.addEventListener('DOMContentLoaded', init);