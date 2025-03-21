import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MongooseModule } from '@nestjs/mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('YouTube Video Quality Fetcher')
    .setDescription('API for fetching YouTube video details and qualities')
    .setVersion('1.0')
    .addTag('youtube')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS if needed
  app.enableCors();

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/youtube'; // Update with your DB name
  console.log("Mongo URL: ",mongoUri);
  let PORT = process.env.PORT || 3008
  console.log("APP is runnig on PORT:  ",PORT);
  
  await MongooseModule.forRoot(mongoUri);
  await app.listen(PORT);
}
bootstrap();
