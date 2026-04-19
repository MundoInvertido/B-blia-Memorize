import { Star, Target, Trophy, LogOut, Download, Upload } from 'lucide-react';
import { nivelFromXP, progressoNivel, xpRestanteNivel, CONQUISTAS as CLIST } from '../lib/gamification';
import { estaVencido, NIVEL_LABELS, NIVEL_CORES } from '../lib/srs';
import { CORES_USUARIO } from '../hooks/useUsuarios';

const META_DIARIA = 3;

export default function Sidebar({ gami, versiculos, praticasHoje, usuario, onSair, onExportar, onImportar }) {
  const nivel      = nivelFromXP(gami.xpTotal);
  const progresso  = progressoNivel(gami.xpTotal);
  const xpRestante = xpRestanteNivel(gami.xpTotal);
  const dominados  = versiculos.filter(v => (v.nivel ?? 0) >= 5).length;
  const paraRevisar = versiculos.filter(estaVencido).length;

  const conquistasDesbloqueadas = CLIST.filter(c => gami.conquistasDesbloqueadas.includes(c.id));
  const corUsuario = CORES_USUARIO.find(c => c.id === usuario?.cor) ?? CORES_USUARIO[0];

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">

      {/* Perfil do usuário */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 ${corUsuario.bg} rounded-xl flex items-center justify-center text-white font-black text-xl flex-shrink-0`}>
            {usuario?.nome?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 truncate">{usuario?.nome}</p>
            <p className="text-xs text-slate-400">Desde {usuario?.criadoEm}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSair}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition text-xs font-semibold"
          >
            <LogOut size={13} /> Sair
          </button>
          <button
            onClick={onExportar}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-xs font-semibold"
            title="Exportar dados como arquivo JSON"
          >
            <Download size={13} /> Exportar
          </button>
          <button
            onClick={onImportar}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-xs font-semibold"
            title="Importar dados de um arquivo JSON"
          >
            <Upload size={13} /> Importar
          </button>
        </div>
      </div>

      {/* Streak */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">🔥</div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Sequência</p>
            <p className="text-2xl font-black text-orange-500 leading-none">
              {gami.streakAtual} <span className="text-sm font-semibold text-slate-500">dias</span>
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400">Recorde: {gami.streakMaximo} dias</p>
      </div>

      {/* XP & Nível */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-yellow-500 fill-yellow-400" />
            <span className="text-sm font-bold text-slate-700">Nível {nivel}</span>
          </div>
          <span className="text-xs text-slate-400">{gami.xpTotal} XP</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-700"
            style={{ width: `${progresso * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">Faltam {xpRestante} XP para o nível {nivel + 1}</p>
      </div>

      {/* Meta Diária */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} className="text-blue-500" />
          <span className="text-sm font-bold text-slate-700">Meta Diária</span>
        </div>
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: META_DIARIA }).map((_, i) => (
            <div key={i} className={`flex-1 h-3 rounded-full transition-all duration-500 ${i < praticasHoje ? 'bg-blue-500' : 'bg-slate-100'}`} />
          ))}
        </div>
        <p className="text-xs text-slate-400">
          {praticasHoje}/{META_DIARIA} práticas hoje
          {praticasHoje >= META_DIARIA && ' ✓'}
        </p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Estatísticas</p>
        <div className="space-y-2">
          {[
            { label: 'Versículos', valor: versiculos.length, cor: 'text-slate-800' },
            { label: 'Dominados', valor: dominados, cor: 'text-purple-600' },
            { label: 'Para revisar', valor: paraRevisar, cor: paraRevisar > 0 ? 'text-amber-600' : 'text-green-600' },
            { label: 'Total práticas', valor: gami.totalPraticas, cor: 'text-slate-800' },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-500">{label}</span>
              <span className={`font-bold ${cor}`}>{valor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conquistas */}
      {conquistasDesbloqueadas.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-yellow-500" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Conquistas ({conquistasDesbloqueadas.length}/{CLIST.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {conquistasDesbloqueadas.map(c => (
              <span key={c.id} title={`${c.titulo}: ${c.desc}`} className="text-xl cursor-help">
                {c.emoji}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
