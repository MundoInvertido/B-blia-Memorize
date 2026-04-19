import { BookOpen, EyeOff, Type, ArrowLeft, Keyboard, Zap, Eye } from 'lucide-react';
import { NIVEL_LABELS, NIVEL_CORES, estaVencido } from '../lib/srs';

const MODOS = [
  {
    id: 'progressivo',
    icone: <Zap size={20} />,
    cor: 'blue',
    titulo: 'Estudo Progressivo',
    desc: 'Ler → 30% → 60% → 100% → Digitar',
    xp: '+10–30 XP',
    recomendado: true,
    largura: 'col-span-2',
  },
  {
    id: 'ocultarTotal',
    icone: <EyeOff size={20} />,
    cor: 'purple',
    titulo: 'Ocultar Total',
    desc: 'Palavras totalmente ocultas. Clique para revelar.',
    xp: '+10–30 XP',
  },
  {
    id: 'primeiraLetra',
    icone: <Eye size={20} />,
    cor: 'indigo',
    titulo: 'Ocultar + 1ª Letra',
    desc: 'Oculta as palavras mas mantém a primeira letra visível.',
    xp: '+10–30 XP',
  },
  {
    id: 'digitar',
    icone: <Keyboard size={20} />,
    cor: 'green',
    titulo: 'Digitar',
    desc: 'Digite cada palavra de memória.',
    xp: '+10–30 XP',
  },
  {
    id: 'flashcard',
    icone: <BookOpen size={20} />,
    cor: 'sky',
    titulo: 'Flashcard',
    desc: 'Toque para revelar o versículo completo.',
    xp: '+10–30 XP',
  },
];

const CORES = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'hover:border-blue-400',   btn: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'hover:border-purple-400', btn: '' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'hover:border-indigo-400', btn: '' },
  green:  { bg: 'bg-green-100',  text: 'text-green-700',  border: 'hover:border-green-400',  btn: '' },
  sky:    { bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'hover:border-sky-400',    btn: '' },
};

export default function VistaMenuPratica({ versiculo, onIniciar, onVoltar }) {
  const nivel = versiculo.nivel ?? 0;
  const vencido = estaVencido(versiculo);

  return (
    <div className="max-w-2xl">
      <button
        onClick={onVoltar}
        className="text-blue-600 font-medium mb-5 flex items-center gap-1 hover:underline"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Card do versículo */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6 text-center">
        <div className="flex justify-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${NIVEL_CORES[nivel]}`}>
            {NIVEL_LABELS[nivel]}
          </span>
          {vencido && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
              Revisar hoje
            </span>
          )}
        </div>
        <h2 className="text-2xl font-black text-blue-800 mb-2">{versiculo.referencia}</h2>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{versiculo.texto}</p>
      </div>

      {/* Modos */}
      <div className="grid grid-cols-2 gap-3">
        {MODOS.map(modo => {
          const c = CORES[modo.cor];
          if (modo.recomendado) {
            return (
              <button
                key={modo.id}
                onClick={() => onIniciar(modo.id)}
                className={`col-span-2 flex items-center gap-4 p-5 rounded-2xl shadow-md hover:shadow-lg transition ${c.btn}`}
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {modo.icone}
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-base">{modo.titulo}</p>
                    <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full font-bold">⚡ Recomendado</span>
                  </div>
                  <p className="text-blue-200 text-sm mt-0.5">{modo.desc}</p>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-lg font-bold flex-shrink-0">{modo.xp}</span>
              </button>
            );
          }

          return (
            <button
              key={modo.id}
              onClick={() => onIniciar(modo.id)}
              className={`flex flex-col items-center gap-2 p-4 bg-white border-2 border-slate-100 rounded-2xl ${c.border} hover:shadow-md transition`}
            >
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                <span className={c.text}>{modo.icone}</span>
              </div>
              <span className="font-bold text-slate-800 text-sm text-center">{modo.titulo}</span>
              <span className="text-xs text-slate-400 text-center leading-tight">{modo.desc}</span>
              <span className="text-xs text-slate-300">{modo.xp}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
