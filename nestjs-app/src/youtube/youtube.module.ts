import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { EncryptionService } from '../utils/encryption.service';

import { Video, VideoSchema } from './video.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [YoutubeController],
  providers: [YoutubeService, EncryptionService],
})
export class YouTubeModule {}