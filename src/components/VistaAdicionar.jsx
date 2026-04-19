import { useState } from 'react';
import { Plus, ArrowLeft, Search, Loader2, AlertCircle, CheckCircle, ChevronDown, ExternalLink, ClipboardPaste } from 'lucide-react';
import { buscarVersiculo, TRADUCOES, urlYouVersion } from '../lib/bibleApi';

export default function VistaAdicionar({ traducao, setTraducao, onAdicionar, onVoltar }) {
  const [referencia, setReferencia] = useState('');
  const [texto, setTexto]           = useState('');
  const [buscando, setBuscando]     = useState(false);
  const [erroBusca, setErroBusca]   = useState('');
  const [textoBuscado, setTextoBuscado] = useState(false);
  const [yvAberto, setYvAberto]     = useState(false);

  const traducaoAtual = TRADUCOES.find(t => t.id === traducao) ?? TRADUCOES[0];
  const usaYouVersion = !traducaoAtual.autoFetch && !!traducaoAtual.yvId;

  const buscar = async () => {
    if (!referencia.trim() || !traducaoAtual.autoFetch) return;
    setBuscando(true);
    setErroBusca('');
    setTextoBuscado(false);
    try {
      const resultado = await buscarVersiculo(referencia.trim(), traducao);
      setTexto(resultado);
      setTextoBuscado(true);
    } catch (err) {
      setErroBusca(err.message);
    } finally {
      setBuscando(false);
    }
  };

  const abrirYouVersion = () => {
    const url = urlYouVersion(referencia, traducaoAtual.yvId);
    window.open(url, '_blank', 'noopener');
    setYvAberto(true);
  };

  const colarDaArea = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText.trim()) {
        setTexto(clipText.trim());
        setTextoBuscado(true);
      }
    } catch {
      // Permissão negada — usuário cola manualmente
      alert('Cole o texto copiado do YouVersion no campo "Texto do Versículo".');
    }
  };

  const submeter = (e) => {
    e.preventDefault();
    if (referencia.trim() && texto.trim()) onAdicionar(referencia, texto);
  };

  const handleChangeRef = (e) => {
    setReferencia(e.target.value);
    setTextoBuscado(false);
    setErroBusca('');
    setYvAberto(false);
  };

  return (
    <div>
      <button onClick={onVoltar} className="text-blue-600 font-medium mb-5 flex items-center gap-1 hover:underline">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" /> Novo Versículo
        </h2>

        <form onSubmit={submeter} className="space-y-5">

          {/* Tradução */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tradução da Bíblia</label>
            <div className="relative">
              <select
                value={traducao}
                onChange={e => { setTraducao(e.target.value); setTextoBuscado(false); setErroBusca(''); setYvAberto(false); }}
                className="w-full appearance-none p-3 pr-10 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium cursor-pointer"
              >
                {TRADUCOES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.idioma}  {t.nome}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Referência */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Referência</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: João 3:16 ou Salmos 23:1"
                value={referencia}
                onChange={handleChangeRef}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), traducaoAtual.autoFetch ? buscar() : abrirYouVersion())}
                className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                required
                autoFocus
              />

              {/* Botão: busca automática */}
              {traducaoAtual.autoFetch && (
                <button
                  type="button"
                  onClick={buscar}
                  disabled={buscando || !referencia.trim()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
                >
                  {buscando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              )}

              {/* Botão: abrir YouVersion */}
              {usaYouVersion && (
                <button
                  type="button"
                  onClick={abrirYouVersion}
                  disabled={!referencia.trim()}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
                  title="Abrir no YouVersion (bible.com)"
                >
                  <ExternalLink size={16} />
                  <span className="hidden sm:inline">YouVersion</span>
                </button>
              )}
            </div>

            {erroBusca && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle size={14} /><span>{erroBusca}</span>
              </div>
            )}
            {textoBuscado && !erroBusca && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle size={14} />
                <span>Texto pronto via <strong>{traducaoAtual.nome}</strong>. Confira e salve.</span>
              </div>
            )}
          </div>

          {/* Banner passo a passo — YouVersion */}
          {usaYouVersion && (
            <div className={`rounded-2xl border-2 p-4 transition-all ${yvAberto ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="text-orange-500">📖</span>
                Como usar o YouVersion para {traducaoAtual.nome.split(' (')[0]}:
              </p>
              <ol className="space-y-2 text-sm text-slate-600">
                <li className={`flex items-start gap-2 ${!referencia.trim() ? 'opacity-40' : ''}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${referencia.trim() ? 'bg-orange-500 text-white' : 'bg-slate-300 text-white'}`}>1</span>
                  Digite a referência acima e clique <strong className="text-orange-600">YouVersion</strong> — o versículo abre no site.
                </li>
                <li className={`flex items-start gap-2 ${!yvAberto ? 'opacity-40' : ''}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${yvAberto ? 'bg-orange-500 text-white' : 'bg-slate-300 text-white'}`}>2</span>
                  No YouVersion, <strong>selecione o texto</strong> do versículo e copie (Ctrl+C / long press → Copiar).
                </li>
                <li className="flex items-start gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${texto ? 'bg-green-500 text-white' : 'bg-slate-300 text-white'}`}>3</span>
                  Cole abaixo ou clique o botão <strong>Colar texto</strong>.
                </li>
              </ol>

              {yvAberto && (
                <button
                  type="button"
                  onClick={colarDaArea}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-2.5 rounded-xl hover:bg-orange-600 transition text-sm animate-fade-in"
                >
                  <ClipboardPaste size={16} /> Colar texto copiado
                </button>
              )}
            </div>
          )}

          {/* Texto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Texto do Versículo</label>
            <textarea
              rows={5}
              placeholder={
                usaYouVersion
                  ? 'Cole aqui o texto copiado do YouVersion...'
                  : traducaoAtual.autoFetch
                    ? 'Preenchido automaticamente após buscar, ou cole manualmente...'
                    : 'Cole o texto do versículo aqui...'
              }
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm leading-relaxed"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-sm"
          >
            Salvar Versículo
          </button>
        </form>
      </div>
    </div>
  );
}
