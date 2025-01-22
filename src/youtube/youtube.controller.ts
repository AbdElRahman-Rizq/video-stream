import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Query,
  Res,
  HttpException,
  HttpStatus 
} from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { EncryptionService } from '../utils/encryption.service';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('youtube')
export class YoutubeController {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly encryptionService: EncryptionService
  ) {}

  @Post('download')
  async downloadVideoQualities(@Body('url') url: string) {
    try {
      const video = await this.youtubeService.downloadVideoQualities(url);
      const qualities = JSON.parse(video.qualities as string);
      
      // Return encrypted paths
      const encryptedQualities = qualities.map(q => ({
        quality: q.quality,
        pathToken: this.encryptionService.encrypt(q.path)
      }));

      return {
        message: 'Video downloaded successfully',
        videoId: video.id,
        availableQualities: encryptedQualities
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to download video',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('download/:videoId/:quality')
  async downloadVideoByPath(
    @Param('videoId') videoId: string,
    @Param('quality') quality: number,
    @Query('token') token: string,
    @Res() res: Response
  ) {
    try {
      if (!token) {
        throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
      }

      const filePath = await this.youtubeService.downloadSpecificVideo(videoId, quality);
      
      // Verify the token matches the encrypted file path
      const encryptedPath = this.encryptionService.encrypt(filePath);
      if (token !== encryptedPath) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      res.download(filePath);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get video',
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get('download')
  async downloadVideoByQuery(
    @Query('videoId') videoId: string,
    @Query('quality') quality: string,
    @Query('token') token: string,
    @Res() res: Response
  ) {
    if (!videoId || !quality) {
      throw new HttpException(
        'VideoId and quality are required query parameters',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!token) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const filePath = await this.youtubeService.downloadSpecificVideo(
        videoId, 
        parseInt(quality, 10)
      );

      // Verify the token matches the encrypted file path
      const encryptedPath = this.encryptionService.encrypt(filePath);
      if (token !== encryptedPath) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      res.download(filePath);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get video',
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get('stream')
  async streamVideo(@Query('token') token: string, @Res() res: Response) {
    try {
      if (!token) {
        throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
      }

      try {
        // Decrypt the token to get the file path
        const filePath = this.encryptionService.decrypt(token);
        
        // Verify file exists
        if (!fs.existsSync(filePath)) {
          throw new HttpException('Video file not found', HttpStatus.NOT_FOUND);
        }

        res.download(filePath);
      } catch (decryptError) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to stream video',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('tokens/:videoId')
  async getVideoTokens(@Param('videoId') videoId: string) {
    try {
      const video = await this.youtubeService.getVideoQualities(videoId);
      const qualities = JSON.parse(video.qualities as string);
      
      // Generate encrypted tokens for each quality
      const qualitiesWithTokens = qualities.map(q => ({
        quality: q.quality,
        pathToken: this.encryptionService.encrypt(q.path)
      }));

      return {
        videoId: video.id,
        title: video.title,
        availableQualities: qualitiesWithTokens
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get video tokens',
        HttpStatus.NOT_FOUND
      );
    }
  }
}