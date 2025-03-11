import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from './video.schema';

const execAsync = promisify(exec);

@Injectable()
export class YoutubeService {
    constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {}

    async getVideoStreams(videoId: string) {
        try {
            if (!videoId) {
                throw new HttpException('Invalid YouTube video ID', HttpStatus.BAD_REQUEST);
            }
    
            // Check if video streams are already cached
            const existingVideo = await this.videoModel.findOne({ videoId });
            if (existingVideo) {
                return existingVideo.streams;
            }
    
            // Construct script path and cookies path
            const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'fetch_streams.py');
            const cookiesPath = path.join(__dirname, '..', '..', 'cookies.txt');
    
            // Execute Python script with cookies
            const command = `python ${scriptPath} ${videoId} --cookies ${cookiesPath}`;
            const { stdout, stderr } = await execAsync(command);
    
            // Handle script errors
            if (stderr) {
                console.error('Python Script Error:', stderr);
                throw new HttpException(`Failed to fetch video streams: ${stderr.trim()}`, HttpStatus.INTERNAL_SERVER_ERROR);
            }
    
            let formats;
            try {
                formats = JSON.parse(stdout);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw new HttpException('Invalid response format from script.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
    
            if (!Array.isArray(formats) || formats.length === 0) {
                throw new HttpException('No valid video formats found.', HttpStatus.NOT_FOUND);
            }
    
            // Save to database
            const newVideo = new this.videoModel({ videoId, streams: formats });
            await newVideo.save();
    
            return formats;
        } catch (error) {
            console.error('YouTube Fetch Error:', error);
    
            if (error instanceof HttpException) {
                throw error; // Preserve HTTP status codes for known errors
            }
    
            throw new HttpException(
                error.message || 'Could not extract video streams. Please try again later.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
}
