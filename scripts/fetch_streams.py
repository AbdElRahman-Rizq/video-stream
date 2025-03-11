import yt_dlp
import sys
import json
import time
import random

# Path to cookies.txt (update the path as needed)
COOKIES_FILE = "cookies.txt"

def fetch_streams(video_id, max_retries=3):
    for attempt in range(max_retries):
        try:
            # Introduce a random delay (5 to 15 seconds)
            delay = random.randint(5, 15)
            print(f"Waiting {delay} seconds before fetching video {video_id}...")
            time.sleep(delay)

            ydl_opts = {
                'format': 'best[height<=720]',
                'quiet': True,
                'no_warnings': True,
                'cookies': COOKIES_FILE,  # Use cookies for authentication
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
            if "Sign in to confirm you're not a bot" in str(e):
                print("Authentication error: Please check your cookies.")
            if attempt < max_retries - 1:
                time.sleep(10)  # Wait before retrying
            else:
                return []  # Return empty list after max retries

if __name__ == "__main__":
    video_id = sys.argv[1]
    streams = fetch_streams(video_id)
    print(json.dumps(streams, indent=2))
