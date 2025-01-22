import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  await app.listen(3005);
}
bootstrap();
