import yt_dlp
import os
import sys
import json
import glob

def download_video(url, output_path, quality):
    video_id_template = '%(id)s'
    ydl_opts = {
        'format': f'best[height<={quality}]/bestvideo[height<={quality}]+bestaudio',
        'outtmpl': os.path.join(output_path, f'{video_id_template}_{quality}p.%(ext)s'),
        'quiet': True,
        'no_warnings': True,
        'noprogress': True,
        'progress_hooks': [],
        'extract_flat': False,
        'ignoreerrors': True,
        'no_color': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            if info and 'id' in info:
                video_id = info['id']
                # Find the actual downloaded file using glob
                pattern = os.path.join(output_path, f'{video_id}_{quality}p.*')
                downloaded_files = glob.glob(pattern)
                
                if downloaded_files:
                    # Get the most recently modified file if multiple exist
                    actual_path = max(downloaded_files, key=os.path.getmtime)
                    return {
                        'id': video_id,
                        'path': actual_path,
                        'quality': quality
                    }
            return None
    except Exception as e:
        print(f"Error downloading quality {quality}p: {str(e)}", file=sys.stderr)
        return None

if __name__ == '__main__':
    try:
        if len(sys.argv) != 4:
            print("Usage: script.py <url> <output_path> <qualities>", file=sys.stderr)
            sys.exit(1)

        url = sys.argv[1]
        output_path = sys.argv[2]
        qualities = [int(q) for q in sys.argv[3].split(',')]
        
        # Create output directory if it doesn't exist
        os.makedirs(output_path, exist_ok=True)
        
        # Download for each quality
        downloaded_files = []
        video_id = None
        
        for quality in qualities:
            result = download_video(url, output_path, quality)
            if result:
                video_id = result['id']
                downloaded_files.append({
                    'quality': result['quality'],
                    'path': result['path']
                })
        
        if video_id and downloaded_files:
            # Output JSON with video ID and file paths
            output = {
                'id': video_id,
                'files': downloaded_files
            }
            print(json.dumps(output), end='', flush=True)
        else:
            print("Failed to download video", file=sys.stderr)
            sys.exit(1)
            
    except Exception as e:
        print(f"Script error: {str(e)}", file=sys.stderr)
        sys.exit(1)