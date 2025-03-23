import { Injectable, Logger } from '@nestjs/common';
import { Workflow } from './entities/workflow.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
} from '../../../../libs/workflows/src';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly buildingRepository: Repository<Workflow>,
  ) {}
  async create(createWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.buildingRepository.create(createWorkflowDto);
    const newWorkflow = await this.buildingRepository.save(workflow);
    this.logger.log(
      `Created workflow with id ${newWorkflow.id} for the building ${newWorkflow.buildingId}`,
    );
    return newWorkflow;
  }

  async findAll(): Promise<Workflow[]> {
    return await this.buildingRepository.find();
  }

  async findOne(id: number): Promise<Workflow> {
    const workflow = await this.buildingRepository.findOne({ where: { id } });
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    return workflow;
  }

  async update(
    id: number,
    updateWorkflowDto: UpdateWorkflowDto,
  ): Promise<Workflow> {
    const workflow = await this.buildingRepository.preload({
      id,
      ...updateWorkflowDto,
    });
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    return this.buildingRepository.save(workflow);
  }

  async remove(id: number): Promise<Workflow> {
    const workflow = await this.buildingRepository.findOne({ where: { id } });
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    await this.buildingRepository.remove(workflow);
    return workflow;
  }
}
