import { useState, useEffect, useCallback } from 'react';
import { XP_POR_RESULTADO, verificarConquistas } from '../lib/gamification';

const INICIAL = {
  xpTotal: 0, streakAtual: 0, streakMaximo: 0,
  ultimaDiaPratica: null, totalPraticas: 0,
  conquistasDesbloqueadas: [], novasConquistas: [],
};

function chave(userId) { return `memo_biblia_gami_v1_${userId}`; }

function carregar(userId) {
  try {
    const s = localStorage.getItem(chave(userId));
    return s ? { ...INICIAL, ...JSON.parse(s) } : INICIAL;
  } catch { return INICIAL; }
}

export function useGamificacao(versiculos, userId) {
  const [gami, setGami] = useState(() => carregar(userId));

  // Reload when user changes
  useEffect(() => {
    setGami(carregar(userId));
  }, [userId]);

  // Persist (without novasConquistas)
  useEffect(() => {
    const { novasConquistas, ...sem } = gami;
    localStorage.setItem(chave(userId), JSON.stringify({ ...sem, novasConquistas: [] }));
  }, [gami, userId]);

  const registrarPratica = useCallback((resultado) => {
    setGami(prev => {
      const hoje  = new Date().toISOString().split('T')[0];
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let novoStreak = 1;
      if (prev.ultimaDiaPratica === hoje)  novoStreak = prev.streakAtual;
      else if (prev.ultimaDiaPratica === ontem) novoStreak = prev.streakAtual + 1;

      const novoXP    = prev.xpTotal + (XP_POR_RESULTADO[resultado] ?? 10);
      const novoTotal = prev.totalPraticas + 1;

      const stats = {
        xpTotal: novoXP, streakAtual: novoStreak, totalPraticas: novoTotal,
        totalVersiculos: versiculos.length,
        versiculosDominados: versiculos.filter(v => (v.nivel ?? 0) >= 5).length,
      };
      const novasConquistas = verificarConquistas(stats, prev.conquistasDesbloqueadas);

      return {
        ...prev, xpTotal: novoXP,
        streakAtual: novoStreak,
        streakMaximo: Math.max(prev.streakMaximo, novoStreak),
        ultimaDiaPratica: hoje, totalPraticas: novoTotal,
        conquistasDesbloqueadas: [...prev.conquistasDesbloqueadas, ...novasConquistas],
        novasConquistas,
      };
    });
  }, [versiculos]);

  const limparNovasConquistas = useCallback(() => {
    setGami(prev => ({ ...prev, novasConquistas: [] }));
  }, []);

  const restaurar = useCallback((dados) => {
    if (dados && typeof dados === 'object') {
      setGami({ ...INICIAL, ...dados, novasConquistas: [] });
    }
  }, []);

  const praticasHoje = (() => {
    const hoje = new Date().toISOString().split('T')[0];
    return gami.ultimaDiaPratica === hoje ? gami.totalPraticas : 0;
  })();

  return { gami, praticasHoje, registrarPratica, limparNovasConquistas, restaurar };
}
