import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outbox } from './entities/outbox.entity';

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  async getUnprocessedMessages(options: {
    // used to identify the target service, e.g. 'workflows-service'
    target: string;
    take: number;
  }): Promise<Outbox[]> {
    return this.outboxRepository.find({
      where: {
        target: options.target,
      },
      order: {
        createdAt: 'ASC',
      },
      take: options.take,
    });
  }
}
