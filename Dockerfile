# Base image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DISPLAY=:99

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    gcc \
    g++ \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Add Google Chrome's official GPG key
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/trusted.gpg.d/google-linux-signing-key.gpg

# Set up the stable repository
RUN echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Install Google Chrome
RUN apt-get update && apt-get install -y google-chrome-stable && rm -rf /var/lib/apt/lists/*

# Install ChromeDriver with a specific version
RUN wget --tries=3 --timeout=10 "https://chromedriver.storage.googleapis.com/114.0.5735.90/chromedriver_linux64.zip" \
    && unzip chromedriver_linux64.zip \
    && mv chromedriver /usr/local/bin/ \
    && chmod +x /usr/local/bin/chromedriver \
    && rm chromedriver_linux64.zip

# Rest of the Dockerfile remains the same...
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --upgrade yt-dlp flask
COPY . .

# Copy the valid cookies.txt file into the Docker image
COPY scripts/cookies.txt /app/src/scripts/cookies.txt
RUN chmod 600 /app/src/scripts/cookies.txt

RUN useradd -m appuser \
    && chown -R appuser:appuser /app
USER appuser
VOLUME /app/cookies
CMD ["python3", "app.py"]