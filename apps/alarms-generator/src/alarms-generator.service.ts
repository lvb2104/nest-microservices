import { Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ALARM_SERVICE } from './constants';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
// this service is just for demonstration purposes, in the real world application, this service will be replaced by the real alarm system
export class AlarmsGeneratorService {
  constructor(
    @Inject(ALARM_SERVICE) private readonly alarmsClient: ClientProxy,
  ) {}
  @Interval(10000)
  generateAlarms() {
    const alarmEvent = {
      name: `Alarm #` + Math.floor(Math.random() * 1000) + 1,
      buildingId: Math.floor(Math.random() * 100) + 1,
    };
    this.alarmsClient.emit('alarm.created', alarmEvent);
  }
}
