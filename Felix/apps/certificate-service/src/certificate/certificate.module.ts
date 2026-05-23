import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module.js';
import { CertificateService } from './certificate.service.js';
import { CertificateController } from './certificate.controller.js';

@Module({
  imports: [CommonModule],
  providers: [CertificateService],
  controllers: [CertificateController],
})
export class CertificateModule {}
