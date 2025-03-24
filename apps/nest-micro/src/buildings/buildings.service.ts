import { Inject, Injectable } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from './entities/building.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from '../../../workflows-service/src/workflows/entities/workflow.entity';
import { ClientProxy } from '@nestjs/microservices';
import { WORKFLOWS_SERVICE } from '../constants';
import { CreateWorkflowDto } from '../../../../libs/workflows/src';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,

    @Inject(WORKFLOWS_SERVICE)
    private readonly natsClient: ClientProxy,
  ) {}
  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const building = this.buildingRepository.create(createBuildingDto);
    const newBuilding = await this.buildingRepository.save(building);
    await this.createWorkflow(newBuilding.id);
    return newBuilding;
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
