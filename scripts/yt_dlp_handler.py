import yt_dlp
import sys
import json

def fetch_video_data(video_url):
    try:
        ydl_opts = {'quiet': True, 'no_warnings': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)

            video_data = {
                "title": info.get("title"),
                "url": video_url,
                "length": info.get("duration"),
                "views": info.get("view_count"),
                "qualities": [
                    {
                        "format_id": stream["format_id"],
                        "resolution": stream.get("resolution"),
                        "filesize": stream.get("filesize"),
                        "ext": stream.get("ext"),
                    }
                    for stream in info["formats"]
                    if stream.get("resolution") and stream.get("filesize")
                ],
            }
            return json.dumps(video_data)
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    video_url = sys.argv[1]
    print(fetch_video_data(video_url), end='')


