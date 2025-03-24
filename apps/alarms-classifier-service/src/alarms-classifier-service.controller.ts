import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AlarmsClassifierServiceController {
  private readonly logger = new Logger(AlarmsClassifierServiceController.name);
  // In the real world, this would be a more complex classification algorithm using ML/AI algorithms.
  // This service would use a pre-trained model to classify alarms.

  @MessagePattern({ cmd: 'alarm.classify' })
  classifyAlarm(@Payload() data: unknown) {
    this.logger.debug(`Received message: ${JSON.stringify(data)}`);

    return {
      category: ['critical', 'non-critical', 'invalid'][
        Math.floor(Math.random() * 3)
      ],
    };
  }
}
