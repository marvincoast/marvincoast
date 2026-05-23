import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { CommonModule } from './common/common.module';
import { RankingModule } from './ranking/ranking.module';

@Module({
  imports: [CommonModule, RankingModule],
  controllers: [HealthController],
})
export class AppModule {}
