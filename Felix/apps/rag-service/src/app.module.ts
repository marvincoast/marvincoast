import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { TutorModule } from './tutor/tutor.module.js';

@Module({
  imports: [TutorModule],
  controllers: [HealthController],
})
export class AppModule {}
