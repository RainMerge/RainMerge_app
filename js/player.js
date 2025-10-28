
class StreamPlayer {
    constructor() {
        this.video = document.getElementById('stream');
        this.statusElement = document.getElementById('status');
        this.statusText = document.getElementById('status-text');
        this.reconnectBtn = document.getElementById('reconnect-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        
        this.init();
    }
    
    init() {
        this.reconnectBtn.addEventListener('click', () => this.connect());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        this.video.addEventListener('loadstart', () => this.onLoadStart());
        this.video.addEventListener('canplay', () => this.onCanPlay());
        this.video.addEventListener('error', (e) => this.onError(e));
        
        this.checkHealth();
    }
    
    async checkHealth() {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.HEALTH_ENDPOINT}`);
            if (response.ok) {
                this.connect();
            } else {
                this.updateStatus('Backend offline', false);
            }
        } catch (error) {
            this.updateStatus('Cannot reach backend', false);
            this.scheduleReconnect();
        }
    }
    
    connect() {
        if (this.isConnecting) return;
        this.isConnecting = true;
        this.updateStatus('Connecting...', false);
        
        const streamUrl = `${CONFIG.BACKEND_URL}${CONFIG.STREAM_ENDPOINT}`;
        this.video.src = streamUrl;
        this.video.load();
    }
    
    onLoadStart() {
        this.updateStatus('Loading stream...', false);
    }
    
    onCanPlay() {
        this.updateStatus('🔴 Live', true);
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.video.play().catch(err => console.error('Autoplay failed:', err));
    }
    
    onError(e) {
        this.isConnecting = false;
        this.updateStatus('Connection failed', false);
        this.scheduleReconnect();
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
            this.updateStatus('Max retries reached', false);
            return;
        }
        this.reconnectAttempts++;
        setTimeout(() => this.checkHealth(), CONFIG.RECONNECT_DELAY);
    }
    
    updateStatus(text, isOnline) {
        this.statusText.textContent = text;
        this.statusElement.className = isOnline ? 'status online' : 'status offline';
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.video.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StreamPlayer();
});
