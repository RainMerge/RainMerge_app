// RainMerge Stream Player
class StreamPlayer {
    constructor() {
        this.streamImg = document.getElementById('stream');
        this.statusElement = document.getElementById('status');
        this.statusText = document.getElementById('status-text');
        this.streamStatus = document.getElementById('stream-status');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        
        this.isStreaming = false;
        this.healthCheckInterval = null;
        this.streamUrl = null;
        
        this.init();
    }
    
    init() {
        log('Initializing stream player...', 'info');
        
        // Set up event listeners
        this.startBtn.addEventListener('click', () => this.startStream());
        this.stopBtn.addEventListener('click', () => this.stopStream());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Handle stream errors
        this.streamImg.addEventListener('error', () => {
            log('Stream connection lost', 'error');
            this.handleStreamError();
        });
        
        // Handle successful stream load
        this.streamImg.addEventListener('load', () => {
            if (this.isStreaming) {
                log('Stream connected successfully', 'success');
                this.setStatus('online', 'Stream Active');
                this.streamStatus.textContent = 'Online';
            }
        });
        
        // Initial health check
        this.checkBackendHealth();
        
        // Periodic health checks
        this.healthCheckInterval = setInterval(() => {
            if (!this.isStreaming) {
                this.checkBackendHealth();
            }
        }, CONFIG.HEALTH_CHECK_INTERVAL);
        
        log('Stream player initialized', 'success');
    }
    
    async checkBackendHealth() {
        this.setStatus('checking', 'Checking backend...');
        
        try {
            const response = await fetch(`${CONFIG.API_URL}${CONFIG.HEALTH_ENDPOINT}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const data = await response.json();
                log(`Backend healthy: ${JSON.stringify(data)}`, 'success');
                this.setStatus('online', 'Backend Online - Ready to Stream');
                this.startBtn.disabled = false;
                return true;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            log(`Backend unavailable: ${error.message}`, 'error');
            this.setStatus('offline', 'Backend Offline - Check if server is running');
            this.startBtn.disabled = true;
            return false;
        }
    }
    
    startStream() {
        log('Starting stream...', 'info');
        
        // Build stream URL with cache-busting
        this.streamUrl = `${CONFIG.API_URL}${CONFIG.STREAM_ENDPOINT}?t=${Date.now()}`;
        
        log(`Stream URL: ${this.streamUrl}`, 'debug');
        
        // Show loading state
        this.setStatus('checking', 'Connecting to stream...');
        this.startBtn.disabled = true;
        
        // Set image source (this will trigger the MJPEG stream)
        this.streamImg.src = this.streamUrl;
        this.streamImg.style.display = 'block';
        
        this.isStreaming = true;
        
        // Update UI
        this.startBtn.style.display = 'none';
        this.stopBtn.style.display = 'inline-block';
        
        log('Stream started', 'success');
    }
    
    stopStream() {
        log('Stopping stream...', 'info');
        
        // Stop the stream by clearing the src
        this.streamImg.src = '';
        this.streamImg.style.display = 'none';
        
        this.isStreaming = false;
        
        // Update UI
        this.setStatus('offline', 'Stream Stopped');
        this.streamStatus.textContent = 'Offline';
        this.stopBtn.style.display = 'none';
        this.startBtn.style.display = 'inline-block';
        this.startBtn.disabled = false;
        
        // Do a health check
        this.checkBackendHealth();
        
        log('Stream stopped', 'success');
    }
    
    handleStreamError() {
        if (!this.isStreaming) return;
        
        log('Attempting to reconnect...', 'warning');
        this.setStatus('checking', 'Connection lost - Reconnecting...');
        
        // Try to reconnect after a delay
        setTimeout(() => {
            if (this.isStreaming) {
                log('Reconnecting to stream...', 'info');
                this.streamImg.src = `${CONFIG.API_URL}${CONFIG.STREAM_ENDPOINT}?t=${Date.now()}`;
            }
        }, CONFIG.RECONNECT_INTERVAL);
    }
    
    toggleFullscreen() {
        const wrapper = this.streamImg.parentElement;
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (wrapper.requestFullscreen) {
                wrapper.requestFullscreen();
            } else if (wrapper.webkitRequestFullscreen) {
                wrapper.webkitRequestFullscreen();
            } else if (wrapper.msRequestFullscreen) {
                wrapper.msRequestFullscreen();
            }
            log('Entered fullscreen mode', 'info');
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            log('Exited fullscreen mode', 'info');
        }
    }
    
    setStatus(type, message) {
        this.statusElement.className = `status ${type}`;
        this.statusText.textContent = message;
    }
    
    destroy() {
        // Cleanup
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.stopStream();
        log('Stream player destroyed', 'info');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    log('DOM loaded, starting application...', 'info');
    window.streamPlayer = new StreamPlayer();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.streamPlayer) {
        window.streamPlayer.destroy();
    }
});
