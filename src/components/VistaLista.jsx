import { useState } from 'react';
import { BookOpen, Play, Trash2, Bell, Copy, Check, Tag, X, Share2 } from 'lucide-react';
import { ordenarVersiculos, estaVencido, NIVEL_LABELS, NIVEL_CORES } from '../lib/srs';
import { SeletorTag } from './GerenciadorTags';
import { Share } from '@capacitor/share';

function Estrelas({ nivel, dark = false }) {
  return (
    <div className="flex gap-0.5" title={NIVEL_LABELS[nivel ?? 0]}>
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={`text-sm ${
            i < (nivel ?? 0)
              ? 'text-yellow-400'
              : dark
                ? 'text-white/20'
                : 'text-slate-200'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function BotaoCopiar({ texto, referencia, translucido = false }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`"${texto}" — ${referencia}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* sem permissão */ }
  };
  return (
    <button
      onClick={copiar}
      className={`p-2 rounded-lg transition ${
        copiado
          ? 'bg-green-100 text-green-600'
          : translucido
            ? 'bg-white/10 text-white/80 hover:bg-white/25 hover:text-white border border-white/10'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
      title="Copiar versículo"
    >
      {copiado ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function BotaoCompartilhar({ texto, referencia, translucido = false }) {
  const [compartilhado, setCompartilhado] = useState(false);
  
  const compartilhar = async (e) => {
    e.stopPropagation();
    const shareText = `"${texto}" — ${referencia}`;
    try {
      await Share.share({
        title: referencia,
        text: shareText,
        dialogTitle: 'Compartilhar versículo',
      });
      setCompartilhado(true);
      setTimeout(() => setCompartilhado(false), 2000);
    } catch {
      // Fallback para Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: referencia,
            text: shareText,
          });
          setCompartilhado(true);
          setTimeout(() => setCompartilhado(false), 2000);
        } catch {
          // Fallback para copiar
          try {
            await navigator.clipboard.writeText(shareText);
            setCompartilhado(true);
            setTimeout(() => setCompartilhado(false), 2000);
          } catch {}
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareText);
          setCompartilhado(true);
          setTimeout(() => setCompartilhado(false), 2000);
        } catch {}
      }
    }
  };

  return (
    <button
      onClick={compartilhar}
      className={`p-2 rounded-lg transition ${
        compartilhado
          ? 'bg-emerald-100 text-emerald-600'
          : translucido
            ? 'bg-white/10 text-white/80 hover:bg-white/25 hover:text-white border border-white/10'
            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
      }`}
      title="Compartilhar versículo"
    >
      {compartilhado ? <Check size={14} /> : <Share2 size={14} />}
    </button>
  );
}

export default function VistaLista({ versiculos, onPraticar, onApagar, atualizarVersiculo, tags = [], pastas = [], getTagCor }) {
  const [filtroTag, setFiltroTag] = useState(null);
  const [filtroPasta, setFiltroPasta] = useState(null);
  const [editandoTags, setEditandoTags] = useState(null); // verse id being edited
  const [tagsTemp, setTagsTemp] = useState([]);

  let ordenados = ordenarVersiculos(versiculos);

  // Apply filters
  if (filtroTag) {
    ordenados = ordenados.filter(v => (v.tags || []).includes(filtroTag));
  }
  if (filtroPasta) {
    ordenados = ordenados.filter(v => v.pastaId === filtroPasta);
  }

  const totalVencidos = versiculos.filter(estaVencido).length;
  const dominados = versiculos.filter(v => (v.nivel ?? 0) >= 5).length;

  const toggleTag = (tagId) => {
    setFiltroTag(prev => prev === tagId ? null : tagId);
  };

  const abrirEdicaoTags = (v) => {
    setTagsTemp([...(v.tags || [])]);
    setEditandoTags(v.id);
  };

  const salvarTags = () => {
    if (editandoTags && atualizarVersiculo) {
      atualizarVersiculo(editandoTags, { tags: tagsTemp });
    }
    setEditandoTags(null);
  };

  const toggleTagTemp = (tagId) => {
    setTagsTemp(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div>
      {/* Header da lista */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Meus Versículos</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {ordenados.length} versículo{ordenados.length !== 1 ? 's' : ''}
            {dominados > 0 && ` · ${dominados} dominado${dominados !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map(t => {
                const cor = getTagCor ? getTagCor(t.corId) : {};
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-all ${cor.bg || 'bg-blue-100'} ${filtroTag === t.id ? (cor.text || 'text-blue-700') : 'opacity-50 hover:opacity-80'}`}
                  >
                    {t.emoji} {t.nome}
                  </button>
                );
              })}
            </div>
          )}
          {filtroTag && (
            <button
              onClick={() => setFiltroTag(null)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <Tag size={10} /> Limpar filtro
            </button>
          )}
          {totalVencidos > 0 && (
            <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-semibold text-sm">
              <Bell size={15} />
              {totalVencidos} para revisar hoje
            </div>
          )}
        </div>
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

            const getImagemUrl = () => {
              if (!v.imagemUrl) return null;
              const url = v.imagemUrl.trim();
              if (url.startsWith('http://') || url.startsWith('https://')) return url;
              return `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(url)}`;
            };

            const imgUrl = getImagemUrl();
            const temImagem = !!imgUrl;

            const cardStyle = temImagem 
              ? { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.8)), url(${imgUrl})` }
              : {};

            const temFundo = temImagem || !!v.corFundo;

            const cardBgClass = temImagem
              ? 'bg-cover bg-center text-white border-none'
              : v.corFundo
                ? `bg-gradient-to-br ${v.corFundo} text-white border-none`
                : 'bg-white text-slate-700 border-slate-100';

            return (
              <div
                key={v.id}
                style={cardStyle}
                className={`${cardBgClass} rounded-2xl shadow-sm border transition hover:shadow-md flex flex-col relative overflow-hidden min-h-[190px] ${
                  vencido && !temFundo ? 'border-amber-200' : ''
                }`}
              >
                {!temImagem && v.corFundo && (
                  <div className="absolute inset-0 bg-white/5 opacity-10 pointer-events-none" />
                )}
                
                <div
                  className="flex-1 p-4 cursor-pointer flex flex-col justify-between"
                  onClick={() => onPraticar(v)}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className={`font-bold text-base leading-tight ${
                        temFundo ? 'text-white' : 'text-blue-800'
                      }`}>
                        {v.referencia}
                      </h3>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {vencido && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            temFundo 
                              ? 'bg-white/20 text-white backdrop-blur-sm' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            Revisar
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={`text-sm line-clamp-3 leading-relaxed mb-3 ${
                      temFundo ? 'text-white/90 font-medium' : 'text-slate-600'
                    }`}>
                      {v.texto}
                    </p>
                  </div>

                  <div>
                    {/* Tags */}
                    {(v.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {(v.tags || []).map(tagId => {
                          const tag = tags.find(t => t.id === tagId);
                          if (!tag) return null;
                          const cor = getTagCor ? getTagCor(tag.corId) : {};
                          return (
                            <span 
                              key={tagId} 
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                temFundo 
                                  ? 'bg-white/20 text-white border border-white/10' 
                                  : `${cor.bg || 'bg-blue-100'} ${cor.text || 'text-blue-700'}`
                              }`}
                            >
                              {tag.emoji} {tag.nome}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Stars + level */}
                    <div className="flex items-center gap-2">
                      <Estrelas nivel={nivel} dark={temFundo} />
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        temFundo 
                          ? 'bg-white/15 text-white' 
                          : NIVEL_CORES[nivel]
                      }`}>
                        {NIVEL_LABELS[nivel]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className={`px-4 pb-3 pt-2 flex justify-between items-center ${
                  temFundo ? 'border-t border-white/10' : 'border-t border-slate-50/50'
                }`}>
                  <span className={`text-xs ${temFundo ? 'text-white/60' : 'text-slate-400'}`}>
                    {v.totalPraticas > 0
                      ? `${v.totalPraticas} prática${v.totalPraticas !== 1 ? 's' : ''}`
                      : 'Nunca praticado'}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirEdicaoTags(v);
                      }}
                      className={`p-2 rounded-lg transition ${
                        temFundo 
                          ? 'bg-white/10 text-white/80 hover:bg-white/25 hover:text-white border border-white/10' 
                          : 'bg-purple-50 text-purple-500 hover:bg-purple-100'
                      }`}
                      title="Editar tags"
                    >
                      <Tag size={14} />
                    </button>
                    <BotaoCopiar texto={v.texto} referencia={v.referencia} translucido={temFundo} />
                    <BotaoCompartilhar texto={v.texto} referencia={v.referencia} translucido={temFundo} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPraticar(v);
                      }}
                      className={`p-2 rounded-lg transition ${
                        temFundo 
                          ? 'bg-white text-blue-900 hover:bg-white/95 shadow-sm' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                      title="Praticar"
                    >
                      <Play size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApagar(v.id);
                      }}
                      className={`p-2 rounded-lg transition ${
                        temFundo 
                          ? 'bg-red-500/20 text-red-200 hover:bg-red-500/30 hover:text-white border border-red-500/10' 
                          : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}
                      title="Apagar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Inline Tag Editor */}
                {editandoTags === v.id && (
                  <div className="px-4 pb-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500">Editar Tags</span>
                      <button onClick={() => setEditandoTags(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>
                    {tags.length > 0 ? (
                      <>
                        <SeletorTag
                          tags={tags}
                          tagsSelecionadas={tagsTemp}
                          onToggle={toggleTagTemp}
                          getTagCor={getTagCor}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setEditandoTags(null)}
                            className="flex-1 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={salvarTags}
                            className="flex-1 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold"
                          >
                            Salvar
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">Crie tags primeiro na tela de adicionar.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
