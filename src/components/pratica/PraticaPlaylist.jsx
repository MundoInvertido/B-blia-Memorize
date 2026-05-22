import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Eye, EyeOff, Repeat, BookOpen, Settings } from 'lucide-react';

export default function PraticaPlaylist({ versiculo, versiculos = [], onConcluido }) {
  // Find current verse in list to start from it
  const listaVersiculos = versiculos.length > 0 ? versiculos : [versiculo];
  const indiceInicial = listaVersiculos.findIndex(v => v.id === versiculo.id);
  const [indiceAtual, setIndiceAtual] = useState(indiceInicial !== -1 ? indiceInicial : 0);

  const [tocar, setTocar] = useState(false);
  const [tempoEspera, setTempoEspera] = useState(3); // seconds to wait before next verse
  const [ocultarTexto, setOcultarTexto] = useState(false);
  const [lerReferencia, setLerReferencia] = useState(true);
  const [repetirTudo, setRepetirTudo] = useState(true);
  const [mostrandoOpcoes, setMostrandoOpcoes] = useState(false);
  const [falando, setFalando] = useState(false);
  const [progressoFala, setProgressoFala] = useState(''); // current spoken text

  const synthRef = useRef(null);
  const timerRef = useRef(null);
  const versiculoAtual = listaVersiculos[indiceAtual] || versiculo;

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Safe cancel speech
  const pararFala = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setFalando(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // Recite a specific text
  const falarTexto = (texto, callback) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utt = new SpeechSynthesisUtterance(texto);
    utt.lang = 'pt-BR';
    utt.rate = 0.85;

    // Search pt-BR voice
    const voces = synthRef.current.getVoices();
    const vozPt = voces.find(v => v.lang.startsWith('pt'));
    if (vozPt) utt.voice = vozPt;

    utt.onend = () => {
      setFalando(false);
      if (callback) callback();
    };
    utt.onerror = () => {
      setFalando(false);
      if (callback) callback();
    };

    setFalando(true);
    synthRef.current.speak(utt);
  };

  // Main play cycle control
  const rodarCiclo = useCallback(() => {
    if (!tocar) return;

    pararFala();

    const ref = versiculoAtual.referencia;
    const txt = versiculoAtual.texto;
    
    setProgressoFala(ref);

    // Speak Reference
    if (lerReferencia) {
      falarTexto(ref, () => {
        // Pause briefly after reference
        timerRef.current = setTimeout(() => {
          setProgressoFala(txt);
          falarTexto(txt, () => {
            // Wait configured interval for repetition practice
            timerRef.current = setTimeout(() => {
              // Move to next
              avancarVersiculo();
            }, tempoEspera * 1000);
          });
        }, 800);
      });
    } else {
      setProgressoFala(txt);
      falarTexto(txt, () => {
        timerRef.current = setTimeout(() => {
          avancarVersiculo();
        }, tempoEspera * 1000);
      });
    }
  }, [tocar, indiceAtual, tempoEspera, lerReferencia, repetirTudo]);

  // Launch cycle whenever "tocar" or "indiceAtual" changes
  useEffect(() => {
    if (tocar) {
      rodarCiclo();
    } else {
      pararFala();
    }
    return () => pararFala();
  }, [tocar, indiceAtual, rodarCiclo]);

  const avancarVersiculo = () => {
    setIndiceAtual(prev => {
      if (prev + 1 < listaVersiculos.length) {
        return prev + 1;
      } else if (repetirTudo) {
        return 0; // wrap around
      } else {
        setTocar(false);
        return prev;
      }
    });
  };

  const retrocederVersiculo = () => {
    setIndiceAtual(prev => (prev - 1 >= 0 ? prev - 1 : listaVersiculos.length - 1));
  };

  const alternarReproducao = () => {
    setTocar(prev => !prev);
  };

  // Background visual generator
  const getImagemUrl = () => {
    if (!versiculoAtual.imagemUrl) return null;
    const url = versiculoAtual.imagemUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(url)}`;
  };

  const imgUrl = getImagemUrl();
  const temImagem = !!imgUrl;

  const cardStyle = temImagem 
    ? { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.85)), url(${imgUrl})` }
    : {};

  const cardBgClass = temImagem
    ? 'bg-cover bg-center text-white border-none'
    : versiculoAtual.corFundo
      ? `bg-gradient-to-br ${versiculoAtual.corFundo} text-white border-none`
      : 'bg-white text-slate-700 border-slate-100';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Player Card */}
      <div
        style={cardStyle}
        className={`${cardBgClass} p-8 rounded-3xl shadow-xl min-h-[380px] flex flex-col justify-between border relative overflow-hidden transition-all duration-500`}
      >
        {!temImagem && versiculoAtual.corFundo && (
          <div className="absolute inset-0 bg-white/5 opacity-10 pointer-events-none" />
        )}

        {/* Top details: Index & status */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-1.5 bg-black/20 text-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold">
            <BookOpen size={12} />
            <span>Playlist · {indiceAtual + 1} de {listaVersiculos.length}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOcultarTexto(!ocultarTexto)}
              className="p-2 rounded-full bg-black/20 text-white/90 backdrop-blur-md hover:bg-black/35 transition"
              title={ocultarTexto ? "Mostrar texto" : "Ocultar texto (Foco auditivo)"}
            >
              {ocultarTexto ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button
              onClick={() => setMostrandoOpcoes(!mostrandoOpcoes)}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                mostrandoOpcoes ? 'bg-white/20 text-white' : 'bg-black/20 text-white/90 hover:bg-black/35'
              }`}
              title="Ajustes de reprodução"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Main core content */}
        <div className="text-center my-auto py-6 z-10">
          <h2 className={`text-3xl font-black mb-4 tracking-tight transition duration-500 ${
            temImagem || versiculoAtual.corFundo ? 'text-white' : 'text-blue-900'
          }`}>
            {versiculoAtual.referencia}
          </h2>

          <div className="min-h-[100px] flex items-center justify-center">
            {ocultarTexto ? (
              <div className="text-white/40 italic text-sm py-4">
                {tocar ? 'Modo Ouvinte Ativo. Escute e repita em voz alta.' : 'Playlist Pausada.'}
              </div>
            ) : (
              <p className={`text-xl font-bold leading-relaxed max-w-lg transition duration-500 ${
                temImagem || versiculoAtual.corFundo ? 'text-white/95' : 'text-slate-700'
              }`}>
                {versiculoAtual.texto}
              </p>
            )}
          </div>

          {/* Subtitle status of TTS recitation */}
          {falando && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase animate-pulse text-yellow-300">
              <Volume2 size={12} />
              <span>Falando: {progressoFala === versiculoAtual.referencia ? 'Referência' : 'Versículo'}</span>
            </div>
          )}
        </div>

        {/* Settings Panel Overlay inside card */}
        {mostrandoOpcoes && (
          <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 text-white backdrop-blur-lg p-6 rounded-t-3xl border-t border-white/10 z-20 space-y-4 animate-slide-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-bold text-sm">Configuração da Playlist</span>
              <button
                onClick={() => setMostrandoOpcoes(false)}
                className="text-xs text-white/60 hover:text-white"
              >
                Confirmar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Tempo de espera (s)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={tempoEspera}
                    onChange={(e) => setTempoEspera(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <span className="font-bold w-6 text-right">{tempoEspera}s</span>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={() => setLerReferencia(!lerReferencia)}
                  className={`py-1.5 px-3 rounded-lg border font-semibold transition ${
                    lerReferencia 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'border-white/20 text-white/70 hover:bg-white/5'
                  }`}
                >
                  {lerReferencia ? '✓ Ler Referências' : 'Omitir Referências'}
                </button>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={() => setRepetirTudo(!repetirTudo)}
                  className={`py-1.5 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                    repetirTudo 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'border-white/20 text-white/70 hover:bg-white/5'
                  }`}
                >
                  <Repeat size={12} />
                  {repetirTudo ? 'Loop Ligado' : 'Loop Desligado'}
                </button>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={() => setOcultarTexto(!ocultarTexto)}
                  className={`py-1.5 px-3 rounded-lg border font-semibold transition ${
                    ocultarTexto 
                      ? 'bg-amber-600 border-amber-500 text-white' 
                      : 'border-white/20 text-white/70 hover:bg-white/5'
                  }`}
                >
                  {ocultarTexto ? 'Foco Auditivo' : 'Texto Visível'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player controls */}
        <div className="flex justify-between items-center z-10 mt-4 border-t border-white/10 pt-4">
          <div className="text-xs text-white/60">
            {temImagem || versiculoAtual.corFundo ? 'Bíblia Memorize' : 'Modo Ouvinte'}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={retrocederVersiculo}
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              title="Voltar versículo"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={alternarReproducao}
              className="p-4 rounded-full bg-white text-slate-900 shadow-md hover:scale-105 active:scale-95 transition"
              title={tocar ? "Pausar" : "Tocar playlist"}
            >
              {tocar ? <Pause size={24} className="fill-slate-900" /> : <Play size={24} className="fill-slate-900 ml-0.5" />}
            </button>

            <button
              onClick={avancarVersiculo}
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              title="Avançar versículo"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <button
            onClick={() => onConcluido('facil')}
            className="text-xs font-bold py-1.5 px-3 rounded-xl bg-white/10 text-white/90 hover:bg-white/20 transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
