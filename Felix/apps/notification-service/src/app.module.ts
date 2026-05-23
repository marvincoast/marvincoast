import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { NotificationModule } from './notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [HealthController],
})
export class AppModule {}
