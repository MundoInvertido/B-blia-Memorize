import {
  doc, setDoc, getDoc, collection,
  query, orderBy, limit, onSnapshot,
} from 'firebase/firestore';
import { db, firebaseConfigurado } from './firebase';

// ── Contas de usuário (login cross-device) ───────────────────────────────────

function normNome(nome) {
  return nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export async function salvarConta(usuario) {
  if (!firebaseConfigurado || !db) return;
  try {
    await setDoc(doc(db, 'contas', normNome(usuario.nome)), {
      userId:    usuario.id,
      nome:      usuario.nome,
      senhaHash: usuario.senhaHash,
      temSenha:  usuario.temSenha,
      cor:       usuario.cor,
      criadoEm:  usuario.criadoEm,
    });
  } catch (e) {
    console.warn('salvarConta falhou:', e.message);
  }
}

export async function buscarContaPorNome(nome) {
  if (!firebaseConfigurado || !db) return null;
  try {
    const snap = await getDoc(doc(db, 'contas', normNome(nome)));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}
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

export async function buscarRanking() {
  const projectId = 'memobiblia-59245';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/ranking?limit=50`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.documents) return [];

    const docs = data.documents.map(doc => {
      const f = doc.fields || {};
      return {
        id: doc.name.split('/').pop(),
        nome: f.nome?.stringValue || '',
        xpTotal: Number(f.xpTotal?.integerValue || f.xpTotal?.doubleValue || 0),
        versiculosDominados: Number(f.versiculosDominados?.integerValue || 0),
        streakAtual: Number(f.streakAtual?.integerValue || 0),
        totalPraticas: Number(f.totalPraticas?.integerValue || 0),
      };
    });

    docs.sort((a, b) => b.xpTotal - a.xpTotal || b.versiculosDominados - a.versiculosDominados);
    return docs;
  } catch {
    return [];
  }
}

export function ouvirRanking(callback) {
  if (!firebaseConfigurado || !db) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'ranking'), orderBy('versiculosDominados', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => {
      const f = d.data();
      return {
        id: d.id,
        nome: f.nome || '',
        xpTotal: f.xpTotal ?? 0,
        versiculosDominados: f.versiculosDominados ?? 0,
        streakAtual: f.streakAtual ?? 0,
        totalPraticas: f.totalPraticas ?? 0,
      };
    });
    callback(docs);
  });
}
