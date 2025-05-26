// Security System Configuration
let config = {
    ddosProtection: true,
    bruteForceProtection: true,
    exploitProtection: true,
    autoIPBlocking: true,
    requestThreshold: 100, // Requests per minute
    blockDuration: 60, // Minutes
};

// System State
let state = {
    totalRequests: 0,
    blockedRequests: 0,
    activeThreats: 0,
    blockedIPs: [],
    requestLogs: [],
    requestTimestamps: {},
    ipThreatLevel: {},
    ipRequestCounts: {}
};

// DOM Elements
const elements = {
    totalRequests: document.getElementById('total-requests'),
    blockedRequests: document.getElementById('blocked-requests'),
    activeThreats: document.getElementById('active-threats'),
    blockedIps: document.getElementById('blocked-ips'),
    requestLogs: document.getElementById('request-logs'),
    blockedIpList: document.getElementById('blocked-ip-list'),
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
    saveSettings: document.getElementById('save-settings'),
    clearBlocked: document.getElementById('clear-blocked')
};

// Initialize the system
function init() {
    loadSettings();
    setupEventListeners();
    updateUI();
    startRequestMonitoring();
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
    logEvent('SYSTEM', 'Security settings updated');
    alert('Settings saved successfully!');
}

// Setup event listeners
function setupEventListeners() {
    elements.saveSettings.addEventListener('click', saveSettings);
    elements.clearBlocked.addEventListener('click', clearBlockedIPs);
}

// Clear all blocked IPs
function clearBlockedIPs() {
    state.blockedIPs = [];
    state.ipThreatLevel = {};
    logEvent('SYSTEM', 'All blocked IPs cleared');
    updateUI();
}

// Log an event
function logEvent(source, message) {
    const timestamp = new Date().toLocaleTimeString();
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

// Start monitoring real requests
function startRequestMonitoring() {
    // This would be replaced with actual server-side code in a real implementation
    // For this client-side demo, we'll simulate receiving requests from the server
    
    // In a real implementation, you would:
    // 1. Set up a WebSocket connection to receive real-time request data
    // 2. Or use Server-Sent Events (SSE)
    // 3. Or poll an API endpoint periodically
    
    logEvent('SYSTEM', 'Protection system activated');
}

// Process an incoming request (to be called from server-side)
function processRequest(ip, requestData = {}) {
    state.totalRequests++;
    
    // Check if IP is blocked
    if (state.blockedIPs.includes(ip)) {
        state.blockedRequests++;
        logEvent('BLOCKED', `Request from blocked IP: ${ip}`);
        updateUI();
        return { blocked: true, reason: 'IP blocked' };
    }
    
    // Initialize tracking for this IP if not exists
    if (!state.requestTimestamps[ip]) {
        state.requestTimestamps[ip] = [];
        state.ipRequestCounts[ip] = 0;
    }
    
    const now = Date.now();
    state.requestTimestamps[ip].push(now);
    state.ipRequestCounts[ip]++;
    
    // Clean up old timestamps (older than 1 minute)
    state.requestTimestamps[ip] = state.requestTimestamps[ip].filter(
        timestamp => now - timestamp < 60000
    );
    
    // Check request rate
    const requestRate = state.requestTimestamps[ip].length;
    const isRateLimited = requestRate > config.requestThreshold;
    
    // Analyze request for threats
    const threatAnalysis = analyzeRequest(requestData);
    const isMalicious = isRateLimited || threatAnalysis.isThreat;
    
    // Update threat level for IP
    if (!state.ipThreatLevel[ip]) {
        state.ipThreatLevel[ip] = 0;
    }
    
    if (isMalicious) {
        state.ipThreatLevel[ip] += threatAnalysis.threatScore || 10;
        state.activeThreats++;
        
        // Update relevant threat meter
        if (threatAnalysis.threatType === 'ddos') {
            updateThreatMeter('ddos', Math.min(100, state.ipThreatLevel[ip]));
        } else if (threatAnalysis.threatType === 'brute') {
            updateThreatMeter('brute', Math.min(100, state.ipThreatLevel[ip]));
        } else if (threatAnalysis.threatType === 'exploit') {
            updateThreatMeter('exploit', Math.min(100, state.ipThreatLevel[ip]));
        }
    } else {
        state.ipThreatLevel[ip] = Math.max(0, state.ipThreatLevel[ip] - 1);
    }
    
    // Block IP if threat level is high and auto-blocking is enabled
    if (config.autoIPBlocking && state.ipThreatLevel[ip] >= 30 && !state.blockedIPs.includes(ip)) {
        state.blockedIPs.push(ip);
        logEvent('BLOCKED', `IP ${ip} blocked automatically (Threat level: ${state.ipThreatLevel[ip]})`);
        
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
        logEvent('BLOCKED', `Malicious request blocked from ${ip} (${threatAnalysis.reason || 'High request rate'})`);
        return { blocked: true, reason: threatAnalysis.reason || 'High request rate' };
    } else {
        logEvent('REQUEST', `Request from ${ip}${requestData.path ? ` to ${requestData.path}` : ''}`);
        return { blocked: false };
    }
    
    updateUI();
}

// Analyze a request for potential threats
function analyzeRequest(requestData) {
    const result = {
        isThreat: false,
        threatType: null,
        threatScore: 0,
        reason: null
    };
    
    // Check for DDoS patterns
    if (config.ddosProtection) {
        // In a real system, you would analyze request patterns here
    }
    
    // Check for brute force patterns
    if (config.bruteForceProtection && requestData.path) {
        const bruteForcePaths = ['/login', '/admin', '/wp-login.php'];
        if (bruteForcePaths.includes(requestData.path.toLowerCase())) {
            result.isThreat = true;
            result.threatType = 'brute';
            result.threatScore = 15;
            result.reason = 'Brute force attempt';
        }
    }
    
    // Check for exploit patterns
    if (config.exploitProtection && requestData.query) {
        const exploitPatterns = [
            /select.+from/i,
            /union.+select/i,
            /<script>/i,
            /eval\(/i,
            /\.\.\// // Path traversal
        ];
        
        for (const pattern of exploitPatterns) {
            if (pattern.test(JSON.stringify(requestData.query))) {
                result.isThreat = true;
                result.threatType = 'exploit';
                result.threatScore = 20;
                result.reason = 'Potential exploit attempt';
                break;
            }
        }
    }
    
    return result;
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

// Initialize the system when the page loads
window.addEventListener('DOMContentLoaded', init);

// Export functions for server-side use (in a real implementation)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processRequest,
        analyzeRequest
    };
}