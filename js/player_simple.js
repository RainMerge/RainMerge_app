// Simple MJPEG Stream Player
// Works with <img> tag - most reliable method!

class SimpleStreamPlayer {
    constructor() {
        this.streamImg = document.getElementById('stream');
        this.statusElement = document.getElementById('status');
        this.statusText = document.getElementById('status-text');
        this.streamStatus = document.getElementById('stream-status');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        
        this.streamUrl = `${CONFIG.BACKEND_URL}${CONFIG.STREAM_ENDPOINT}`;
        this.isStreaming = false;
        this.streamCheckInterval = null;
        
        this.init();
    }
    
    init() {
        console.log('=== RainMerge Simple Stream Player ===');
        console.log('Stream URL:', this.streamUrl);
        
        // Button listeners
        this.startBtn.addEventListener('click', () => this.startStream());
        this.stopBtn.addEventListener('click', () => this.stopStream());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Image listeners
        this.streamImg.addEventListener('load', () => this.onStreamLoad());
        this.streamImg.addEventListener('error', () => this.onStreamError());
        
        // Check backend
        this.checkHealth();
    }
    
    async checkHealth() {
        try {
            const healthUrl = `${CONFIG.BACKEND_URL}${CONFIG.HEALTH_ENDPOINT}`;
            console.log('Checking backend:', healthUrl);
            
            const response = await fetch(healthUrl, {
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Backend ready:', data);
                this.updateStatus('Backend ready - Click Start to stream', false);
            } else {
                this.updateStatus('Backend offline', false);
            }
        } catch (error) {
            console.error('Health check failed:', error);
            this.updateStatus('Cannot reach backend', false);
        }
    }
    
    startStream() {
        if (this.isStreaming) return;
        
        console.log('Starting MJPEG stream...');
        this.isStreaming = true;
        
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const streamUrlWithTimestamp = `${this.streamUrl}?t=${timestamp}`;
        
        console.log('Loading stream from:', streamUrlWithTimestamp);
        
        // Simply set img src to stream URL!
        this.streamImg.src = streamUrlWithTimestamp;
        this.streamImg.style.display = 'block';
        
        this.updateStatus('Connecting...', false);
        this.streamStatus.textContent = 'Loading...';
        this.showStopButton();
        
        // Check if stream is working after 2 seconds
        setTimeout(() => {
            if (this.isStreaming && this.streamImg.naturalWidth > 0) {
                console.log('Stream connected! Image dimensions:', 
                    this.streamImg.naturalWidth, 'x', this.streamImg.naturalHeight);
                this.onStreamLoad();
            } else if (this.isStreaming) {
                console.log('Waiting for stream...');
                // Give it more time for slower connections
                setTimeout(() => {
                    if (this.isStreaming && this.streamImg.naturalWidth > 0) {
                        this.onStreamLoad();
                    }
                }, 3000);
            }
        }, 2000);
        
        // Monitor stream health
        this.startStreamMonitoring();
    }
    
    startStreamMonitoring() {
        // Check stream every 5 seconds
        this.streamCheckInterval = setInterval(() => {
            if (this.isStreaming && this.streamImg.naturalWidth > 0) {
                // Stream is still alive
                if (!this.statusElement.classList.contains('online')) {
                    this.onStreamLoad();
                }
            } else if (this.isStreaming) {
                console.warn('Stream appears to have stopped');
            }
        }, 5000);
    }
    
    stopStream() {
        console.log('Stopping stream');
        
        // Clear monitoring
        if (this.streamCheckInterval) {
            clearInterval(this.streamCheckInterval);
            this.streamCheckInterval = null;
        }
        
        // Clear img src to stop stream
        this.streamImg.src = '';
        this.streamImg.style.display = 'none';
        
        this.isStreaming = false;
        this.updateStatus('Stream stopped', false);
        this.streamStatus.textContent = 'Offline';
        this.showStartButton();
    }
    
    onStreamLoad() {
        console.log('Stream is LIVE!');
        this.updateStatus('🔴 Live', true);
        this.streamStatus.textContent = 'Live';
    }
    
    onStreamError() {
        console.error('Stream error');
        
        if (this.isStreaming) {
            this.updateStatus('Stream error - Retrying...', false);
            this.streamStatus.textContent = 'Error';
            
            // Auto-retry after 3 seconds
            setTimeout(() => {
                if (this.isStreaming) {
                    console.log('Retrying stream...');
                    const timestamp = new Date().getTime();
                    this.streamImg.src = `${this.streamUrl}?t=${timestamp}`;
                }
            }, 3000);
        }
    }
    
    showStartButton() {
        this.startBtn.style.display = 'inline-block';
        this.stopBtn.style.display = 'none';
    }
    
    showStopButton() {
        this.startBtn.style.display = 'none';
        this.stopBtn.style.display = 'inline-block';
    }
    
    updateStatus(text, isLive) {
        this.statusText.textContent = text;
        this.statusElement.className = isLive ? 'status online' : 'status offline';
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.streamImg.requestFullscreen().catch(err => {
                console.error('Fullscreen failed:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Backend URL:', CONFIG.BACKEND_URL);
    new SimpleStreamPlayer();
});
