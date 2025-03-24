import { NestFactory } from '@nestjs/core';
import { AlarmsClassifierServiceModule } from './alarms-classifier-service.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AlarmsClassifierServiceModule);
  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: process.env.NATS_URL,
        queue: 'alarms-classifier-service',
      },
    },
    {
      inheritAppConfig: true,
    },
  );
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3000);
}
bootstrap()
  .then(() => {
    console.log(
      `Alarms Classifier Service is running on: ${process.env.port ?? 3000}`,
    );
  })
  .catch((err) => {
    console.error('Error starting Alarms Classifier Service:', err);
    process.exit(1);
  });
