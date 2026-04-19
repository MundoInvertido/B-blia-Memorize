const INTERVALOS_DIAS = [1, 3, 7, 14, 30, 90];

export const NIVEL_LABELS = ['Novo', 'Iniciante', 'Aprendendo', 'Familiar', 'Avançado', 'Dominado'];
export const NIVEL_CORES = [
  'bg-slate-100 text-slate-600',
  'bg-yellow-100 text-yellow-700',
  'bg-orange-100 text-orange-700',
  'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
];

function hoje() {
  return new Date().toISOString().split('T')[0];
}

export function estaVencido(versiculo) {
  if (!versiculo.proximaRevisao) return true;
  return versiculo.proximaRevisao <= hoje();
}

export function calcularProximaRevisao(nivel) {
  const dias = INTERVALOS_DIAS[Math.min(nivel, INTERVALOS_DIAS.length - 1)];
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().split('T')[0];
}

// resultado: 'facil' | 'ok' | 'dificil'
export function aplicarSRS(versiculo, resultado) {
  let nivel = versiculo.nivel ?? 0;
  if (resultado === 'facil')   nivel = Math.min(5, nivel + 1);
  if (resultado === 'dificil') nivel = Math.max(0, nivel - 1);
  return {
    ...versiculo,
    nivel,
    proximaRevisao: calcularProximaRevisao(nivel),
    totalPraticas: (versiculo.totalPraticas ?? 0) + 1,
    ultimaPratica: hoje(),
  };
}

export function ordenarVersiculos(versiculos) {
  return [...versiculos].sort((a, b) => {
    const aV = estaVencido(a);
    const bV = estaVencido(b);
    if (aV !== bV) return aV ? -1 : 1;
    return (a.nivel ?? 0) - (b.nivel ?? 0);
  });
}
