import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outbox } from './entities/outbox.entity';
import { OutboxService } from './outbox.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OutboxProcessor } from './outbox.processor';
import { WORKFLOWS_SERVICE } from './constants';
import { OutboxEntitySubscriber } from './outbox.entity-subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outbox]),
    // this service is used as the second client for the outbox module, the first one is in the nest-micro service module
    ClientsModule.register([
      {
        name: WORKFLOWS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'workflows-service',
        },
      },
    ]),
  ],
  providers: [OutboxService, OutboxProcessor, OutboxEntitySubscriber],
})
export class OutboxModule {}
