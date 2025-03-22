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
        console.log(
          'POSTGRES_HOST_WORKFLOWS:',
          process.env.POSTGRES_HOST_WORKFLOWS,
        );
        console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
        console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
        console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
        console.log(
          'POSTGRES_DB_WORKFLOWS:',
          process.env.POSTGRES_DB_WORKFLOWS,
        );
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
