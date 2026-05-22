import { BookOpen, List, Plus, Star, Info, Settings } from 'lucide-react';
import { nivelFromXP, progressoNivel } from '../lib/gamification';

export default function Navegacao({ vista, irParaLista, irParaAdicionar, irParaSobre, irParaConfiguracoes, gami, statusSync }) {
  const nivel    = nivelFromXP(gami?.xpTotal ?? 0);
  const progresso = progressoNivel(gami?.xpTotal ?? 0);
  const streak   = gami?.streakAtual ?? 0;

  const btn = (vistaAlvo, onClick, icon, label) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition flex items-center gap-1.5 text-sm font-medium ${
        vista === vistaAlvo ? 'bg-white/20' : 'hover:bg-white/10'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">

        {/* Logo */}
        <button onClick={irParaLista} className="flex items-center gap-2 font-black text-xl mr-auto">
          <BookOpen size={24} />
          <span className="hidden sm:inline">MemoBíblia</span>
        </button>

        {/* Stats desktop */}
        {gami && (
          <div className="hidden md:flex items-center gap-4 mr-2">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <span className="text-base">🔥</span>
                <span className="font-bold text-sm">{streak} dias</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl min-w-[120px]">
              <Star size={14} className="text-yellow-300 fill-yellow-300 flex-shrink-0" />
              <span className="font-bold text-sm">Nv {nivel}</span>
              <div className="flex-1 bg-white/20 rounded-full h-1.5 min-w-[40px]">
                <div
                  className="h-full bg-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${progresso * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Status sync */}
        {statusSync && (
          <span className="text-sm opacity-80" title="Status sincronização">{statusSync}</span>
        )}

        {/* Nav buttons */}
        <div className="flex gap-1">
          {btn('lista',         irParaLista,         <List size={18} />,        'Versículos')}
          {btn('adicionar',     irParaAdicionar,     <Plus size={18} />,       'Adicionar')}
          {btn('configuracoes', irParaConfiguracoes, <Settings size={18} />,   'Ajustes')}
          {btn('sobre',         irParaSobre,         <Info size={18} />,        'Sobre')}
        </div>
      </div>
    </nav>
  );
}
