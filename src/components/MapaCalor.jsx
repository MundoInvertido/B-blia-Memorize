import { useMemo } from 'react';

const CORES_HEATMAP = [
  '#ebedf0', // 0 practices
  '#9be9a8', // 1
  '#40c463', // 2
  '#30a14e', // 3+
];

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function obterCor(contagem) {
  if (contagem === 0) return CORES_HEATMAP[0];
  if (contagem === 1) return CORES_HEATMAP[1];
  if (contagem === 2) return CORES_HEATMAP[2];
  return CORES_HEATMAP[3];
}

function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]}`;
}

export default function MapaCalor({ historicoDiario = {}, dias = 90 }) {
  const semanas = useMemo(() => {
    const resultado = [];
    const hoje = new Date();
    const dataInicio = new Date(Date.now() - dias * 86400000);

    // Ajustar para começar no domingo
    const primeiroDia = new Date(dataInicio);
    primeiroDia.setDate(primeiroDia.getDate() - primeiroDia.getDay());

    let semanaAtual = [];
    let dataAtual = new Date(primeiroDia);

    while (dataAtual <= hoje) {
      const dataStr = dataAtual.toISOString().split('T')[0];
      const contagem = historicoDiario[dataStr] || 0;

      semanaAtual.push({
        data: dataStr,
        contagem,
        diaSemana: dataAtual.getDay(),
      });

      if (semanaAtual.length === 7) {
        resultado.push(semanaAtual);
        semanaAtual = [];
      }

      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    if (semanaAtual.length > 0) {
      resultado.push(semanaAtual);
    }

    return resultado;
  }, [historicoDiario, dias]);

  const mesesLabels = useMemo(() => {
    const labels = [];
    let ultimoMes = -1;
    semanas.forEach((semana, i) => {
      const primeiroDiaSemana = semana[0];
      const mes = parseInt(primeiroDiaSemana.data.split('-')[1]);
      if (mes !== ultimoMes) {
        labels.push({ semana: i, mes: primeiroDiaSemana.data.split('-')[1] });
        ultimoMes = mes;
      }
    });
    return labels;
  }, [semanas]);

  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Atividade</p>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5">
          {/* Month labels */}
          <div className="flex mb-1 pl-5">
            {semanas.map((_, i) => {
              const label = mesesLabels.find(m => m.semana === i);
              if (label) {
                return (
                  <div key={i} style={{ width: '14px', marginLeft: i > 0 ? '2px' : '0' }} className="text-[9px] text-slate-400">
                    {MESES[parseInt(label.mes) - 1]}
                  </div>
                );
              }
              return <div key={i} style={{ width: '14px', marginLeft: '2px' }} />;
            })}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DIAS_SEMANA.map((d, i) => (
                <div key={i} className="h-3 flex items-center">
                  {i % 2 === 1 && <span className="text-[9px] text-slate-400">{d}</span>}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {semanas.map((semana, si) => (
              <div key={si} className="flex flex-col gap-0.5">
                {semana.map((dia, di) => (
                  <div
                    key={di}
                    className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-slate-400"
                    style={{ backgroundColor: obterCor(dia.contagem) }}
                    title={dia.contagem > 0 ? `${dia.contagem} prática${dia.contagem > 1 ? 's' : ''} em ${formatarData(dia.data)}` : formatarData(dia.data)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-slate-400">Menos</span>
        {CORES_HEATMAP.map((cor, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: cor }} />
        ))}
        <span className="text-[10px] text-slate-400">Mais</span>
      </div>
    </div>
  );
}