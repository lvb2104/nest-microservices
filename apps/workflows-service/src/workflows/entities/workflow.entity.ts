import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // because we can't use many-to-one relations in the workflows service
  // we need to store the buildingId of nest-micro entity in the workflow entity
  @Column()
  buildingId: number;
}
