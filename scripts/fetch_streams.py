import yt_dlp
import sys
import json
import os

def fetch_streams(video_id):
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        cookies_path = os.path.join(script_dir, 'cookies.txt')

        # Add cookie file existence check
        if not os.path.exists(cookies_path):
            raise FileNotFoundError(f"Cookies file not found at {cookies_path}")

        ydl_opts = {
            'format': 'best[height<=720]',
            'quiet': True,
            'no_warnings': True,
            'cookiefile': cookies_path,
            # Add error handling for cookie-related issues
            'ignoreerrors': False,  # Ensure we catch all errors
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Verify cookies first
            ydl._setup_cookies()
            
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            
            # Improved format filtering
            formats = []
            for stream in info.get('formats', []):
                if stream.get('resolution') and stream.get('filesize'):
                    formats.append({
                        "quality": stream['resolution'],
                        "url": stream['url'],
                        "format_note": stream.get('format_note'),
                        "ext": stream.get('ext')
                    })
            return formats
            
    except yt_dlp.utils.DownloadError as e:
        print(f"YouTubeDL Error: {e}", file=sys.stderr)
        return []
    except FileNotFoundError as e:
        print(f"Configuration Error: {e}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Unexpected Error: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python fetch_streams.py <video_id>", file=sys.stderr)
        sys.exit(1)
        
    video_id = sys.argv[1]
    streams = fetch_streams(video_id)
    print(json.dumps(streams))