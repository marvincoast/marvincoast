import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import { CertificateService } from './certificate.service.js';
import type { IssueCertificateDto } from './certificate.dto.js';

interface CurrentUserPayload {
  userId: string;
  userEmail: string;
}

@Controller()
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  /** POST /api/certificates/issue — issue certificate for a passed attempt */
  @Post('issue')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async issue(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: IssueCertificateDto,
  ) {
    return this.certificateService.issueCertificate(user.userId, dto.attemptId);
  }

  /** GET /api/certificates/me — list my certificates */
  @Get('me')
  @UseGuards(AuthGuard)
  async listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.certificateService.getUserCertificates(user.userId);
  }

  /** GET /verify/:hash — public verification (no auth) */
  @Get('/verify/:hash')
  async verify(@Param('hash') hash: string) {
    return this.certificateService.verifyCertificate(hash);
  }
}
