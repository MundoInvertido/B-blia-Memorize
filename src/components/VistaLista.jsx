import { BookOpen, Play, Trash2, Bell } from 'lucide-react';
import { ordenarVersiculos, estaVencido, NIVEL_LABELS, NIVEL_CORES } from '../lib/srs';

function Estrelas({ nivel }) {
  return (
    <div className="flex gap-0.5" title={NIVEL_LABELS[nivel ?? 0]}>
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={`text-sm ${i < (nivel ?? 0) ? 'text-yellow-400' : 'text-slate-200'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function VistaLista({ versiculos, onPraticar, onApagar }) {
  const ordenados = ordenarVersiculos(versiculos);
  const totalVencidos = versiculos.filter(estaVencido).length;
  const dominados = versiculos.filter(v => (v.nivel ?? 0) >= 5).length;

  return (
    <div>
      {/* Header da lista */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Meus Versículos</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {versiculos.length} versículo{versiculos.length !== 1 ? 's' : ''}
            {dominados > 0 && ` · ${dominados} dominado${dominados !== 1 ? 's' : ''}`}
          </p>
        </div>
        {totalVencidos > 0 && (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-semibold text-sm">
            <Bell size={15} />
            {totalVencidos} para revisar hoje
          </div>
        )}
      </div>

      {versiculos.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
          <BookOpen className="mx-auto h-14 w-14 text-slate-200 mb-4" />
          <p className="font-bold text-slate-600 text-lg">Nenhum versículo ainda</p>
          <p className="text-sm text-slate-400 mt-1">
            Clique em "Adicionar" para começar sua jornada de memorização.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ordenados.map((v) => {
            const vencido = estaVencido(v);
            const nivel = v.nivel ?? 0;
            return (
              <div
                key={v.id}
                className={`bg-white rounded-2xl shadow-sm border transition hover:shadow-md flex flex-col ${
                  vencido ? 'border-amber-200' : 'border-slate-100'
                }`}
              >
                <div
                  className="flex-1 p-4 cursor-pointer"
                  onClick={() => onPraticar(v)}
                >
                  {/* Top row */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-blue-800 text-base leading-tight">
                      {v.referencia}
                    </h3>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {vencido && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                          Revisar
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-3">
                    {v.texto}
                  </p>

                  {/* Stars + level */}
                  <div className="flex items-center gap-2">
                    <Estrelas nivel={nivel} />
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${NIVEL_CORES[nivel]}`}>
                      {NIVEL_LABELS[nivel]}
                    </span>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="px-4 pb-3 flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    {v.totalPraticas > 0
                      ? `${v.totalPraticas} prática${v.totalPraticas !== 1 ? 's' : ''}`
                      : 'Nunca praticado'}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onPraticar(v)}
                      className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition"
                      title="Praticar"
                    >
                      <Play size={14} />
                    </button>
                    <button
                      onClick={() => onApagar(v.id)}
                      className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition"
                      title="Apagar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
