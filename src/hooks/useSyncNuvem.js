import { useEffect, useRef, useState } from 'react';
import { salvarDadosNuvem, carregarDadosNuvem } from '../lib/cloudSync';
import { firebaseConfigurado } from '../lib/firebase';

const DEBOUNCE_MS = 3000;

export function useSyncNuvem(usuario, versiculos, gami, traducao, restaurarV, restaurarG, setTraducao) {
  const timerRef    = useRef(null);
  const iniciadoRef = useRef(false);
  const [statusSync, setStatusSync] = useState('idle');

  // ── Inicialização: compara local vs nuvem e decide quem vence ─────────────
  useEffect(() => {
    if (!usuario?.id) return;

    if (!firebaseConfigurado) {
      iniciadoRef.current = true;
      return;
    }

    carregarDadosNuvem(usuario.id).then(dados => {
      const nuvemTs  = dados?.atualizadoEm ?? '';
      const localTs  = localStorage.getItem(`memo_biblia_sync_ts_${usuario.id}`) ?? '';
      const nuvemTemDados = (dados?.versiculos?.length ?? 0) > 0;
      const localTemDados = versiculos.length > 0;

      // Primeiro acesso: nunca sincronizou timestamp = restaurar sempre da nuvem se houver dados
      const primeiroAcesso = !localTs;

      const nuvemMaisRecente = nuvemTs && (!localTs || nuvemTs > localTs);

      if (nuvemTemDados && (nuvemMaisRecente || primeiroAcesso)) {
        // Nuvem é mais recente,(localTs não existe), ou é primeiro acesso → restaurar da nuvem
        if (dados.versiculos?.length) restaurarV(dados.versiculos);
        if (dados.gami)               restaurarG(dados.gami);
        if (dados.traducao)           setTraducao(dados.traducao);
        // Salvar timestamp local após restauração
        const ts = new Date().toISOString();
        localStorage.setItem(`memo_biblia_sync_ts_${usuario.id}`, ts);
        iniciadoRef.current = true;
      } else if (localTemDados) {
        // Local é mais recente ou nuvem está vazia → fazer upload imediato
        iniciadoRef.current = true;
        setStatusSync('salvando');
        salvarDadosNuvem(usuario.id, { nome: usuario.nome, versiculos, gami, traducao })
          .then(() => {
            const ts = new Date().toISOString();
            localStorage.setItem(`memo_biblia_sync_ts_${usuario.id}`, ts);
            setStatusSync('salvo');
            setTimeout(() => setStatusSync('idle'), 3000);
          })
          .catch(() => setStatusSync('erro'));
      } else {
        iniciadoRef.current = true;
      }
    });
  }, [usuario?.id]);

  // ── Auto-backup com debounce após cada mudança ───────────────────────────
  useEffect(() => {
    if (!firebaseConfigurado || !usuario?.id || !iniciadoRef.current) return;

    clearTimeout(timerRef.current);
    setStatusSync('pendente');

    timerRef.current = setTimeout(async () => {
      setStatusSync('salvando');
      try {
        await salvarDadosNuvem(usuario.id, { nome: usuario.nome, versiculos, gami, traducao });
        const ts = new Date().toISOString();
        localStorage.setItem(`memo_biblia_sync_ts_${usuario.id}`, ts);
        setStatusSync('salvo');
        setTimeout(() => setStatusSync('idle'), 3000);
      } catch {
        setStatusSync('erro');
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [versiculos, gami?.xpTotal, gami?.totalPraticas, traducao]);

  return { statusSync };
}
