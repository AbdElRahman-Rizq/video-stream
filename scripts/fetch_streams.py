import yt_dlp
import sys
import json

def fetch_streams(video_id):
    try:
        ydl_opts = {
            'format': 'best[height<=720]',
            'quiet': True,
            'no_warnings': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            formats = [
                {
                    "quality": stream.get("resolution"),
                    "url": stream.get("url"),
                }
                for stream in info['formats']
                if stream.get("resolution") and stream.get("filesize")
            ]
        return formats
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    video_id = sys.argv[1]
    streams = fetch_streams(video_id)
    print(json.dumps(streams))