import { useState } from 'react';
import { Plus, ArrowLeft, Search, Loader2, AlertCircle, CheckCircle, ChevronDown, BookOpen, Zap } from 'lucide-react';
import { buscarVersiculo, buscarVersiculoLocal, TRADUCOES, urlYouVersion } from '../lib/bibleApi';
import ModalBiblia from './ModalBiblia';

export default function VistaAdicionar({ traducao, setTraducao, onAdicionar, onVoltar }) {
  const [referencia, setReferencia] = useState('');
  const [texto, setTexto] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState('');
  const [textoBuscado, setTextoBuscado] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const traducaoAtual = TRADUCOES.find(t => t.id === traducao) ?? TRADUCOES[0];
  const usaModal = !traducaoAtual.autoFetch && !!traducaoAtual.yvId;

  const buscar = async () => {
    if (!referencia.trim()) return;
    setBuscando(true);
    setErroBusca('');
    setTextoBuscado(false);
    try {
      let resultado;
      if (traducaoAtual.autoFetch) {
        resultado = await buscarVersiculo(referencia.trim(), traducao);
      } else {
        const ret = await buscarVersiculoLocal(referencia.trim(), traducao);
        resultado = ret.texto;
      }
      setTexto(resultado);
      setTextoBuscado(true);
    } catch (err) {
      setErroBusca(err.message);
    } finally {
      setBuscando(false);
    }
  };

  const inserir = async (e) => {
    e.preventDefault();
    if (!referencia.trim()) return;
    setBuscando(true);
    setErroBusca('');
    setTextoBuscado(false);
    try {
      let resultado, refRetorno;
      if (traducaoAtual.autoFetch) {
        resultado = await buscarVersiculo(referencia.trim(), traducao);
        refRetorno = referencia.trim();
      } else {
        const ret = await buscarVersiculoLocal(referencia.trim(), traducao);
        resultado = ret.texto;
        refRetorno = ret.referencia;
      }
      setTexto(resultado);
      setTextoBuscado(true);
      onAdicionar(refRetorno, resultado);
    } catch (err) {
      setErroBusca(err.message);
    } finally {
      setBuscando(false);
    }
  };

  const handleColar = (textoColado) => {
    setTexto(textoColado);
    setTextoBuscado(true);
  };

  const submeter = (e) => {
    e.preventDefault();
    if (referencia.trim() && texto.trim()) onAdicionar(referencia, texto);
  };

  return (
    <>
      {/* Modal YouVersion */}
      {modalAberto && usaModal && (
        <ModalBiblia
          url={urlYouVersion(referencia, traducaoAtual.yvId)}
          referencia={referencia || traducaoAtual.nome}
          traducaoNome={traducaoAtual.nome}
          onColar={handleColar}
          onFechar={() => setModalAberto(false)}
        />
      )}

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
                  onChange={e => { setTraducao(e.target.value); setTextoBuscado(false); setErroBusca(''); }}
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

            {/* Referência + Botão */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Referência</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: João 3:16 ou Salmos 23:1"
                  value={referencia}
                  onChange={e => { setReferencia(e.target.value); setTextoBuscado(false); setErroBusca(''); }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), traducaoAtual.autoFetch ? buscar() : setModalAberto(true))}
                  className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                  autoFocus
                />

                {/* Busca e Inserir */}
                <>
                  <button
                    type="button" onClick={buscar}
                    disabled={buscando || !referencia.trim()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
                  >
                    {buscando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    <span className="hidden sm:inline">Buscar</span>
                  </button>
                  <button
                    type="button" onClick={inserir}
                    disabled={buscando || !referencia.trim()}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
                    title="Buscar e salvar automaticamente"
                  >
                    {buscando ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    <span className="hidden sm:inline">Inserir</span>
                  </button>
                </>

                {/* Abrir YouVersion no modal */}
                {usaModal && (
                  <button
                    type="button"
                    onClick={() => setModalAberto(true)}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-xl hover:bg-orange-600 transition font-semibold text-sm"
                    title={`Abrir ${traducaoAtual.nome} no YouVersion`}
                  >
                    <BookOpen size={16} />
                    <span className="hidden sm:inline">Abrir Bíblia</span>
                  </button>
                )}
              </div>

              {erroBusca && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle size={14} /><span>{erroBusca}</span>
                </div>
              )}
              {textoBuscado && (
                <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle size={14} />
                  <span>Texto pronto via <strong>{traducaoAtual.nome}</strong>. Confira e salve.</span>
                </div>
              )}
              {usaModal && !textoBuscado && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Clique "Abrir Bíblia" para ler e copiar o versículo diretamente do YouVersion.
                </p>
              )}
            </div>

            {/* Texto */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Texto do Versículo</label>
              <textarea
                rows={5}
                placeholder={
                  usaModal
                    ? 'Cole aqui o texto copiado do YouVersion, ou clique "Abrir Bíblia"...'
                    : 'Preenchido automaticamente após buscar, ou cole manualmente...'
                }
                value={texto}
                onChange={e => setTexto(e.target.value)}
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
    </>
  );
}
