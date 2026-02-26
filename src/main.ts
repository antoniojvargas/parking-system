import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activar validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina campos que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían campos de más
      transform: true, // Transforma el payload al tipo del DTO
    }),
  );

  // --- CONFIGURACIÓN SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Smart Parking API')
    .setDescription(
      'Sistema de gestión de entradas, salidas y costos de parqueo',
    )
    .setVersion('1.0')
    .addTag('vehicles')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // La URL será http://localhost:3000/api
  // -----------------------------

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
