import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Outbox } from './entities/outbox.entity';
import { OutboxProcessor } from './outbox.processor';

@EventSubscriber()
export class OutboxEntitySubscriber
  implements EntitySubscriberInterface<Outbox>
{
  constructor(
    dataSource: DataSource,
    private readonly outboxProcessor: OutboxProcessor,
  ) {
    // add this class as a subscriber to the data source for listening to events
    dataSource.subscribers.push(this);
  }

  listenTo() {
    // which entity this subscriber is listening to
    return Outbox;
  }

  // this method is called when an entity is inserted into the database to achieve at least once delivery guarantee, but what happens if outbox processor can't delete the message from the outbox table?
  async afterInsert(event: InsertEvent<Outbox>) {
    await this.outboxProcessor.dispatchWorkflowEvent(event.entity);
    await event.manager.delete(Outbox, event.entity.id);
  }
}
