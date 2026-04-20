import { useState } from 'react';
import { BookOpen, Plus, LogIn, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { CORES_USUARIO } from '../hooks/useUsuarios';
import { firebaseConfigurado } from '../lib/firebase';

export default function TelaLogin({ usuarios, onLogin, onCriar, erro, limparErro, autenticando }) {
  const [modo, setModo]                   = useState(usuarios.length === 0 ? 'criar' : 'selecionar');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [nome, setNome]                   = useState('');
  const [senha, setSenha]                 = useState('');
  const [confirmar, setConfirmar]         = useState('');
  const [corSelecionada, setCorSelecionada] = useState('blue');
  const [mostrarSenha, setMostrarSenha]   = useState(false);
  const [erroLocal, setErroLocal]         = useState('');

  const mudarModo = (m) => {
    setModo(m); setUsuarioSelecionado(null);
    setNome(''); setSenha(''); setConfirmar('');
    setErroLocal(''); limparErro();
  };

  const handleSelecionar = (u) => {
    setUsuarioSelecionado(u); setNome(u.nome); setSenha('');
    setErroLocal(''); limparErro();
    if (!u.temSenha) onLogin({ nome: u.nome, senha: '' });
  };

  const handleEntrar = (e) => {
    e.preventDefault();
    onLogin({ nome: nome.trim(), senha });
  };

  const handleCriar = (e) => {
    e.preventDefault();
    setErroLocal('');
    if (senha && senha !== confirmar) { setErroLocal('As senhas não coincidem.'); return; }
    onCriar({ nome: nome.trim(), senha, cor: corSelecionada });
  };

  const erroMostrado = erroLocal || erro;
  const corAtual     = CORES_USUARIO.find(c => c.id === corSelecionada) ?? CORES_USUARIO[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="flex items-center gap-3 text-white mb-8">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
          <BookOpen size={30} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black leading-none">MemoBíblia</h1>
          <p className="text-blue-200 text-sm mt-0.5">Memorize a Palavra de Deus</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {usuarios.length > 0 && (
            <button onClick={() => mudarModo('selecionar')}
              className={`flex-1 py-3.5 text-sm font-bold transition ${modo !== 'criar' ? 'text-blue-700 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Entrar
            </button>
          )}
          <button onClick={() => mudarModo('criar')}
            className={`flex-1 py-3.5 text-sm font-bold transition ${modo === 'criar' ? 'text-blue-700 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Criar conta
          </button>
        </div>

        <div className="p-6">

          {/* Loading overlay */}
          {autenticando && (
            <div className="flex flex-col items-center gap-3 py-8 text-slate-500">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <p className="text-sm font-medium">Verificando na nuvem...</p>
            </div>
          )}

          {/* Selecionar perfil local */}
          {!autenticando && modo === 'selecionar' && !usuarioSelecionado && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 mb-4">Escolha seu perfil:</p>
              {usuarios.map(u => {
                const cor = CORES_USUARIO.find(c => c.id === u.cor) ?? CORES_USUARIO[0];
                return (
                  <button key={u.id} onClick={() => handleSelecionar(u)}
                    className="w-full flex items-center gap-3 p-3.5 border-2 border-slate-100 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition text-left"
                  >
                    <div className={`w-10 h-10 ${cor.bg} rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
                      {u.nome[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{u.nome}</p>
                      <p className="text-xs text-slate-400">Desde {u.criadoEm} · {u.temSenha ? 'com senha' : 'sem senha'}</p>
                    </div>
                    <LogIn size={16} className="ml-auto text-slate-300" />
                  </button>
                );
              })}

              {/* Login por nome (outro dispositivo) */}
              <div className="pt-2 border-t border-slate-100">
                <button onClick={() => mudarModo('nome')}
                  className="w-full text-xs text-blue-500 hover:underline py-2"
                >
                  Entrar com outro nome (outro dispositivo)
                </button>
              </div>
            </div>
          )}

          {/* Login por nome */}
          {!autenticando && modo === 'nome' && (
            <form onSubmit={handleEntrar} className="space-y-4">
              <p className="text-sm text-slate-500">Digite seu nome para buscar na nuvem:</p>
              <input type="text" placeholder="Seu nome" value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                required autoFocus
              />
              <div className="relative">
                <input type={mostrarSenha ? 'text' : 'password'} placeholder="Senha (se tiver)"
                  value={senha} onChange={e => setSenha(e.target.value)}
                  className="w-full p-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <button type="button" onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {erroMostrado && <p className="text-red-500 text-sm">{erroMostrado}</p>}
              <button type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <LogIn size={16} /> Entrar
              </button>
              <button type="button" onClick={() => mudarModo('selecionar')}
                className="w-full text-slate-400 text-sm hover:text-slate-600 transition"
              >
                Voltar
              </button>
            </form>
          )}

          {/* Digitar senha após selecionar perfil */}
          {!autenticando && modo === 'selecionar' && usuarioSelecionado && (
            <form onSubmit={handleEntrar} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 ${CORES_USUARIO.find(c => c.id === usuarioSelecionado.cor)?.bg ?? 'bg-blue-500'} rounded-xl flex items-center justify-center text-white font-black text-xl`}>
                  {usuarioSelecionado.nome[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{usuarioSelecionado.nome}</p>
                  <button type="button" onClick={() => setUsuarioSelecionado(null)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Trocar perfil
                  </button>
                </div>
              </div>
              <div className="relative">
                <input type={mostrarSenha ? 'text' : 'password'} placeholder="Senha"
                  value={senha} onChange={e => setSenha(e.target.value)}
                  className="w-full p-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  autoFocus
                />
                <button type="button" onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {erroMostrado && <p className="text-red-500 text-sm">{erroMostrado}</p>}
              <button type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Entrar
              </button>
            </form>
          )}

          {/* Criar conta */}
          {!autenticando && modo === 'criar' && (
            <form onSubmit={handleCriar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nome</label>
                <input type="text" placeholder="Seu nome" value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Senha <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <div className="relative">
                  <input type={mostrarSenha ? 'text' : 'password'} placeholder="Deixe em branco para sem senha"
                    value={senha} onChange={e => setSenha(e.target.value)}
                    className="w-full p-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <button type="button" onClick={() => setMostrarSenha(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {senha && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirmar senha</label>
                  <input type={mostrarSenha ? 'text' : 'password'} placeholder="Repita a senha"
                    value={confirmar} onChange={e => setConfirmar(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Cor do perfil</label>
                <div className="flex gap-2">
                  {CORES_USUARIO.map(c => (
                    <button key={c.id} type="button" onClick={() => setCorSelecionada(c.id)}
                      className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center transition-transform ${corSelecionada === c.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                    >
                      {corSelecionada === c.id && <Check size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              {nome && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={`w-10 h-10 ${corAtual.bg} rounded-xl flex items-center justify-center text-white font-black text-lg`}>
                    {nome[0]?.toUpperCase()}
                  </div>
                  <p className="font-bold text-slate-700">{nome}</p>
                </div>
              )}
              {erroMostrado && <p className="text-red-500 text-sm">{erroMostrado}</p>}
              <button type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition"
              >
                <Plus size={16} className="inline mr-1" /> Criar conta e entrar
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-blue-300 text-xs mt-6 text-center">
        {firebaseConfigurado
          ? '☁️ Login sincronizado entre dispositivos'
          : 'Dados salvos localmente neste dispositivo'}
      </p>
    </div>
  );
}
