import { useState, useRef } from 'react';
import { useUsuarios } from './hooks/useUsuarios';
import { useVersiculos } from './hooks/useVersiculos';
import { useGamificacao } from './hooks/useGamificacao';
import { useTraducao } from './hooks/useTraducao';
import TelaLogin from './components/TelaLogin';
import Navegacao from './components/Navegacao';
import Sidebar from './components/Sidebar';
import NotificacaoConquista from './components/NotificacaoConquista';
import VistaLista from './components/VistaLista';
import VistaAdicionar from './components/VistaAdicionar';
import VistaMenuPratica from './components/VistaMenuPratica';
import VistaPratica from './components/VistaPratica';

// ─── AppConteudo: re-montado com key quando o usuário muda ───────────────────
function AppConteudo({ usuario, onSair }) {
  const { versiculos, adicionar, apagar, registrarPraticaVersiculo, restaurar: restaurarV } = useVersiculos(usuario.id);
  const { gami, praticasHoje, registrarPratica, limparNovasConquistas, restaurar: restaurarG } = useGamificacao(versiculos, usuario.id);
  const { traducao, setTraducao } = useTraducao(usuario.id);

  const [vista, setVista] = useState('lista');
  const [versiculoAtivo, setVersiculoAtivo] = useState(null);
  const [modoPratica, setModoPratica] = useState(null);
  const importInputRef = useRef(null);

  const irParaLista = () => { setVista('lista'); setVersiculoAtivo(null); setModoPratica(null); };
  const abrirMenuPratica = (v) => { setVersiculoAtivo(v); setVista('menu_pratica'); };
  const iniciarPratica = (modo) => { setModoPratica(modo); setVista('pratica'); };

  const handleConcluir = (resultado) => {
    registrarPraticaVersiculo(versiculoAtivo.id, resultado);
    registrarPratica(resultado);
    irParaLista();
  };

  // ── Export ──
  const handleExportar = () => {
    const dados = {
      versao: '1.0',
      usuario: usuario.nome,
      exportadoEm: new Date().toISOString(),
      versiculos,
      gamificacao: gami,
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `memo-biblia-${usuario.nome}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import ──
  const handleImportar = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const dados = JSON.parse(ev.target.result);
        if (dados.versiculos) restaurarV(dados.versiculos);
        if (dados.gamificacao) restaurarG(dados.gamificacao);
        alert('✅ Dados importados com sucesso!');
      } catch {
        alert('❌ Arquivo inválido. Use um backup exportado pelo MemoBíblia.');
      }
    };
    reader.readAsText(arquivo);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Navegacao
        vista={vista}
        irParaLista={irParaLista}
        irParaAdicionar={() => setVista('adicionar')}
        gami={gami}
        usuario={usuario}
      />

      {gami.novasConquistas?.length > 0 && (
        <NotificacaoConquista conquistas={gami.novasConquistas} onDismiss={limparNovasConquistas} />
      )}

      {/* Hidden file input for import */}
      <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={handleImportar} />

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6 items-start">
        <Sidebar
          gami={gami}
          versiculos={versiculos}
          praticasHoje={praticasHoje}
          usuario={usuario}
          onSair={onSair}
          onExportar={handleExportar}
          onImportar={() => importInputRef.current?.click()}
        />

        <main className="flex-1 min-w-0 pb-8">
          {vista === 'lista' && (
            <VistaLista versiculos={versiculos} onPraticar={abrirMenuPratica} onApagar={apagar} />
          )}
          {vista === 'adicionar' && (
            <VistaAdicionar
              traducao={traducao}
              setTraducao={setTraducao}
              onAdicionar={(r, t) => { adicionar(r, t); irParaLista(); }}
              onVoltar={irParaLista}
            />
          )}
          {vista === 'menu_pratica' && versiculoAtivo && (
            <VistaMenuPratica versiculo={versiculoAtivo} onIniciar={iniciarPratica} onVoltar={irParaLista} />
          )}
          {vista === 'pratica' && versiculoAtivo && (
            <VistaPratica versiculo={versiculoAtivo} modo={modoPratica} onVoltar={() => abrirMenuPratica(versiculoAtivo)} onConcluir={handleConcluir} />
          )}
        </main>
      </div>
    </div>
  );
}

// ─── App raiz ────────────────────────────────────────────────────────────────
export default function App() {
  const { usuarios, usuarioAtivo, criarUsuario, login, sair, erro, limparErro } = useUsuarios();

  if (!usuarioAtivo) {
    return (
      <TelaLogin
        usuarios={usuarios}
        onLogin={login}
        onCriar={criarUsuario}
        erro={erro}
        limparErro={limparErro}
      />
    );
  }

  return <AppConteudo key={usuarioAtivo.id} usuario={usuarioAtivo} onSair={sair} />;
}
