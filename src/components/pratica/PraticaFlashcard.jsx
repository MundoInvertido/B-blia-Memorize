import { useState } from 'react';

export default function PraticaFlashcard({ versiculo, onConcluido }) {
  const [revelado, setRevelado] = useState(false);

  const revelar = () => {
    if (!revelado) {
      setRevelado(true);
      onConcluido();
    }
  };

  return (
    <div
      onClick={revelar}
      className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer select-none"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-6">{versiculo.referencia}</h2>
      {revelado ? (
        <p className="text-xl text-slate-700 leading-relaxed animate-fade-in">
          {versiculo.texto}
        </p>
      ) : (
        <p className="text-slate-400 italic">Toque no cartão para revelar o texto</p>
      )}
    </div>
  );
}
