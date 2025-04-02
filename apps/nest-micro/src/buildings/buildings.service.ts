import { Inject, Injectable } from '@nestjs/common';
import { Building } from './entities/building.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { WORKFLOWS_SERVICE } from '../constants';
import { lastValueFrom } from 'rxjs';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { CreateBuildingDto } from './dto/create-building.dto';
import { CreateWorkflowDto } from '../../../../libs/workflows/src';
import { Outbox } from '../../../../libs/outbox/src';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,

    @Inject(WORKFLOWS_SERVICE)
    private readonly natsClient: ClientProxy,

    private readonly dataSource: DataSource,
  ) {}
  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const buildingRepository = queryRunner.manager.getRepository(Building);
    const outboxRepository = queryRunner.manager.getRepository(Outbox);
    try {
      const building = buildingRepository.create(createBuildingDto);
      const newBuilding = await buildingRepository.save(building);

      // insert new outbox to outbox table instead of sending the message directly to the queue of the workflows service
      await outboxRepository.save({
        type: 'workflows.create',
        payload: {
          name: 'my-workflow',
          buildingId: building.id,
        },
        target: WORKFLOWS_SERVICE.description,
      });

      await queryRunner.commitTransaction();
      return newBuilding;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Building[]> {
    return await this.buildingRepository.find();
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.buildingRepository.findOne({ where: { id } });
    if (!building) {
      throw new Error('Building not found');
    }
    return building;
  }

  async update(
    id: number,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.buildingRepository.preload({
      id,
      ...updateBuildingDto,
    });
    if (!building) {
      throw new Error('Building not found');
    }
    return this.buildingRepository.save(building);
  }

  async remove(id: number): Promise<Building> {
    const building = await this.buildingRepository.findOne({ where: { id } });
    if (!building) {
      throw new Error('Building not found');
    }
    await this.buildingRepository.remove(building);
    return building;
  }

  async createWorkflow(buildingId: number) {
    const pattern: { cmd: string } = { cmd: 'workflows.create' };
    const payload: CreateWorkflowDto = { name: 'New Workflow', buildingId };
    const newWorkflow = await lastValueFrom(
      this.natsClient.send<{ cmd: string }, CreateWorkflowDto>(
        pattern,
        payload,
      ),
    );
    console.log({ newWorkflow });
    return newWorkflow;
  }
}
