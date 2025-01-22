import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../utils/encryption.service';

@Module({
  controllers: [YoutubeController],
  providers: [YoutubeService, PrismaService, EncryptionService]
})
export class YouTubeModule {}