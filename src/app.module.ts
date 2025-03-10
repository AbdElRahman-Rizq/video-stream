import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { YouTubeModule } from './youtube/youtube.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://aarisk444:EmBBUxGThYIXAApw@cluster0.fsuix.mongodb.net/7p'),
    YouTubeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
