import { NestFactory } from '@nestjs/core';
import { WorkflowsServiceModule } from './workflows-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(WorkflowsServiceModule);
  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<MicroserviceOptions>(
    {
      // transport: Transport.NATS,
      transport: Transport.RMQ,
      options: {
        // servers: process.env.NATS_URL,
        urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
        queue: 'workflows-service',
      },
    },
    {
      inheritAppConfig: true,
    },
  );
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log(
      `Workflows service is running on port ${process.env.PORT ?? 3000}`,
    );
  })
  .catch((err) => {
    console.error('Error starting the application:', err);
  });
