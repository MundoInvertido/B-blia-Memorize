import { useState } from 'react';
import { salvarConta, buscarContaPorNome } from '../lib/cloudSync';
import { firebaseConfigurado } from '../lib/firebase';

const CHAVE_USUARIOS = 'memo_biblia_usuarios_v1';
const CHAVE_ATIVO    = 'memo_biblia_ativo_v1';

export const CORES_USUARIO = [
  { id: 'blue',   bg: 'bg-blue-500',   label: 'Azul'     },
  { id: 'purple', bg: 'bg-purple-500', label: 'Roxo'     },
  { id: 'green',  bg: 'bg-green-500',  label: 'Verde'    },
  { id: 'rose',   bg: 'bg-rose-500',   label: 'Rosa'     },
  { id: 'orange', bg: 'bg-orange-500', label: 'Laranja'  },
  { id: 'teal',   bg: 'bg-teal-500',   label: 'Teal'     },
];

function hashSenha(senha) {
  if (!senha) return '';
  let h = 0;
  const s = senha + '_mb2026salt';
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(36).padStart(10, '0');
}

function normNome(nome) {
  return nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function lerUsuarios() {
  try { return JSON.parse(localStorage.getItem(CHAVE_USUARIOS) ?? '[]'); }
  catch { return []; }
}

function gravarUsuarios(lista) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));
}

export function useUsuarios() {
  const [usuarios, setUsuarios]       = useState(lerUsuarios);
  const [usuarioAtivo, setUsuarioAtivo] = useState(() => {
    const id = localStorage.getItem(CHAVE_ATIVO);
    if (!id) return null;
    return lerUsuarios().find(u => u.id === id) ?? null;
  });
  const [erro, setErro]               = useState('');
  const [autenticando, setAutenticando] = useState(false);

  // ── Criar conta ────────────────────────────────────────────────────────────
  const criarUsuario = async ({ nome, senha, cor = 'blue' }) => {
    setErro('');
    const nomeTrim = nome.trim();
    if (!nomeTrim)          { setErro('Digite um nome.'); return false; }
    if (nomeTrim.length < 2){ setErro('Nome muito curto (mínimo 2 caracteres).'); return false; }

    // Verificar duplicata local
    const lista = lerUsuarios();
    if (lista.some(u => u.nome.toLowerCase() === nomeTrim.toLowerCase())) {
      setErro('Esse nome já está em uso.'); return false;
    }

    // Verificar duplicata na nuvem
    if (firebaseConfigurado) {
      setAutenticando(true);
      const existe = await buscarContaPorNome(nomeTrim);
      setAutenticando(false);
      if (existe) { setErro('Esse nome já está em uso por outro usuário.'); return false; }
    }

    const novo = {
      id:        normNome(nomeTrim),
      nome:      nomeTrim,
      senhaHash: hashSenha(senha),
      temSenha:  !!senha,
      cor,
      criadoEm:  new Date().toISOString().split('T')[0],
    };
    const novaLista = [...lista, novo];
    gravarUsuarios(novaLista);
    setUsuarios(novaLista);
    localStorage.setItem(CHAVE_ATIVO, novo.id);
    setUsuarioAtivo(novo);
    salvarConta(novo); // salva na nuvem em background
    return true;
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async ({ nome, senha }) => {
    setErro('');
    const lista = lerUsuarios();
    let usuario = lista.find(u => u.nome.toLowerCase() === nome.trim().toLowerCase());

    if (!usuario) {
      // Não encontrado localmente → buscar na nuvem
      if (!firebaseConfigurado) { setErro('Usuário não encontrado.'); return false; }

      setAutenticando(true);
      const conta = await buscarContaPorNome(nome.trim());
      setAutenticando(false);

      if (!conta) { setErro('Usuário não encontrado.'); return false; }
      if (conta.temSenha && conta.senhaHash !== hashSenha(senha)) {
        setErro('Senha incorreta.'); return false;
      }

      // Restaurar usuário localmente
      usuario = {
        id:        normNome(conta.nome),
        nome:      conta.nome,
        senhaHash: conta.senhaHash,
        temSenha:  conta.temSenha,
        cor:       conta.cor,
        criadoEm:  conta.criadoEm,
      };
      const novaLista = [...lista, usuario];
      gravarUsuarios(novaLista);
      setUsuarios(novaLista);
    } else {
      if (usuario.temSenha && usuario.senhaHash !== hashSenha(senha)) {
        setErro('Senha incorreta.'); return false;
      }
    }

    localStorage.setItem(CHAVE_ATIVO, usuario.id);
    setUsuarioAtivo(usuario);
    return true;
  };

  const sair       = () => { localStorage.removeItem(CHAVE_ATIVO); setUsuarioAtivo(null); };
  const limparErro = () => setErro('');

  return { usuarios, usuarioAtivo, criarUsuario, login, sair, erro, limparErro, autenticando };
}
