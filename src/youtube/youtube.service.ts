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
                throw new HttpException('Invalid YouTube video ID provided.', HttpStatus.BAD_REQUEST);
            }

            // Check if the videoId exists in the database
            const existingVideo = await this.videoModel.findOne({ videoId });
            if (existingVideo) {
                console.log("Sending streams from cache");
                return existingVideo.streams; // Return the cached streams
            }

            const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'fetch_streams.py');
            
            console.log(`Fetching video streams for ${videoId}...`);
            
            // Execute the Python script
            const { stdout, stderr } = await execAsync(`python3 ${scriptPath} ${videoId}`);

            if (stderr) {
                console.error('Python Script Error:', stderr);
                throw new HttpException(`Failed to fetch video streams from the server. ${stderr}`, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            let formats;
            try {
                formats = JSON.parse(stdout);
            } catch (jsonError) {
                console.error('JSON Parse Error:', jsonError);
                throw new HttpException('Received an invalid response from YouTube. Please check the video ID.', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            if (!formats || formats.length === 0) {
                throw new HttpException('No valid video formats found for the provided video ID.', HttpStatus.NOT_FOUND);
            }

            // Save the streams to the database for caching
            const newVideo = new this.videoModel({ videoId, streams: formats });
            await newVideo.save();

            return formats;
        } catch (error) {
            console.error('YouTube Fetch Error:', error);
            throw new HttpException(
                error.message || 'An internal server error occurred. Please try again later.',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
