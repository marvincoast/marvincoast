import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import * as QRCode from 'qrcode';
import { SupabaseService } from '../common/supabase.service.js';
import type { CertificateDto, VerifyResponseDto } from './certificate.dto.js';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(private readonly supabase: SupabaseService) {}

  // ── Issue certificate ──────────────────────────────────────────────────────

  async issueCertificate(userId: string, attemptId: string): Promise<CertificateDto> {
    // Validate attempt belongs to user and is a passed prova_final
    const { data: attempt, error: attErr } = await this.supabase.admin
      .from('attempts')
      .select('id, user_id, passed, score, submitted_at, assessment_id')
      .eq('id', attemptId)
      .single();

    if (attErr || !attempt) throw new NotFoundException('Attempt not found');
    if (attempt.user_id !== userId) throw new BadRequestException('Not your attempt');
    if (!attempt.passed) throw new BadRequestException('Attempt was not passed');

    // Check assessment is prova_final
    const { data: assessment } = await this.supabase.admin
      .from('assessments')
      .select('assessment_type, course_id')
      .eq('id', attempt.assessment_id)
      .single();

    if (!assessment || assessment.assessment_type !== 'prova_final') {
      throw new BadRequestException('Certificate only available for Prova Final');
    }

    // Check if certificate already exists for this attempt
    const { data: existing } = await this.supabase.admin
      .from('certificates')
      .select('*')
      .eq('attempt_id', attemptId)
      .single();

    if (existing) return this.mapCertificate(existing);

    // Get user full name
    const { data: profile } = await this.supabase.admin
      .from('profiles')
      .select('full_name, display_name')
      .eq('id', userId)
      .single();

    const fullName = profile?.full_name || profile?.display_name || 'Trader';

    // Generate unique hash (SHA-256 of userId + attemptId + random salt)
    const salt = randomBytes(16).toString('hex');
    const verificationHash = createHash('sha256')
      .update(`${userId}:${attemptId}:${salt}`)
      .digest('hex');

    // Insert certificate
    const { data: cert, error: certErr } = await this.supabase.admin
      .from('certificates')
      .insert({
        user_id: userId,
        attempt_id: attemptId,
        course_id: assessment.course_id,
        full_name: fullName,
        verification_hash: verificationHash,
      })
      .select()
      .single();

    if (certErr || !cert) {
      this.logger.error('Failed to create certificate', certErr);
      throw new BadRequestException('Failed to issue certificate');
    }

    this.logger.log(`Certificate issued: ${cert.id} for user ${userId}`);
    return this.mapCertificate(cert);
  }

  // ── List user certificates ─────────────────────────────────────────────────

  async getUserCertificates(userId: string): Promise<CertificateDto[]> {
    const { data, error } = await this.supabase.admin
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('issued_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to list certificates', error);
      return [];
    }

    return (data ?? []).map(this.mapCertificate.bind(this));
  }

  // ── Public verify ──────────────────────────────────────────────────────────

  async verifyCertificate(hash: string): Promise<VerifyResponseDto> {
    const { data, error } = await this.supabase.admin.rpc('verify_certificate', {
      p_hash: hash,
    });

    if (error || !data || data.length === 0) {
      throw new NotFoundException('Certificate not found');
    }

    const row = data[0] as {
      full_name: string;
      course_title: string;
      issued_at: string;
      is_valid: boolean;
    };

    return {
      fullName: row.full_name,
      courseTitle: row.course_title,
      issuedAt: row.issued_at,
      isValid: row.is_valid,
    };
  }

  // ── QR code for PDF ────────────────────────────────────────────────────────

  async generateQrDataUrl(hash: string): Promise<string> {
    const baseUrl = process.env['PUBLIC_BASE_URL'] ?? 'http://localhost';
    const url = `${baseUrl}/verify/${hash}`;
    return QRCode.toDataURL(url, { width: 200, margin: 1 });
  }

  // ── Helper ─────────────────────────────────────────────────────────────────

  private mapCertificate(row: {
    id: string;
    user_id: string;
    course_id: string;
    full_name: string;
    issued_at: string;
    verification_hash: string;
    pdf_storage_path: string | null;
    revoked_at: string | null;
  }): CertificateDto {
    const pdfUrl = row.pdf_storage_path
      ? `${process.env['SUPABASE_URL']}/storage/v1/object/public/${row.pdf_storage_path}`
      : null;

    return {
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      fullName: row.full_name,
      issuedAt: row.issued_at,
      verificationHash: row.verification_hash,
      pdfUrl,
      isRevoked: row.revoked_at !== null,
    };
  }
}
