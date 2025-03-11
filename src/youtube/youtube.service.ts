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

            // Check if the videoId exists in the database
            const existingVideo = await this.videoModel.findOne({ videoId });
            if (existingVideo) {
                console.log("Sending streams without library");
                return existingVideo.streams; // Return the streams from the database
            }

            const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'fetch_streams.py');
            const { stdout, stderr } = await execAsync(`python ${scriptPath} ${videoId}`);
            if (stderr) {
                console.error('Python Script Error:', stderr);
                throw new HttpException('Failed to fetch video streams.', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const formats = JSON.parse(stdout);
            if (formats.length === 0) {
                throw new HttpException('No valid video formats found.', HttpStatus.NOT_FOUND);
            }

            // Save the streams to the database
            const newVideo = new this.videoModel({ videoId, streams: formats });
            await newVideo.save();

            return formats;
        } catch (error) {
            console.error('YouTube Fetch Error:', error);
            throw new HttpException(
                error.message || 'Could not extract video streams. Please try again later.',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}