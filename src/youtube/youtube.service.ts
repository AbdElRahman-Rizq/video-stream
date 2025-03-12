import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from './video.schema';
import axios from 'axios'; // Use Axios to call the Python API

@Injectable()
export class YoutubeService {
    constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {}

    async getVideoStreams(videoId: string) {
        try {
            if (!videoId) {
                throw new HttpException('Invalid YouTube video ID provided.', HttpStatus.BAD_REQUEST);
            }

            // Check if the videoId exists in the database (caching)
            const existingVideo = await this.videoModel.findOne({ videoId });
            if (existingVideo) {
                console.log("Sending streams from cache");
                return existingVideo.streams; 
            }

            console.log(`Fetching video streams for ${videoId}...`);

            // Call the Python service running inside Docker
            const pythonServiceUrl = `${process.env.PYTHON_SERVICE_URL}/get_video?video_id=${videoId}`;
            const { data } = await axios.get(pythonServiceUrl);

            if (data.error) {
                throw new HttpException(`Python Service Error: ${data.error}`, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Save the streams in MongoDB for caching
            const newVideo = new this.videoModel({ videoId, streams: data });
            await newVideo.save();

            return data;
        } catch (error) {
            console.error('YouTube Fetch Error:', error);
            throw new HttpException(error.message || 'An internal server error occurred.', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
