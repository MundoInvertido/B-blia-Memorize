import { useState } from 'react';
import { RotateCcw, CheckCircle } from 'lucide-react';

function tokenizar(texto) {
  return texto.split(/(\s+)/).map((t, i) => ({
    idx: i,
    texto: t,
    isPalavra: t.trim() !== '',
  }));
}

function gerarOcultos(tokens) {
  return new Set(tokens.filter(t => t.isPalavra).map(t => t.idx));
}

export default function PraticaOcultarTotal({ versiculo, onConcluido }) {
  const tokens = tokenizar(versiculo.texto);
  const [revelados, setRevelados] = useState(new Set());
  const [concluido, setConcluido] = useState(false);

  const revelar = (idx) => setRevelados(prev => new Set([...prev, idx]));

  const revelarTodos = () => {
    setRevelados(new Set(tokens.filter(t => t.isPalavra).map(t => t.idx)));
  };

  const reiniciar = () => {
    setRevelados(new Set());
    setConcluido(false);
  };

  const handleConcluir = () => {
    setConcluido(true);
    onConcluido();
  };

  const totalPalavras = tokens.filter(t => t.isPalavra).length;
  const totalRevelados = tokens.filter(t => t.isPalavra && revelados.has(t.idx)).length;
  const progresso = totalPalavras > 0 ? totalRevelados / totalPalavras : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-blue-800">{versiculo.referencia}</h2>
        <span className="text-xs text-slate-500">{totalRevelados}/{totalPalavras}</span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${progresso * 100}%` }}
        />
      </div>

      <p className="text-xs text-slate-500 mb-5">
        Clique nos espaços para revelar as palavras. Sem dicas!
      </p>

      <div className="text-xl leading-loose mb-6 select-none">
        {tokens.map(t => {
          if (!t.isPalavra) return <span key={t.idx}>{t.texto}</span>;

          if (revelados.has(t.idx)) {
            return (
              <span key={t.idx} className="text-green-700 font-medium transition-colors">
                {t.texto}
              </span>
            );
          }

          const comprimento = t.texto.replace(/[^a-zA-ZÀ-ÿ]/g, '').length;
          return (
            <span
              key={t.idx}
              onClick={() => revelar(t.idx)}
              className="inline-block cursor-pointer bg-slate-200 hover:bg-slate-300 active:scale-95 rounded mx-0.5 px-1 transition-all font-mono text-transparent"
              title="Clique para revelar"
              style={{ minWidth: `${Math.max(comprimento * 0.6, 1.2)}rem` }}
            >
              {t.texto}
            </span>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={reiniciar}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm"
        >
          <RotateCcw size={14} /> Reiniciar
        </button>
        <button
          onClick={revelarTodos}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm"
        >
          Revelar tudo
        </button>
        {!concluido && (
          <button
            onClick={handleConcluir}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-xl font-bold hover:bg-purple-700 transition text-sm"
          >
            <CheckCircle size={16} /> Concluir
          </button>
        )}
      </div>
    </div>
  );
}
