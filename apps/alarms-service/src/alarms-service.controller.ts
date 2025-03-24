import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AlarmsServiceController {
  private readonly logger = new Logger(AlarmsServiceController.name);

  @EventPattern('alarm.created')
  create(@Payload() data: unknown) {
    this.logger.debug(`Alarm created event received: ${JSON.stringify(data)}`);
  }
}
