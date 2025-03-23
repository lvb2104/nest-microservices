import { Module } from '@nestjs/common';
import { WorkflowsServiceController } from './workflows-service.controller';
import { WorkflowsServiceService } from './workflows-service.service';
import { WorkflowsModule } from './workflows/workflows.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    WorkflowsModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'postgres',
          host: process.env.POSTGRES_HOST_WORKFLOWS,
          port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB_WORKFLOWS,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    HealthModule,
  ],
  controllers: [WorkflowsServiceController],
  providers: [WorkflowsServiceService],
})
export class WorkflowsServiceModule {}
