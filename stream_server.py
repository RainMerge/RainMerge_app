
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
import subprocess
import platform

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WINDOW_TITLE = "RainMerge"  # CHANGE THIS
STREAM_QUALITY = "medium"

QUALITY_SETTINGS = {
    "low": {"resolution": "854x480", "bitrate": "500k", "fps": 15},
    "medium": {"resolution": "1280x720", "bitrate": "1500k", "fps": 30},
    "high": {"resolution": "1920x1080", "bitrate": "3000k", "fps": 30},
}

def get_capture_command():
    os_name = platform.system()
    settings = QUALITY_SETTINGS[STREAM_QUALITY]
    
    if os_name == "Windows":
        return [
            'ffmpeg',
            '-f', 'gdigrab',
            '-i', f'title={WINDOW_TITLE}',
            '-framerate', str(settings['fps']),
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-b:v', settings['bitrate'],
            '-pix_fmt', 'yuv420p',
            '-f', 'mpegts',
            'pipe:1'
        ]
    else:
        return []  # Add macOS/Linux commands if needed

@app.get("/")
def root():
    return {"status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "window": WINDOW_TITLE}

@app.get("/stream")
async def stream():
    try:
        command = get_capture_command()
        process = subprocess.Popen(command, stdout=subprocess.PIPE, bufsize=10**8)
        
        def generate():
            while True:
                chunk = process.stdout.read(8192)
                if not chunk:
                    break
                yield chunk
        
        return StreamingResponse(generate(), media_type="video/mp2t")
    except Exception as e:
        return Response(content=f"Error: {str(e)}", status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

---

## **6. Backend - requirements.txt**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
