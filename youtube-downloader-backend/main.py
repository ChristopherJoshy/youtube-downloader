from fastapi import FastAPI, HTTPException
from pytube import YouTube
from fastapi.responses import FileResponse
import os
import re
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOAD_DIR = "downloads"
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

def sanitize_filename(title: str) -> str:
    """Sanitize the filename to avoid issues with special characters."""
    return re.sub(r'[<>:"/\\|?*]', '_', title)

@app.get("/video_info/")
def get_video_info(url: str):
    try:
        yt = YouTube(url)
        video_info = {
            "title": yt.title,
            "thumbnail_url": yt.thumbnail_url,
            "resolutions": [stream.resolution for stream in yt.streams.filter(progressive=True, file_extension='mp4')],
        }
        if not video_info["resolutions"]:
            raise HTTPException(status_code=400, detail="No progressive streams available")
        return video_info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/download/")
def download_video(url: str, resolution: str):
    try:
        yt = YouTube(url)
        stream = yt.streams.filter(res=resolution, progressive=True, file_extension='mp4').first()
        if not stream:
            raise HTTPException(status_code=400, detail="Resolution not available")
        
        # Sanitize filename
        sanitized_title = sanitize_filename(yt.title)
        file_path = os.path.join(DOWNLOAD_DIR, f"{sanitized_title}.mp4")
        stream.download(output_path=DOWNLOAD_DIR, filename=f"{sanitized_title}.mp4")

        return FileResponse(file_path, media_type="video/mp4", filename=f"{sanitized_title}.mp4")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/clean/")
def clean_up():
    try:
        for file in os.listdir(DOWNLOAD_DIR):
            if file.endswith(".mp4"):
                os.remove(os.path.join(DOWNLOAD_DIR, file))
        return {"message": "Temporary files cleaned."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error while cleaning up files")

@app.get("/")
def read_root():
    return {"message": "Welcome to YouTube Downloader API"}
