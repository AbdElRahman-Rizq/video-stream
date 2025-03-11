#!/bin/bash
yt-dlp --cookies-from-browser chrome --cookies /home/user/cookies.txt
echo "Cookies updated at $(date)" >> /home/user/cookies_log.txt
