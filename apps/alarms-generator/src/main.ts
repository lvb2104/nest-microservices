import { NestFactory } from '@nestjs/core';
import { AlarmsGeneratorModule } from './alarms-generator.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(AlarmsGeneratorModule);
}
bootstrap()
  .then(() => {
    console.log('Alarms Generator is running');
  })
  .catch((err) => {
    console.error('Error starting Alarms Generator:', err);
  });
