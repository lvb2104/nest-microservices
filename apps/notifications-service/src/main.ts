import { NestFactory } from '@nestjs/core';
import { NotificationsServiceModule } from './notifications-service.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsServiceModule);
  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
        queue: 'notifications-service',
        noAck: false, // redeliver message if not acknowledged when the service is restarted
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
      `Notifications service is running on port ${process.env.port ?? 3000}`,
    );
  })
  .catch((err) => {
    console.error('Error starting the application:', err);
  });
