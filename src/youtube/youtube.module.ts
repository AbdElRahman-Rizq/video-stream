import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { EncryptionService } from '../utils/encryption.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [YoutubeController],
  providers: [YoutubeService, EncryptionService, PrismaService],
})
export class YouTubeModule {}