import { BookOpen, List, Plus, Star } from 'lucide-react';
import { nivelFromXP, progressoNivel } from '../lib/gamification';

export default function Navegacao({ vista, irParaLista, irParaAdicionar, gami, usuario }) {
  const nivel = nivelFromXP(gami?.xpTotal ?? 0);
  const progresso = progressoNivel(gami?.xpTotal ?? 0);
  const streak = gami?.streakAtual ?? 0;

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">

        {/* Logo */}
        <button
          onClick={irParaLista}
          className="flex items-center gap-2 font-black text-xl mr-auto"
        >
          <BookOpen size={24} />
          <span className="hidden sm:inline">MemoBíblia</span>
        </button>

        {/* Stats (desktop) */}
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

        {/* Nav buttons */}
        <div className="flex gap-1">
          <button
            onClick={irParaLista}
            className={`p-2 rounded-xl transition flex items-center gap-1.5 text-sm font-medium ${
              vista === 'lista' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <List size={18} />
            <span className="hidden sm:inline">Versículos</span>
          </button>
          <button
            onClick={irParaAdicionar}
            className={`p-2 rounded-xl transition flex items-center gap-1.5 text-sm font-medium ${
              vista === 'adicionar' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
