import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { NATS_MESSAGE_BROKER, NOTIFICATIONS_SERVICE } from './constants';
import { lastValueFrom } from 'rxjs';

@Controller()
export class AlarmsServiceController {
  private readonly logger = new Logger(AlarmsServiceController.name);

  constructor(
    @Inject(NATS_MESSAGE_BROKER)
    private readonly natsMessageBrokerClient: ClientProxy,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsServiceClient: ClientProxy,
  ) {}

  @EventPattern('alarm.created')
  async create(@Payload() data: { name: string; buildingId: number }) {
    this.logger.debug(`Alarm created event received: ${JSON.stringify(data)}`);

    const alarmClassification: { category: string } = await lastValueFrom(
      this.natsMessageBrokerClient.send({ cmd: 'alarm.classify' }, data),
    );
    this.logger.debug(
      `Alarm classification result: ${JSON.stringify(alarmClassification.category)}`,
    );

    const notify$ = this.notificationsServiceClient.emit('notification.send', {
      alarm: data,
      category: alarmClassification.category,
    });
    await lastValueFrom(notify$);
    this.logger.debug('Notification sent successfully');
  }
}
