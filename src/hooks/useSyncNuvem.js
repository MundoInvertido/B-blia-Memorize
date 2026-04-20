import { useEffect, useRef, useState } from 'react';
import { salvarDadosNuvem, carregarDadosNuvem } from '../lib/cloudSync';
import { firebaseConfigurado } from '../lib/firebase';

// Debounce: salva na nuvem 3s após a última mudança
const DEBOUNCE_MS = 3000;

export function useSyncNuvem(usuario, versiculos, gami, traducao, restaurarV, restaurarG, setTraducao) {
  const timerRef     = useRef(null);
  const iniciadoRef  = useRef(false);
  const [statusSync, setStatusSync] = useState('idle'); // idle | salvando | salvo | erro

  // ── Restauração inicial: ao montar, tenta carregar da nuvem ──────────────
  useEffect(() => {
    if (!firebaseConfigurado || !usuario?.id) return;

    carregarDadosNuvem(usuario.id).then(dados => {
      if (!dados) return;

      const localMais  = versiculos.length > 0;
      const nuvemData  = dados.atualizadoEm ?? '';
      const localData  = localStorage.getItem(`memo_biblia_sync_ts_${usuario.id}`) ?? '';

      // Usa nuvem se: local está vazio OU nuvem é mais recente
      if (!localMais || nuvemData > localData) {
        if (dados.versiculos?.length) restaurarV(dados.versiculos);
        if (dados.gami)              restaurarG(dados.gami);
        if (dados.traducao)          setTraducao(dados.traducao);
      }

      iniciadoRef.current = true;
    });
  }, [usuario?.id]);

  // ── Auto-backup com debounce após cada mudança ───────────────────────────
  useEffect(() => {
    if (!firebaseConfigurado || !usuario?.id || !iniciadoRef.current) return;

    clearTimeout(timerRef.current);
    setStatusSync('pendente');

    timerRef.current = setTimeout(async () => {
      setStatusSync('salvando');
      await salvarDadosNuvem(usuario.id, {
        nome: usuario.nome,
        versiculos,
        gami,
        traducao,
      });
      const ts = new Date().toISOString();
      localStorage.setItem(`memo_biblia_sync_ts_${usuario.id}`, ts);
      setStatusSync('salvo');
      setTimeout(() => setStatusSync('idle'), 3000);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [versiculos, gami.xpTotal, gami.totalPraticas, traducao]);

  return { statusSync };
}
