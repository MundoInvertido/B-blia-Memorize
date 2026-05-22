import { useState, useEffect, useCallback } from 'react';

// Re-export for use by GerenciadorTags
export { CORES_TAG, EMOJIS_TAG };

const CORES_TAG = [
  { id: 'red',     bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300' },
  { id: 'orange',  bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  { id: 'amber',   bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300' },
  { id: 'yellow',  bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  { id: 'lime',    bg: 'bg-lime-100',   text: 'text-lime-700',   border: 'border-lime-300' },
  { id: 'green',   bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300' },
  { id: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  { id: 'teal',    bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-300' },
  { id: 'cyan',    bg: 'bg-cyan-100',   text: 'text-cyan-700',   border: 'border-cyan-300' },
  { id: 'sky',     bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-300' },
  { id: 'blue',    bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300' },
  { id: 'indigo',  bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  { id: 'violet',  bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
  { id: 'purple',  bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  { id: 'fuchsia', bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300' },
  { id: 'pink',    bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-300' },
  { id: 'rose',    bg: 'bg-rose-100',   text: 'text-rose-700',   border: 'border-rose-300' },
];

const EMOJIS_TAG = ['📖', '✝️', '🔥', '💧', '🌟', '⚔️', '👑', '🙏', '💓', '🌿', '⛪', '📿', '🕊️', '✝️', '✨', '💎'];

const INICIAL = {
  tags: [],
  pastas: [],
};

function chave(userId) {
  return `memo_biblia_tags_v1_${userId}`;
}

function carregar(userId) {
  try {
    const s = localStorage.getItem(chave(userId));
    return s ? { ...INICIAL, ...JSON.parse(s) } : INICIAL;
  } catch { return INICIAL; }
}

export function useTags(userId) {
  const [state, setState] = useState(() => carregar(userId));

  useEffect(() => {
    setState(carregar(userId));
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(chave(userId), JSON.stringify(state));
  }, [state, userId]);

  // Tag CRUD
  const criarTag = useCallback((nome, corId, emoji) => {
    setState(prev => ({
      ...prev,
      tags: [...prev.tags, { id: Date.now().toString(), nome, corId: corId || 'blue', emoji: emoji || '📖' }],
    }));
  }, []);

  const editarTag = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const apagarTag = useCallback((id) => {
    setState(prev => ({ ...prev, tags: prev.tags.filter(t => t.id !== id) }));
  }, []);

  // Coleção (Pasta) CRUD
  const criarPasta = useCallback((nome, corId, emoji) => {
    setState(prev => ({
      ...prev,
      pastas: [...prev.pastas, { id: Date.now().toString(), nome, corId: corId || 'blue', emoji: emoji || '📁' }],
    }));
  }, []);

  const editarPasta = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      pastas: prev.pastas.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const apagarPasta = useCallback((id) => {
    setState(prev => ({ ...prev, pastas: prev.pastas.filter(p => p.id !== id) }));
  }, []);

  const getTagCor = useCallback((corId) => {
    return CORES_TAG.find(c => c.id === corId) || CORES_TAG[4];
  }, []);

  const restaurar = useCallback((dados) => {
    if (dados && typeof dados === 'object') {
      setState({ ...INICIAL, ...dados });
    }
  }, []);

  return {
    tags: state.tags,
    pastas: state.pastas,
    criarTag,
    editarTag,
    apagarTag,
    criarPasta,
    editarPasta,
    apagarPasta,
    getTagCor,
    restaurar,
    CORES_TAG,
    EMOJIS_TAG,
  };
}