import {
  doc, setDoc, getDoc, collection,
  query, orderBy, limit, onSnapshot,
} from 'firebase/firestore';
import { db, firebaseConfigurado } from './firebase';

// ── Backup completo ──────────────────────────────────────────────────────────

export async function salvarDadosNuvem(userId, { nome, versiculos, gami, traducao }) {
  if (!firebaseConfigurado || !db) return;
  try {
    await setDoc(doc(db, 'usuarios', userId), {
      userId,
      nome,
      versiculos,
      gami:        { ...gami, novasConquistas: [] }, // não salvar notificações temporárias
      traducao,
      atualizadoEm: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Backup falhou (offline?):', e.message);
  }
}

export async function carregarDadosNuvem(userId) {
  if (!firebaseConfigurado || !db) return null;
  try {
    const snap = await getDoc(doc(db, 'usuarios', userId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn('Restauração falhou:', e.message);
    return null;
  }
}

// ── Ranking público ──────────────────────────────────────────────────────────

export async function sincronizarRanking(usuario, gami, versiculos) {
  if (!firebaseConfigurado || !db) return;
  try {
    await setDoc(doc(db, 'ranking', usuario.id), {
      nome:                usuario.nome,
      xpTotal:             gami.xpTotal ?? 0,
      streakAtual:         gami.streakAtual ?? 0,
      streakMaximo:        gami.streakMaximo ?? 0,
      totalVersiculos:     versiculos.length,
      versiculosDominados: versiculos.filter(v => (v.nivel ?? 0) >= 5).length,
      totalPraticas:       gami.totalPraticas ?? 0,
      atualizadoEm:        new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Ranking sync falhou:', e.message);
  }
}

export function ouvirRanking(callback) {
  if (!firebaseConfigurado || !db) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'ranking'),
    orderBy('versiculosDominados', 'desc'),
    orderBy('xpTotal', 'desc'),
    limit(50),
  );
  return onSnapshot(
    q,
    snap => callback(snap.docs.map((d, i) => ({ posicao: i + 1, id: d.id, ...d.data() }))),
    () => callback([]),
  );
}
