import yt_dlp
import sys
import json

def get_video_info(url):
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                'id': info['id'],
                'title': info['title'],
                'thumbnail': info.get('thumbnail', ''),
                'formats': info['formats']
            }
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'URL argument is required'}))
        sys.exit(1)
        
    url = sys.argv[1]
    result = get_video_info(url)
    print(json.dumps(result), end='', flush=True)
