/**
 * Prova Final — wraps SimuladoPage with the course's prova-final assessment.
 * Uses the fixed Felix Empire Trading course ID and fetches the prova-final assessment ID,
 * then redirects to /simulado/:assessmentId for the actual exam.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Spinner } from '../../components/ui/Spinner';

const PROVA_FINAL_ASSESSMENT_ID = 'e0000000-ffff-0000-0000-000000000001';

export function ProvaFinalPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate directly to the simulado page with the prova final assessment ID
    navigate(`/simulado/${PROVA_FINAL_ASSESSMENT_ID}`, { replace: true });
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-gray-400">Carregando Prova Final…</p>
      </div>
    </div>
  );
}
