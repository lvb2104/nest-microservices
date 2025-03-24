import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class NotificationsServiceController {
  private readonly logger = new Logger(NotificationsServiceController.name);

  // In the real-world application, this would be responsible for sending notifications for notifying users or other services.
  // For example, it could send an email, push notification, or SMS.
  @EventPattern('notification.send')
  sendNotification(data: any) {
    this.logger.debug('Received notification event', data);
  }
}
