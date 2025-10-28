// Video.js Stream Player with Better Stream Handling
class StreamPlayer {
    constructor() {
        this.statusElement = document.getElementById('status');
        this.statusText = document.getElementById('status-text');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        
        this.player = null;
        this.streamUrl = `${CONFIG.BACKEND_URL}${CONFIG.STREAM_ENDPOINT}`;
        this.isStreaming = false;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Video.js player...');
        console.log('Stream URL:', this.streamUrl);
        
        // Initialize Video.js player
        this.player = videojs('stream', {
            controls: true,
            autoplay: false,
            preload: 'none',
            fluid: true,
            html5: {
                vhs: {
                    overrideNative: true
                }
            }
        });
        
        // Button event listeners
        this.startBtn.addEventListener('click', () => this.startStream());
        this.stopBtn.addEventListener('click', () => this.stopStream());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Player events
        this.player.on('loadstart', () => {
            console.log('Stream loading started');
            this.updateStatus('Loading stream...', false);
        });
        
        this.player.on('loadedmetadata', () => {
            console.log('Metadata loaded');
        });
        
        this.player.on('canplay', () => {
            console.log('Stream can play');
            this.updateStatus('🔴 Live', true);
            this.player.play().catch(err => {
                console.error('Autoplay failed:', err);
            });
        });
        
        this.player.on('playing', () => {
            console.log('Stream is playing');
            this.updateStatus('🔴 Live', true);
        });
        
        this.player.on('error', (e) => {
            console.error('Player error:', e);
            const error = this.player.error();
            console.error('Error details:', error);
            this.updateStatus('Stream error - Click Start to retry', false);
            this.isStreaming = false;
            this.showStartButton();
        });
        
        this.player.on('waiting', () => {
            console.log('Stream buffering...');
            this.updateStatus('Buffering...', false);
        });
        
        // Check backend health
        this.checkHealth();
    }
    
    async checkHealth() {
        try {
            const healthUrl = `${CONFIG.BACKEND_URL}${CONFIG.HEALTH_ENDPOINT}`;
            console.log('Checking backend health:', healthUrl);
            
            const response = await fetch(healthUrl, { 
                mode: 'cors',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Backend health:', data);
                this.updateStatus('Backend ready - Click Start to stream', false);
            } else {
                this.updateStatus('Backend offline', false);
            }
        } catch (error) {
            console.error('Health check failed:', error);
            this.updateStatus('Cannot reach backend - Check if server is running', false);
        }
    }
    
    async startStream() {
        if (this.isStreaming) return;
        
        console.log('Starting stream from:', this.streamUrl);
        this.isStreaming = true;
        this.updateStatus('Connecting...', false);
        this.showStopButton();
        
        try {
            // Set source and load
            this.player.src({
                src: this.streamUrl,
                type: 'video/mp4'
            });
            
            this.player.load();
            this.player.play().catch(err => {
                console.error('Play failed:', err);
                this.updateStatus('Play failed - Click Stop then Start again', false);
            });
            
        } catch (error) {
            console.error('Failed to start stream:', error);
            this.updateStatus('Failed to connect', false);
            this.isStreaming = false;
            this.showStartButton();
        }
    }
    
    stopStream() {
        console.log('Stopping stream');
        this.player.pause();
        this.player.reset();
        this.isStreaming = false;
        this.updateStatus('Stream stopped', false);
        this.showStartButton();
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
        if (this.player.isFullscreen()) {
            this.player.exitFullscreen();
        } else {
            this.player.requestFullscreen();
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== RainMerge Stream Player ===');
    console.log('Backend URL:', CONFIG.BACKEND_URL);
    console.log('Initializing...');
    
    new StreamPlayer();
});
