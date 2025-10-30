// Configuration for RainMerge Stream
const CONFIG = {
    // Backend API URL (will be your Cloudflare Tunnel URL)
    // For now, using localhost for testing
    API_URL: 'http://localhost:8080',
    
    // Stream endpoint
    STREAM_ENDPOINT: '/stream',
    
    // Health check endpoint
    HEALTH_ENDPOINT: '/health',
    
    // Control endpoint (for future click interactions)
    CONTROL_ENDPOINT: '/control/click',
    
    // Stream settings
    RECONNECT_INTERVAL: 5000,  // 5 seconds
    HEALTH_CHECK_INTERVAL: 10000,  // 10 seconds
    
    // Enable debug logs
    DEBUG: true
};

// Helper function for logging
const log = (message, type = 'info') => {
    if (!CONFIG.DEBUG && type === 'debug') return;
    
    const prefix = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        debug: '🔍'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [RainMerge] ${message}`);
};

// Export for use in other scripts
window.CONFIG = CONFIG;
window.log = log;
