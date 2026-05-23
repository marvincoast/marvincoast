import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { CertificateModule } from './certificate/certificate.module.js';

@Module({
  imports: [CertificateModule],
  controllers: [HealthController],
})
export class AppModule {}
