import { useState } from 'react';
import { ArrowLeft, ChevronRight, BookOpen } from 'lucide-react';
import PraticaFlashcard from './pratica/PraticaFlashcard';
import PraticaPrimeiraLetra from './pratica/PraticaPrimeiraLetra';
import PraticaOcultarTotal from './pratica/PraticaOcultarTotal';
import PraticaDigitar from './pratica/PraticaDigitar';
import PraticaProgressiva from './pratica/PraticaProgressiva';
import FeedbackSRS from './pratica/FeedbackSRS';

export default function VistaPratica({ versiculo, modo, onVoltar, onConcluir }) {
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [indiceIntervalo, setIndiceIntervalo] = useState(0);
  const [praticandoCompleto, setPraticandoCompleto] = useState(false);

  // Get verses from range or single verse
  const versiculosArray = versiculo.versiculos;
  const totalIntervalo = versiculosArray?.length || 1;
  const temIntervalo = totalIntervalo > 1;
  
  // Determine which verse to show
  const versiculoAtual = praticandoCompleto 
    ? versiculo  // Full passage
    : temIntervalo 
      ? { ...versiculo, referencia: versiculosArray[indiceIntervalo].ref, texto: versiculosArray[indiceIntervalo].texto }
      : versiculo;

  const handleConcluidoIntervalo = () => {
    // If we have more individual verses to practice
    if (!praticandoCompleto && indiceIntervalo + 1 < totalIntervalo) {
      setIndiceIntervalo(i => i + 1);
      return;
    }
    
    // After all individuals, practice the complete passage
    if (!praticandoCompleto && temIntervalo) {
      setPraticandoCompleto(true);
      return;
    }
    
    // Finally, show feedback
    setMostrarFeedback(true);
  };

  const handleVoltar = () => {
    if (praticandoCompleto) {
      setPraticandoCompleto(false);
    } else if (indiceIntervalo > 0) {
      setIndiceIntervalo(i => i - 1);
    } else {
      onVoltar();
    }
  };

  if (mostrarFeedback) {
    return <FeedbackSRS versiculo={versiculo} onFeedback={onConcluir} />;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <button
        onClick={handleVoltar}
        className="text-blue-600 font-medium flex items-center gap-1 hover:underline"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Indicador de progresso no intervalo */}
      {temIntervalo && !praticandoCompleto && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex gap-1">
            {versiculosArray.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition ${
                  i < indiceIntervalo ? 'bg-green-400' :
                  i === indiceIntervalo ? 'bg-blue-500' :
                  'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">
            {indiceIntervalo + 1}/{totalIntervalo} individual
          </span>
        </div>
      )}

      {/* Indicador de prática completa */}
      {praticandoCompleto && (
        <div className="flex items-center justify-center gap-2 mb-3 bg-blue-50 px-3 py-2 rounded-lg">
          <BookOpen size={14} className="text-blue-600" />
          <span className="text-xs text-blue-700 font-medium">
            Passagem completa - {versiculo.referencia}
          </span>
        </div>
      )}

      {modo === 'progressivo'   && <PraticaProgressiva   versiculo={versiculoAtual} onConcluido={handleConcluidoIntervalo} />}
      {modo === 'flashcard'     && <PraticaFlashcard     versiculo={versiculoAtual} onConcluido={handleConcluidoIntervalo} />}
      {modo === 'primeiraLetra' && <PraticaPrimeiraLetra  versiculo={versiculoAtual} onConcluido={handleConcluidoIntervalo} />}
      {modo === 'ocultarTotal'  && <PraticaOcultarTotal  versiculo={versiculoAtual} onConcluido={handleConcluidoIntervalo} />}
      {modo === 'digitar'       && <PraticaDigitar       versiculo={versiculoAtual} onConcluido={handleConcluidoIntervalo} />}
    </div>
  );
}
