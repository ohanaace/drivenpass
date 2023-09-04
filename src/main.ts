import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Drivenpass - Rest API')
    .setDescription('Drivenpass API description')
    .setVersion('1.0')
    .addTag('drivenpass')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document)
  const PORT = process.env.PORT || 3000
  await app.listen(PORT, () => {
    console.log(`Running on ${PORT}`)
  });
}
bootstrap();
