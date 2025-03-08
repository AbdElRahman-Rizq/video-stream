import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class YoutubeService {
    async getVideoStreams(videoId: string) {
        if (!videoId) {
            throw new HttpException('Invalid YouTube video ID', HttpStatus.BAD_REQUEST);
        }

        try {
            const scriptPath = path.join(__dirname, '..','..','..', 'scripts', 'fetch_streams.py');
            const { stdout, stderr } = await execAsync(`python ${scriptPath} ${videoId}`);
            // Check for errors
            if (stderr) {
                console.error('Python Script Error:', stderr);
                throw new HttpException('Failed to fetch video streams.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
            
            // Parse the JSON output from the Python script
            const formats = JSON.parse(stdout);

            if (formats.length === 0) {
                throw new HttpException('No valid video formats found.', HttpStatus.NOT_FOUND);
            }

            return formats;
        } catch (error) {
            console.error('YouTube Fetch Error:', error);
            throw new HttpException(
                'Could not extract video streams. Please try again later.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}