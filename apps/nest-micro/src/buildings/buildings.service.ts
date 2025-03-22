import { Injectable } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from './entities/building.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from '../../../workflows-service/src/workflows/entities/workflow.entity';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
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
    console.log(
      JSON.stringify({ name: 'My Workflow', buildingId } as CreateBuildingDto),
    );
    const response = await fetch('http://workflows-service:3001/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Workflow', buildingId }),
    });
    const newWorkflow = (await response.json()) as Workflow;
    console.log({ newWorkflow });
    return newWorkflow;
  }
}
