import { useState } from 'react';
import { Plus, X, Tag, Folder } from 'lucide-react';
import { CORES_TAG, EMOJIS_TAG } from '../hooks/useTags';

function SeletorCor({ cores, corSelecionada, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {cores.map(c => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={`w-6 h-6 rounded-full ${c.bg} transition-all ${corSelecionada === c.id ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'hover:scale-105'}`}
          title={c.id}
        />
      ))}
    </div>
  );
}

function ModalCriarTag({ onCriar, onFechar, modo = 'tag' }) {
  const [nome, setNome] = useState('');
  const [corId, setCorId] = useState('blue');
  const [emoji, setEmoji] = useState(EMOJIS_TAG[0]);

  const criar = () => {
    if (!nome.trim()) return;
    onCriar(nome.trim(), corId, emoji);
    onFechar();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {modo === 'pasta' ? <Folder size={18} /> : <Tag size={18} />}
            Nova {modo === 'pasta' ? 'Coleção' : 'Tag'}
          </h3>
          <button onClick={onFechar} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && criar()}
              placeholder={modo === 'pasta' ? 'Ex: Salmos de Guerra' : 'Ex: Fé'}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Emoji</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS_TAG.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${emoji === e ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Cor</label>
            <SeletorCor cores={CORES_TAG} corSelecionada={corId} onSelect={setCorId} />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onFechar}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={criar}
            disabled={!nome.trim()}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-40"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}

export function GerenciadorTags({ tags, pastas, onCriarTag, onEditarTag, onApagarTag, onCriarPasta, onEditarPasta, onApagarPasta, getTagCor }) {
  const [modalAberto, setModalAberto] = useState(null); // 'tag' | 'pasta' | null

  return (
    <>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setModalAberto('tag')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition"
        >
          <Tag size={12} /> Nova Tag
        </button>
        <button
          onClick={() => setModalAberto('pasta')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition"
        >
          <Folder size={12} /> Nova Coleção
        </button>
      </div>

      {tags.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => {
              const cor = getTagCor(t.corId);
              return (
                <span
                  key={t.id}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${cor.bg} ${cor.text}`}
                >
                  {t.emoji} {t.nome}
                  <button
                    onClick={() => onApagarTag(t.id)}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {pastas.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Coleções</p>
          <div className="flex flex-wrap gap-1.5">
            {pastas.map(p => {
              const cor = getTagCor(p.corId);
              return (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${cor.bg} ${cor.text}`}
                >
                  {p.emoji} {p.nome}
                  <button
                    onClick={() => onApagarPasta(p.id)}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {modalAberto === 'tag' && (
        <ModalCriarTag
          modo="tag"
          onCriar={(nome, corId, emoji) => onCriarTag(nome, corId, emoji)}
          onFechar={() => setModalAberto(null)}
        />
      )}
      {modalAberto === 'pasta' && (
        <ModalCriarTag
          modo="pasta"
          onCriar={(nome, corId, emoji) => onCriarPasta(nome, corId, emoji)}
          onFechar={() => setModalAberto(null)}
        />
      )}
    </>
  );
}

export function SeletorTag({ tags, tagsSelecionadas, onToggle, getTagCor }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(t => {
        const cor = getTagCor(t.corId);
        const selecionada = tagsSelecionadas.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onToggle(t.id)}
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-all ${cor.bg} ${selecionada ? cor.text : 'opacity-50'} ${selecionada ? '' : 'hover:opacity-80'}`}
          >
            {t.emoji} {t.nome}
          </button>
        );
      })}
    </div>
  );
}

export default GerenciadorTags;