import { useState } from 'react';
import { ThumbsUp, Minus, ThumbsDown } from 'lucide-react';
import { NIVEL_LABELS, NIVEL_CORES } from '../../lib/srs';
import { XP_POR_RESULTADO } from '../../lib/gamification';

export default function FeedbackSRS({ versiculo, onFeedback }) {
  const [xpAnimado, setXpAnimado] = useState(null);

  const handleClick = (resultado) => {
    const xp = XP_POR_RESULTADO[resultado];
    setXpAnimado({ valor: xp, resultado });
    setTimeout(() => onFeedback(resultado), 900);
  };

  const nivel = versiculo.nivel ?? 0;

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-fade-in relative overflow-hidden">
        {/* XP float animation */}
        {xpAnimado && (
          <div className="absolute top-4 right-4 pointer-events-none">
            <span className="animate-xp-float text-2xl font-black text-green-500">
              +{xpAnimado.valor} XP
            </span>
          </div>
        )}

        <h3 className="text-center font-black text-slate-800 text-xl mb-1">Como foi?</h3>
        <p className="text-center text-slate-500 text-sm mb-2">{versiculo.referencia}</p>

        <div className="flex justify-center mb-5">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${NIVEL_CORES[nivel]}`}>
            {NIVEL_LABELS[nivel]}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleClick('dificil')}
            className="flex flex-col items-center gap-1.5 p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 active:scale-95 transition-all border-2 border-transparent hover:border-red-200"
          >
            <ThumbsDown size={24} />
            <span className="font-bold text-sm">Difícil</span>
            <span className="text-xs text-red-400">−1 nível · +{XP_POR_RESULTADO.dificil} XP</span>
          </button>

          <button
            onClick={() => handleClick('ok')}
            className="flex flex-col items-center gap-1.5 p-4 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all border-2 border-transparent hover:border-slate-200"
          >
            <Minus size={24} />
            <span className="font-bold text-sm">Ok</span>
            <span className="text-xs text-slate-400">mantém · +{XP_POR_RESULTADO.ok} XP</span>
          </button>

          <button
            onClick={() => handleClick('facil')}
            className="flex flex-col items-center gap-1.5 p-4 bg-green-50 text-green-700 rounded-2xl hover:bg-green-100 active:scale-95 transition-all border-2 border-transparent hover:border-green-200"
          >
            <ThumbsUp size={24} />
            <span className="font-bold text-sm">Fácil</span>
            <span className="text-xs text-green-500">+1 nível · +{XP_POR_RESULTADO.facil} XP</span>
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Sua resposta define quando este versículo voltará para revisão.
        </p>
      </div>
    </div>
  );
}
