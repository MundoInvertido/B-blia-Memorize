import { useState } from 'react';
import { RotateCcw, CheckCircle } from 'lucide-react';

function tokenizar(texto) {
  return texto.split(/(\s+)/).map((t, i) => ({
    idx: i,
    texto: t,
    isPalavra: t.trim() !== '',
  }));
}

function primeiraLetra(palavra) {
  const match = palavra.match(/[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/);
  return match ? match[0] : '';
}

export default function PraticaPrimeiraLetra({ versiculo, onConcluido }) {
  const tokens = tokenizar(versiculo.texto);
  const [revelados, setRevelados] = useState(new Set());
  const [concluido, setConcluido] = useState(false);

  const revelar = (idx) => {
    setRevelados(prev => new Set([...prev, idx]));
  };

  const revelarTodos = () => {
    const todos = tokens.filter(t => t.isPalavra).map(t => t.idx);
    setRevelados(new Set(todos));
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

      {/* Barra de progresso */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progresso * 100}%` }}
        />
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Clique nas palavras para revelá-las. A primeira letra é sempre visível.
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

          const pl = primeiraLetra(t.texto);
          const resto = '_'.repeat(Math.max(1, t.texto.replace(/[^a-zA-ZÀ-ÿ]/g, '').length - 1));
          return (
            <span
              key={t.idx}
              onClick={() => revelar(t.idx)}
              className="inline-block cursor-pointer bg-indigo-50 border-b-2 border-indigo-400 px-0.5 mx-0.5 rounded-t hover:bg-indigo-100 active:scale-95 transition-all font-mono"
              title="Clique para revelar"
            >
              <span className="font-bold text-indigo-700">{pl}</span>
              <span className="text-indigo-300">{resto}</span>
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
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition text-sm"
          >
            <CheckCircle size={16} /> Concluir
          </button>
        )}
      </div>
    </div>
  );
}
