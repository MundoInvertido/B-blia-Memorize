import { useState, useEffect } from 'react';
import { TRADUCAO_PADRAO } from '../lib/bibleApi';

function chave(userId) { return `memo_biblia_traducao_${userId}`; }

export function useTraducao(userId) {
  const [traducao, setTraducaoState] = useState(() => {
    return localStorage.getItem(chave(userId)) ?? TRADUCAO_PADRAO;
  });

  useEffect(() => {
    setTraducaoState(localStorage.getItem(chave(userId)) ?? TRADUCAO_PADRAO);
  }, [userId]);

  const setTraducao = (id) => {
    localStorage.setItem(chave(userId), id);
    setTraducaoState(id);
  };

  return { traducao, setTraducao };
}
