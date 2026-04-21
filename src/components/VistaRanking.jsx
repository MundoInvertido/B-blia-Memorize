import { useEffect, useState, memo, useCallback } from 'react';
import { Trophy, Star, Flame, BookOpen, Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { ouvirRanking } from '../lib/cloudSync';
import { firebaseConfigurado } from '../lib/firebase';
import { nivelFromXP } from '../lib/gamification';

function Medalha({ posicao }) {
  if (posicao === 1) return <span className="text-2xl">🥇</span>;
  if (posicao === 2) return <span className="text-2xl">🥈</span>;
  if (posicao === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-slate-400 font-bold text-sm w-8 text-center">{posicao}º</span>;
}

export default memo(function VistaRanking({ usuarioAtivo }) {
  const [ranking, setRanking]   = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsub = ouvirRanking((dados) => {
      setRanking(dados);
      setCarregando(false);
    });
    return unsub;
  }, []);

  const [recarregando, setRecarregando] = useState(false);

  const recarregar = () => {
    setRecarregando(true);
    setCarregando(true);
    const unsub = ouvirRanking((dados) => {
      setRanking(dados);
      setCarregando(false);
      setRecarregando(false);
    });
  };

  if (!firebaseConfigurado) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
          <WifiOff size={40} className="mx-auto text-slate-300 mb-4" />
          <h2 className="font-bold text-slate-700 text-xl mb-2">Ranking indisponível</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            O ranking requer configuração do Firebase para sincronizar
            dados entre todos os usuários. Consulte as instruções no README do projeto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">

      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy size={32} />
            <div>
              <h2 className="text-2xl font-black">Ranking Global</h2>
              <p className="text-yellow-100 text-sm">Top memorização da Bíblia</p>
            </div>
          </div>
          <button onClick={recarregar} disabled={recarregando} className="p-2 hover:bg-white/20 rounded-lg transition">
            <RefreshCw className={recarregando ? 'animate-spin' : ''} size={20} />
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex gap-4 text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1"><BookOpen size={12} /> Versículos dominados</span>
        <span className="flex items-center gap-1"><Star size={12} /> XP total</span>
        <span className="flex items-center gap-1"><Flame size={12} /> Streak</span>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-yellow-500" />
        </div>
      ) : ranking.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-slate-400">
          <Trophy size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum usuário no ranking ainda.</p>
          <p className="text-sm mt-1">Pratique versículos para aparecer aqui!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((u) => {
            const isEu = u.id === usuarioAtivo?.id;
            const nivel = nivelFromXP(u.xpTotal ?? 0);
            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4 transition ${
                  isEu
                    ? 'border-blue-300 ring-2 ring-blue-200 bg-blue-50'
                    : 'border-slate-100 hover:shadow-md'
                }`}
              >
                {/* Posição */}
                <div className="flex-shrink-0 w-10 flex justify-center">
                  <Medalha posicao={u.posicao} />
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {u.nome?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 truncate">{u.nome}</p>
                    {isEu && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">você</span>}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} />
                      <strong className="text-slate-700">{u.versiculosDominados ?? 0}</strong> dominados
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={11} />
                      <strong className="text-slate-700">{u.xpTotal ?? 0}</strong> XP
                    </span>
                    {(u.streakAtual ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Flame size={11} />
                        <strong className="text-slate-700">{u.streakAtual}</strong> dias
                      </span>
                    )}
                  </div>
                </div>

                {/* Nível */}
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-semibold">
                    Nv {nivel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-slate-400 pb-4">
        Ranking atualizado em tempo real · ordenado por versículos dominados
      </p>
    </div>
  );
});
