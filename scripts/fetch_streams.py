import yt_dlp
import sys
import json
import os

def fetch_streams(video_id):
    try:
        # Get the directory where the script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        cookies_path = os.path.join(script_dir, 'cookies.txt')

        ydl_opts = {
            'format': 'best[height<=720]',
            'quiet': True,
            'no_warnings': True,
            'cookiefile': cookies_path,  # Use absolute path
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