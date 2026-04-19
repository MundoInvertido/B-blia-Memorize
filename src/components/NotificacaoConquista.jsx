import { useEffect } from 'react';
import { CONQUISTAS } from '../lib/gamification';

export default function NotificacaoConquista({ conquistas, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const detalhes = conquistas
    .map(id => CONQUISTAS.find(c => c.id === id))
    .filter(Boolean);

  if (detalhes.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {detalhes.map(c => (
        <div
          key={c.id}
          className="animate-slide-down bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 min-w-[240px]"
        >
          <span className="text-2xl">{c.emoji}</span>
          <div>
            <p className="font-bold text-sm leading-tight">Conquista desbloqueada!</p>
            <p className="text-xs opacity-90">{c.titulo} — {c.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
