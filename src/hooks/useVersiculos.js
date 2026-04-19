import { useState, useEffect } from 'react';
import { aplicarSRS } from '../lib/srs';

const DADOS_INICIAIS = [
  {
    id: '1', referencia: 'João 3:16',
    texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    nivel: 0, proximaRevisao: null, totalPraticas: 0, ultimaPratica: null,
  },
  {
    id: '2', referencia: 'Salmos 23:1',
    texto: 'O Senhor é o meu pastor; nada me faltará.',
    nivel: 0, proximaRevisao: null, totalPraticas: 0, ultimaPratica: null,
  },
  {
    id: '3', referencia: 'Filipenses 4:13',
    texto: 'Posso todas as coisas naquele que me fortalece.',
    nivel: 0, proximaRevisao: null, totalPraticas: 0, ultimaPratica: null,
  },
];

function chave(userId) {
  return `memo_biblia_v1_${userId}`;
}

function carregar(userId) {
  try {
    const s = localStorage.getItem(chave(userId));
    return s ? JSON.parse(s) : DADOS_INICIAIS;
  } catch { return DADOS_INICIAIS; }
}

export function useVersiculos(userId) {
  const [versiculos, setVersiculos] = useState(() => carregar(userId));

  // Reload when user changes
  useEffect(() => {
    setVersiculos(carregar(userId));
  }, [userId]);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(chave(userId), JSON.stringify(versiculos));
  }, [versiculos, userId]);

  const adicionar = (referencia, texto) => {
    setVersiculos(prev => [
      ...prev,
      { id: Date.now().toString(), referencia: referencia.trim(), texto: texto.trim(),
        nivel: 0, proximaRevisao: null, totalPraticas: 0, ultimaPratica: null },
    ]);
  };

  const apagar = (id) => setVersiculos(prev => prev.filter(v => v.id !== id));

  const registrarPraticaVersiculo = (id, resultado) => {
    setVersiculos(prev => prev.map(v => v.id === id ? aplicarSRS(v, resultado) : v));
  };

  const restaurar = (dados) => {
    if (Array.isArray(dados)) setVersiculos(dados);
  };

  return { versiculos, adicionar, apagar, registrarPraticaVersiculo, restaurar };
}
