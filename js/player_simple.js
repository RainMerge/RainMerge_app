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
        
        this.startBtn.addEventListener('click', () => this.startStream());
        this.stopBtn.addEventListener('click', () => this.stopStream());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // 🎯 ADD CLICK HANDLER FOR INTERACTIVE CONTROL
        this.streamImg.addEventListener('click', (e) => this.handleStreamClick(e));
        
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
                this.updateStatus('✅ Backend ready - Click Start', false);
            } else {
                this.updateStatus('❌ Backend offline', false);
            }
        } catch (error) {
            console.error('Health check failed:', error);
            this.updateStatus('❌ Cannot reach backend', false);
        }
    }
    
    startStream() {
        if (this.isStreaming) return;
        
        console.log('🎥 Starting stream...');
        this.isStreaming = true;
        
        this.streamImg.src = this.streamUrl;
        this.streamImg.style.display = 'block';
        this.streamImg.style.cursor = 'crosshair';  // Show it's clickable
        
        this.updateStatus('🔄 Connecting...', false);
        this.streamStatus.textContent = 'Connecting...';
        this.showStopButton();
        
        // Check if loaded after 3 seconds
        setTimeout(() => {
            if (this.isStreaming) {
                const width = this.streamImg.naturalWidth || this.streamImg.width;
                const height = this.streamImg.naturalHeight || this.streamImg.height;
                
                console.log('Stream dimensions:', width, 'x', height);
                
                if (width > 0 && height > 0) {
                    console.log('✅ Stream is LIVE!');
                    this.updateStatus('🔴 Live - Click to control!', true);
                    this.streamStatus.textContent = 'Live';
                } else {
                    console.log('⚠️ Stream not loading properly');
                    this.updateStatus('⚠️ Stream loading issue', false);
                    this.streamStatus.textContent = 'Issue';
                }
            }
        }, 3000);
    }
    
    stopStream() {
        console.log('⏹️ Stopping stream');
        
        this.streamImg.src = '';
        this.streamImg.style.display = 'none';
        
        this.isStreaming = false;
        this.updateStatus('Stream stopped', false);
        this.streamStatus.textContent = 'Offline';
        this.showStartButton();
    }
    
    // 🎯 NEW: Handle clicks on the stream
    async handleStreamClick(event) {
    if (!this.isStreaming) {
        console.log('⚠️ Stream not active, click ignored');
        return;
    }
    
    const rect = this.streamImg.getBoundingClientRect();
    
    // Calculate click position relative to the image
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Convert to percentage (0.0 to 1.0) - this is resolution-independent!
    const percentX = clickX / rect.width;
    const percentY = clickY / rect.height;
    
    // Scale to 1280x720 (what the server expects)
    const streamX = Math.floor(percentX * 1280);
    const streamY = Math.floor(percentY * 720);
    
    console.log(`🖱️ Click at display(${Math.floor(clickX)}, ${Math.floor(clickY)}) → stream(${streamX}, ${streamY}) [${(percentX*100).toFixed(1)}%, ${(percentY*100).toFixed(1)}%]`);
    
    // Show visual feedback
    this.showClickIndicator(event.clientX, event.clientY);
    
    // Send click to backend
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/control/click`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                x: streamX,
                y: streamY
            })
        });
        
        const result = await response.json();
        console.log('Click response:', result);
        
        if (result.status === 'success') {
            console.log('✅ Click registered at screen:', result.screen_coords);
        } else {
            console.error('❌ Click failed:', result.message);
        }
    } catch (error) {
        console.error('❌ Error sending click:', error);
    }
}

    // 🎯 NEW: Visual feedback for clicks
    showClickIndicator(x, y) {
        const indicator = document.createElement('div');
        indicator.style.position = 'fixed';
        indicator.style.left = x + 'px';
        indicator.style.top = y + 'px';
        indicator.style.width = '30px';
        indicator.style.height = '30px';
        indicator.style.border = '3px solid red';
        indicator.style.borderRadius = '50%';
        indicator.style.pointerEvents = 'none';
        indicator.style.transform = 'translate(-50%, -50%)';
        indicator.style.zIndex = '10000';
        indicator.style.animation = 'clickPulse 0.5s ease-out';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => indicator.remove(), 500);
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('Backend URL:', CONFIG.BACKEND_URL);
    new SimpleStreamPlayer();
});
