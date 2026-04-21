import { useState, useEffect } from 'react';
import { aplicarSRS } from '../lib/srs';
import { buscarVersiculoLocal } from '../lib/bibleApi';

const DADOS_INICIAIS = [
  {
    id: '1', referencia: 'João 3:16',
    texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    versiculos: null, range: null,
    nivel: 0, proximaRevisao: null, totalPraticas: 0, ultimaPratica: null,
  },
  {
    id: '2', referencia: 'Salmos 23:1',
    texto: 'O Senhor é o meu pastor; nada me faltará.',
    versiculos: null, range: null,
    nivel: 0, proximaRevisao: null, totalPraticas: 0, ultimaPratica: null,
  },
  {
    id: '3', referencia: 'Filipenses 4:13',
    texto: 'Posso todas as coisas naquele que me fortalece.',
    versiculos: null, range: null,
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

// Detecta se é um intervalo (ex: "Sl 1:1-2", "João 3:16-18", "1Co 15:1-11", "Sl 1.1-2")
function parseIntervalo(referencia) {
  const match = referencia.trim().match(/^([1-3]\s*[a-zA-ZÀ-ÿ]+|[1-3]?[a-zA-ZÀ-ÿ]+)\s+(\d+)(?::(\d+(?:-(\d+))?)|\.(\d+(?:-(\d+))?))?$/);
  if (!match) return null;
  
  let livro = match[1].trim();
  livro = livro.replace(/^([1-3])([a-zA-ZÀ-ÿ])/i, '$1 $2');
  
  const [, , cap, v1, , , v2] = match;
  if (!v1) return null; // Não é intervalo
  
  const ini = parseInt(v1);
  const fim = v2 ? parseInt(v2) : ini;
  
  return { livro, cap: parseInt(cap), ini, fim };
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

  const adicionar = async (referencia, texto) => {
    const intervalo = parseIntervalo(referencia);
    
    // Se não é intervalo, adiciona normalmente
    if (!intervalo) {
      setVersiculos(prev => [
        ...prev,
        { id: Date.now().toString(), referencia: referencia.trim(), texto: texto.trim(),
          versiculos: null, range: null,
          nivel: 0, proximaRevisao: null, totalPraticas: 0, ultimaPratica: null },
      ]);
      return;
    }
    
    // É intervalo: buscar cada versículo e criar um registro com range
    const versiculosArray = [];
    const traducao = localStorage.getItem(`memo_biblia_traducao_${userId}`) || 'almeida';
    
    for (let v = intervalo.ini; v <= intervalo.fim; v++) {
      const ref = `${intervalo.livro} ${intervalo.cap}:${v}`;
      try {
        const resultado = await buscarVersiculoLocal(ref, traducao);
        versiculosArray.push({ ref: ref, texto: resultado.texto });
      } catch (e) {
        console.error(`Erro ao buscar ${ref}:`, e);
        versiculosArray.push({ ref: ref, texto: `[${ref}]` });
      }
    }
    
    // Une todos os textos para display
    const textoCompleto = versiculosArray.map(v => v.texto).join(' ');
    
    setVersiculos(prev => [
      ...prev,
      { 
        id: Date.now().toString(), 
        referencia: referencia.trim(), 
        texto: textoCompleto,
        versiculos: versiculosArray,
        range: { ini: intervalo.ini, fim: intervalo.fim },
        nivel: 0, proximaRevisao: null, totalPraticas: 0, ultimaPratica: null
      },
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
