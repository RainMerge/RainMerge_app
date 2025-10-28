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
                cache: 'no-cache'
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
    }
    
    stopStream() {
        console.log('Stopping stream');
        
        // Clear img src to stop stream
        this.streamImg.src = '';
        this.streamImg.style.display = 'none';
        
        this.isStreaming = false;
        this.updateStatus('Stream stopped', false);
        this.streamStatus.textContent = 'Offline';
        this.showStartButton();
    }
    
    onStreamLoad() {
        console.log('Stream loaded successfully!');
        this.updateStatus('🔴 Live', true);
        this.streamStatus.textContent = 'Live';
    }
    
    onStreamError() {
        console.error('Stream error');
        
        if (this.isStreaming) {
            this.updateStatus('Stream error - Check backend', false);
            this.streamStatus.textContent = 'Error';
            this.streamImg.style.display = 'none';
            
            // Auto-retry after 3 seconds
            setTimeout(() => {
                if (this.isStreaming) {
                    console.log('Retrying stream...');
                    this.startStream();
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
