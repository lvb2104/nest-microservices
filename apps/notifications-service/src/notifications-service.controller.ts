/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, RmqContext } from '@nestjs/microservices';

@Controller()
export class NotificationsServiceController {
  private readonly logger = new Logger(NotificationsServiceController.name);

  // In the real-world application, this would be responsible for sending notifications for notifying users or other services.
  // For example, it could send an email, push notification, or SMS.
  @EventPattern('notification.send')
  sendNotification(data: any, @Ctx() context: RmqContext) {
    this.logger.debug('Received notification event', data);
    const channel: any = context.getChannelRef();
    const originalMessage: Record<string, any> = context.getMessage();

    // check if message is already redelivered to avoid entering infinite loop
    if (originalMessage.fields?.redelivered) {
      // if so acknowledge the message
      this.logger.verbose('Message already redelivered, ignoring');
      return channel.ack(originalMessage);
    }

    // otherwise, reject the message and requeue it - just for sake of this demo
    channel.nack(originalMessage);
  }
}
