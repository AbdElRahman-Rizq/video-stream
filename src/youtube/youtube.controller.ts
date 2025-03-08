import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('youtube')
export class YoutubeController {
    constructor(private readonly youtubeService: YoutubeService) {}

    @Get('video')
    async getVideoStreams(@Query('id') videoId: string) {
        console.log('Received videoId:', videoId);
        if (!videoId) {
            throw new HttpException('Invalid YouTube video ID', HttpStatus.BAD_REQUEST);
        }

        try {
            const streams = await this.youtubeService.getVideoStreams(videoId);
            return streams;
        } catch (error) {
            console.error('Error in YoutubeController:', error);
            throw new HttpException(
                error.message || 'Failed to fetch video streams.',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}