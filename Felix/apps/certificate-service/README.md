# certificate-service

Gera certificados PDF Empire Trading e expõe a verificação pública via QR.

Implementação completa na **Etapa 6** do plano.

## Endpoints planejados

- `POST /api/certificates` — emite certificado (consumido pelo evento `ExamPassed`).
- `GET /api/certificates/me` — lista certificados do usuário autenticado.
- `GET /verify/:hash` — público; retorna nome, curso e data se válido.

## Stack

- `@react-pdf/renderer` para layout do certificado (templating).
- `qrcode` para QR de verificação.
- SHA-256 do PDF gravado em `certificates.file_hash`.
