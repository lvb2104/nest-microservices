import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Outbox } from './entities/outbox.entity';
import { Repository } from 'typeorm';
import { ClientProxy, RmqRecord } from '@nestjs/microservices';
import { OutboxService } from './outbox.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { WORKFLOWS_SERVICE } from './constants';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly outboxService: OutboxService,
    @Inject(WORKFLOWS_SERVICE)
    private readonly workflowsService: ClientProxy,
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  /**
   * This method will be executed every 10 seconds to process unprocessed outbox messages.
   * Production-ready applications should use a more reasonable interval.
   * Also, we would rather use "@nestjs/bull" or "bullmq" for better performance and reliability.
   * because it provides more sophisticated features like locking, retries, and delayed jobs.
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutboxMessages() {
    this.logger.log('Processing outbox messages...');
    const messages = await this.outboxService.getUnprocessedMessages({
      target: WORKFLOWS_SERVICE.description || 'workflows-service',
      take: 100,
    });
    await Promise.all(
      messages.map(async (outbox) => {
        await this.dispatchWorkflowEvent(outbox);
        await this.outboxRepository.delete(outbox.id);
      }),
    );
  }

  async dispatchWorkflowEvent(outbox: Outbox) {
    const rmqRecord = new RmqRecord(outbox.payload, {
      messageId: `${outbox.id}`,
    });
    await lastValueFrom(this.workflowsService.emit(outbox.type, rmqRecord));
  }
}
