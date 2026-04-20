import {
  doc, setDoc, collection, getDocs,
  query, orderBy, limit, onSnapshot,
} from 'firebase/firestore';
import { db, firebaseConfigurado } from './firebase';

// Salva progresso do usuário no Firestore (ranking público)
export async function sincronizarUsuario(usuario, gami, versiculos) {
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
    console.warn('Sync falhou (offline?):', e.message);
  }
}

// Busca top 50 do ranking em tempo real
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
  return onSnapshot(q, snap => {
    callback(snap.docs.map((d, i) => ({ posicao: i + 1, id: d.id, ...d.data() })));
  }, () => callback([]));
}
