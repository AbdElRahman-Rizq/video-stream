import yt_dlp
import sys
import json
import time
import random

COOKIE_FILE = "/home/user/cookies.txt"  # Use the refreshed cookies file

def fetch_streams(video_id, max_retries=3):
    for attempt in range(max_retries):
        try:
            delay = random.randint(5, 15)
            print(f"Waiting {delay} seconds before fetching video {video_id}...")
            time.sleep(delay)

            ydl_opts = {
                'format': 'best[height<=720]',
                'quiet': True,
                'no_warnings': True,
                'cookies': COOKIE_FILE,  # Load refreshed cookies
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
                formats = [
                    {
                        "quality": stream.get("resolution"),
                        "url": stream.get("url"),
                    }
                    for stream in info.get('formats', [])
                    if stream.get("resolution") and stream.get("filesize")
                ]
            return formats
        except Exception as e:
            print(f"Error fetching video {video_id} (Attempt {attempt+1}/{max_retries}): {e}", file=sys.stderr)
            if attempt < max_retries - 1:
                time.sleep(10)
            else:
                return []

if __name__ == "__main__":
    video_id = sys.argv[1]
    streams = fetch_streams(video_id)
    print(json.dumps(streams, indent=2))
