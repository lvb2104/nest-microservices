import { Module } from '@nestjs/common';
import { AlarmsServiceController } from './alarms-service.controller';
import { AlarmsServiceService } from './alarms-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_MESSAGE_BROKER, NOTIFICATIONS_SERVICE } from './constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_MESSAGE_BROKER,
        transport: Transport.NATS,
        options: {
          servers: process.env.NATS_URL,
        },
      },
      {
        name: NOTIFICATIONS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'notifications-service',
        },
      },
    ]),
  ],
  controllers: [AlarmsServiceController],
  providers: [AlarmsServiceService],
})
export class AlarmsServiceModule {}
