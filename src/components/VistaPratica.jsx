import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import PraticaFlashcard from './pratica/PraticaFlashcard';
import PraticaPrimeiraLetra from './pratica/PraticaPrimeiraLetra';
import PraticaOcultarTotal from './pratica/PraticaOcultarTotal';
import PraticaDigitar from './pratica/PraticaDigitar';
import PraticaProgressiva from './pratica/PraticaProgressiva';
import FeedbackSRS from './pratica/FeedbackSRS';

export default function VistaPratica({ versiculo, modo, onVoltar, onConcluir }) {
  const [mostrarFeedback, setMostrarFeedback] = useState(false);

  const handleConcluido = () => setMostrarFeedback(true);

  if (mostrarFeedback) {
    return <FeedbackSRS versiculo={versiculo} onFeedback={onConcluir} />;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <button
        onClick={onVoltar}
        className="text-blue-600 font-medium flex items-center gap-1 hover:underline"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      {modo === 'progressivo'   && <PraticaProgressiva   versiculo={versiculo} onConcluido={handleConcluido} />}
      {modo === 'flashcard'     && <PraticaFlashcard     versiculo={versiculo} onConcluido={handleConcluido} />}
      {modo === 'primeiraLetra' && <PraticaPrimeiraLetra  versiculo={versiculo} onConcluido={handleConcluido} />}
      {modo === 'ocultarTotal'  && <PraticaOcultarTotal  versiculo={versiculo} onConcluido={handleConcluido} />}
      {modo === 'digitar'       && <PraticaDigitar       versiculo={versiculo} onConcluido={handleConcluido} />}
    </div>
  );
}
