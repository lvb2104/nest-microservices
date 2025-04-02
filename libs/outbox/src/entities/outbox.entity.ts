import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// example:
// id = 1
// target = 'workflows-service
// type = 'workflows.created'
// payload = { workflowId: 1, name: 'workflow1' }
// createdAt = 2023-10-01T00:00:00.000Z

@Entity()
export class Outbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // used to identify the event type, e.g. 'workflows.create'

  @Column({ type: 'json' })
  payload: Record<string, any>; // payload = { name: 'my-workflow', buildingId: 1 }

  @Column()
  target: string; // used to identify the target service, e.g. 'workflows-service'

  @CreateDateColumn()
  createdAt: Date;
}
