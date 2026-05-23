import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { CommonModule } from './common/common.module';
import { AssessmentModule } from './assessment/assessment.module';
import { AttemptModule } from './attempt/attempt.module';

@Module({
  imports: [CommonModule, AssessmentModule, AttemptModule],
  controllers: [HealthController],
})
export class AppModule {}
