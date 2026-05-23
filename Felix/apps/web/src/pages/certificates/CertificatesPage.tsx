import { AlertCircle, Award, CheckCircle, Download, ExternalLink } from 'lucide-react';

import { Spinner } from '@/components/ui/Spinner';
import { useMyCertificates } from '@/hooks/use-certificate';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function CertificatesPage(): JSX.Element {
  const { data: certs, isLoading, isError } = useMyCertificates();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <AlertCircle size={32} className="text-state-error" />
        <p className="text-white/60">Erro ao carregar certificados. Tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Meus Certificados</h1>
        <p className="mt-1 text-sm text-white/50">
          Certificados emitidos após aprovação na Prova Final.
        </p>
      </div>

      {/* Empty state */}
      {(!certs || certs.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/8 bg-bg-surface py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/10 text-brand-gold">
            <Award size={32} />
          </div>
          <div>
            <p className="font-medium text-white">Nenhum certificado ainda</p>
            <p className="mt-1 text-sm text-white/40">
              Conclua o curso e seja aprovado na Prova Final para emitir seu certificado.
            </p>
          </div>
        </div>
      )}

      {/* Certificate cards */}
      <div className="space-y-4">
        {certs?.map((cert) => (
          <div
            key={cert.id}
            className="relative overflow-hidden rounded-2xl border border-brand-gold/30 bg-bg-surface p-6"
          >
            {/* Gold shimmer line */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-gold to-transparent" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                  <Award size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{cert.fullName}</p>
                    <CheckCircle size={15} className="text-state-success" />
                  </div>
                  <p className="text-sm text-white/60">Felix Empire Trading</p>
                  <p className="mt-1 text-xs text-white/40">
                    Emitido em {formatDate(cert.issuedAt)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-2">
                {cert.pdfUrl && (
                  <a
                    href={cert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-brand-gold/50 hover:text-brand-gold"
                  >
                    <Download size={13} />
                    PDF
                  </a>
                )}
                <a
                  href={`/verify/${cert.verificationHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-brand-gold/50 hover:text-brand-gold"
                >
                  <ExternalLink size={13} />
                  Verificar
                </a>
              </div>
            </div>

            {/* Hash */}
            <div className="mt-4 rounded-lg bg-bg-base/60 px-3 py-2">
              <p className="font-mono text-xs text-white/30 break-all">
                Hash: {cert.verificationHash}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
