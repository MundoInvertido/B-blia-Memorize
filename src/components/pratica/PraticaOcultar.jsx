import { useState } from 'react';
import { RotateCcw, CheckCircle } from 'lucide-react';

function gerarOcultas(palavras) {
  return palavras.map(p => p.trim() !== '' && Math.random() > 0.6);
}

export default function PraticaOcultar({ versiculo, onConcluido }) {
  const palavras = versiculo.texto.split(/(\s+)/);
  const [ocultas, setOcultas] = useState(() => gerarOcultas(palavras));
  const [concluido, setConcluido] = useState(false);

  const revelar = (i) => {
    setOcultas(prev => { const n = [...prev]; n[i] = false; return n; });
  };

  const reembaralhar = () => {
    setOcultas(gerarOcultas(palavras));
    setConcluido(false);
  };

  const handleConcluir = () => {
    setConcluido(true);
    onConcluido();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-blue-800 mb-4">{versiculo.referencia}</h2>

      <div className="text-lg leading-relaxed text-slate-700 mb-6 select-none">
        {palavras.map((palavra, i) => {
          if (palavra.trim() === '') return <span key={i}>{palavra}</span>;
          if (ocultas[i]) {
            return (
              <span
                key={i}
                onClick={() => revelar(i)}
                className="inline-block min-w-[3rem] border-b-2 border-slate-400 mx-0.5 bg-slate-100 text-transparent cursor-pointer hover:bg-slate-200 transition rounded-t"
              >
                {palavra}
              </span>
            );
          }
          return <span key={i} className="mx-px">{palavra}</span>;
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={reembaralhar}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-200 transition"
        >
          <RotateCcw size={16} /> Baralhar
        </button>
        {!concluido && (
          <button
            onClick={handleConcluir}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <CheckCircle size={16} /> Concluir
          </button>
        )}
      </div>
    </div>
  );
}
