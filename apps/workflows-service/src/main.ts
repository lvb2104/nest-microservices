import { NestFactory } from '@nestjs/core';
import { WorkflowsServiceModule } from './workflows-service.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkflowsServiceModule);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((error) => {
  console.log('Error starting the application:', error);
  process.exit(1);
});
