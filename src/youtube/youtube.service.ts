import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../../prisma/prisma.service';

interface DownloadResult {
  id: string;
  files: Array<{
    quality: number;
    path: string;
  }>;
}

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly downloadPath = path.join(process.cwd(), 'downloads');

  constructor(private prisma: PrismaService) {}

  async downloadVideoQualities(url: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!fs.existsSync(this.downloadPath)) {
        fs.mkdirSync(this.downloadPath, { recursive: true });
      }

      const qualities = [244, 360, 720]; // Low, Medium, High
      const qualitiesStr = qualities.join(',');

      const pythonProcess = spawn('python', [
        path.join(process.cwd(), 'scripts', 'yt_dlp_download_handler.py'),
        url,
        this.downloadPath,
        qualitiesStr
      ]);      

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
        this.logger.error(`Download error: ${data}`);
      });

      pythonProcess.on('close', async (code) => {
        if (code === 0 && output) {
          try {
            const downloadResult: DownloadResult = JSON.parse(output);
            
            // Save to database
            const savedVideo = await this.prisma.video.create({
              data: {
                id: downloadResult.id,
                title: downloadResult.id, // You might want to get actual title from yt-dlp
                url: url,
                length: 0, // You can get this from yt-dlp if needed
                views: 0,
                qualities: JSON.stringify(downloadResult.files)
              }
            });
            resolve(savedVideo);
          } catch (dbError) {
            reject(new Error(`Database error: ${dbError.message}`));
          }
        } else {
          reject(new Error(`Download failed: ${error}`));
        }
      });
    });
  }

  async getVideoQualities(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        qualities: true
      }
    });

    if (!video) {
      throw new Error('Video not found');
    }

    return video;
  }

  async downloadSpecificVideo(videoId: string, quality: number): Promise<string> {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!video) {
      throw new Error('Video not found');
    }

    // Define available qualities
    const availableQualities = [244, 360, 720];
    
    // Validate requested quality
    if (!availableQualities.includes(Number(quality))) {
      throw new Error(`Invalid quality. Must be one of: ${availableQualities.join(', ')}`);
    }

    const qualities = JSON.parse(video.qualities as string);
    const requestedQuality = qualities.find(
      (q: { quality: number; path: string }) => q.quality === Number(quality)
    );

    if (!requestedQuality) {
      throw new Error(`Quality ${quality}p not found for this video`);
    }

    const filePath = requestedQuality.path;
    if (!fs.existsSync(filePath)) {
      throw new Error(`Video file not found at path: ${filePath}`);
    }

    return filePath;
  }
}