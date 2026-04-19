export const XP_POR_RESULTADO = { dificil: 10, ok: 20, facil: 30 };
export const XP_POR_NIVEL = 150;

export function nivelFromXP(xp) {
  return Math.floor(xp / XP_POR_NIVEL) + 1;
}

export function progressoNivel(xp) {
  return (xp % XP_POR_NIVEL) / XP_POR_NIVEL;
}

export function xpRestanteNivel(xp) {
  return XP_POR_NIVEL - (xp % XP_POR_NIVEL);
}

export const CONQUISTAS = [
  { id: 'primeiro_versiculo', titulo: 'Primeira Palavra',   desc: 'Adicione seu 1º versículo',    emoji: '📖' },
  { id: 'cinco_versiculos',   titulo: 'Colecionador',       desc: '5 versículos adicionados',     emoji: '📚' },
  { id: 'dez_versiculos',     titulo: 'Biblioteca Sagrada', desc: '10 versículos adicionados',    emoji: '🏛️' },
  { id: 'primeira_pratica',   titulo: 'Primeira Prática',   desc: 'Complete uma prática',         emoji: '⭐' },
  { id: 'dez_praticas',       titulo: 'Dedicado',           desc: '10 práticas concluídas',       emoji: '💪' },
  { id: 'streak_3',           titulo: 'Em Chamas',          desc: '3 dias seguidos',              emoji: '🔥' },
  { id: 'streak_7',           titulo: 'Semana Sagrada',     desc: '7 dias seguidos',              emoji: '🔥🔥' },
  { id: 'streak_30',          titulo: 'Mês de Graça',       desc: '30 dias seguidos',             emoji: '👑' },
  { id: 'xp_100',             titulo: 'Centurião',          desc: '100 XP acumulados',            emoji: '💯' },
  { id: 'xp_500',             titulo: 'Veterano',           desc: '500 XP acumulados',            emoji: '🏆' },
  { id: 'xp_1000',            titulo: 'Mestre Bíblico',     desc: '1000 XP acumulados',           emoji: '🎓' },
  { id: 'dominado_1',         titulo: 'Memorizado!',        desc: '1 versículo no nível máximo',  emoji: '✨' },
  { id: 'dominado_5',         titulo: 'Mestre da Palavra',  desc: '5 versículos dominados',       emoji: '🌟' },
];

export function verificarConquistas(stats, conquistasAtuais) {
  const checks = {
    primeiro_versiculo: stats.totalVersiculos >= 1,
    cinco_versiculos:   stats.totalVersiculos >= 5,
    dez_versiculos:     stats.totalVersiculos >= 10,
    primeira_pratica:   stats.totalPraticas >= 1,
    dez_praticas:       stats.totalPraticas >= 10,
    streak_3:           stats.streakAtual >= 3,
    streak_7:           stats.streakAtual >= 7,
    streak_30:          stats.streakAtual >= 30,
    xp_100:             stats.xpTotal >= 100,
    xp_500:             stats.xpTotal >= 500,
    xp_1000:            stats.xpTotal >= 1000,
    dominado_1:         stats.versiculosDominados >= 1,
    dominado_5:         stats.versiculosDominados >= 5,
  };

  return Object.entries(checks)
    .filter(([id, ok]) => ok && !conquistasAtuais.includes(id))
    .map(([id]) => id);
}
