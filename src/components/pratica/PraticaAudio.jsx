import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const normalizar = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');

export default function PraticaAudio({ versiculo, onConcluido }) {
  const [fase, setFase] = useState('escutar'); // 'escutar' | 'falar' | 'resultado'
  const [transcricao, setTranscricao] = useState('');
  const [erros, setErros] = useState([]);
  const [falando, setFalando] = useState(false);
  const [reconhecendo, setReconhecendo] = useState(false);
  const [ttsDisponivel, setTtsDisponivel] = useState(false);
  const [sttDisponivel, setSttDisponivel] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const synthRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcricaoParcial = useRef('');

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTtsDisponivel(!!window.speechSynthesis);
      const hasSTT = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      setSttDisponivel(hasSTT);
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const falarVersiculo = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utt = new SpeechSynthesisUtterance(versiculo.texto);
    utt.lang = 'pt-BR';
    utt.rate = 0.75;

    // Try to find a Portuguese voice
    const voces = synthRef.current.getVoices();
    const vozPt = voces.find(v => v.lang.startsWith('pt'));
    if (vozPt) utt.voice = vozPt;

    utt.onend = () => setFalando(false);
    utt.onerror = () => setFalando(false);

    setFalando(true);
    synthRef.current.speak(utt);
  }, [versiculo.texto]);

  const pararFala = () => {
    if (synthRef.current) synthRef.current.cancel();
    setFalando(false);
  };

  const iniciarReconhecimento = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMensagem('Reconhecimento de voz não disponível neste navegador.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    transcricaoParcial.current = '';

    recognition.onstart = () => {
      setReconhecendo(true);
      setMensagem('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }

      transcricaoParcial.current = (transcricaoParcial.current + ' ' + final).trim();
      setTranscricao(transcricaoParcial.current);

      if (event.results[event.results.length - 1].isFinal) {
        // Don't stop - let user keep speaking
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Restart automatically
        if (reconhecendo) {
          try { recognition.start(); } catch {}
        }
        return;
      }
      if (event.error === 'not-allowed') {
        setMensagem('Permissão de microfone negada.');
        setReconhecendo(false);
        return;
      }
      setReconhecendo(false);
    };

    recognition.onend = () => {
      if (reconhecendo) {
        try { recognition.start(); } catch {}
      }
    };

    try {
      recognition.start();
    } catch (e) {
      setMensagem('Erro ao iniciar reconhecimento de voz.');
      setReconhecendo(false);
    }
  }, [reconhecendo]);

  const pararReconhecimento = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setReconhecendo(false);
  };

  const analisarTranscricao = useCallback(() => {
    pararReconhecimento();

    const palavrasReais = versiculo.texto.split(/\s+/).filter(p => normalizar(p).length > 0);
    const palavrasFaladas = transcricao.split(/\s+/).filter(p => normalizar(p).length > 0);

    const errosTemp = [];
    palavrasReais.forEach((palavra, i) => {
      const normalizada = normalizar(palavra);
      if (palavrasFaladas[i] !== normalizada) {
        errosTemp.push({ indice: i, esperado: palavra, obtido: palavrasFaladas[i] || '(vazio)' });
      }
    });

    setErros(errosTemp);
    setFase('resultado');
  }, [transcricao, versiculo.texto]);

  const tentarNovamente = () => {
    setTranscricao('');
    setErros([]);
    transcricaoParcial.current = '';
    setFase('falar');
    pararReconhecimento();
    setTimeout(() => iniciarReconhecimento(), 100);
  };

  const resultado = {
    erros: erros.length,
    total: versiculo.texto.split(/\s+/).filter(p => normalizar(p).length > 0).length,
  };

  // Auto-determine resultado SRS based on accuracy
  const getResultado = () => {
    const acerto = resultado.total - resultado.erros;
    const pct = resultado.total > 0 ? acerto / resultado.total : 0;
    if (pct >= 0.9) return 'facil';
    if (pct >= 0.6) return 'ok';
    return 'dificil';
  };

  return (
    <div className="space-y-6">
      {/* Fase: Escutar */}
      {fase === 'escutar' && (
        <div className="text-center space-y-6">
          <div className="bg-blue-50 rounded-2xl p-8">
            <Volume2 size={48} className="mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Escute o versículo</h3>
            <p className="text-slate-600 text-sm mb-6">{versiculo.referencia}</p>
            <div className="bg-white rounded-xl p-4 max-w-md mx-auto shadow-sm">
              <p className="text-slate-700 text-base leading-relaxed italic">"{versiculo.texto}"</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            {ttsDisponivel ? (
              <>
                <button
                  onClick={falarVersiculo}
                  disabled={falando}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Volume2 size={18} />
                  {falando ? 'Reproduzindo...' : 'Ouvir versículo'}
                </button>
                {falando && (
                  <button onClick={pararFala} className="text-xs text-slate-500 hover:text-slate-700">
                    Parar
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">Síntese de voz não disponível neste navegador.</p>
            )}

            <button
              onClick={() => setFase('falar')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
            >
              <Mic size={18} />
              Agora dite de memória
            </button>
          </div>
        </div>
      )}

      {/* Fase: Falar */}
      {fase === 'falar' && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 rounded-2xl p-8">
            <div className="relative inline-block mb-4">
              {reconhecendo ? (
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mic size={32} className="text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <MicOff size={32} className="text-green-500" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {reconhecendo ? 'Ouvindo... fale o versículo' : 'Dite o versículo de memória'}
            </h3>
            <p className="text-slate-600 text-sm mb-4">{versiculo.referencia}</p>

            {/* Live transcription display */}
            <div className="bg-white rounded-xl p-4 max-w-lg mx-auto shadow-sm min-h-20 text-left">
              <p className="text-slate-700 text-sm leading-relaxed">
                {transcricao || <span className="text-slate-400 italic">Aguardando sua voz...</span>}
              </p>
            </div>

            {mensagem && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 inline-block">{mensagem}</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            {!reconhecendo && sttDisponivel && (
              <button
                onClick={iniciarReconhecimento}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
              >
                <Mic size={18} />
                Iniciar ditado
              </button>
            )}

            {reconhecendo && (
              <button
                onClick={analisarTranscricao}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Finalizar e verificar
              </button>
            )}

            {!sttDisponivel && (
              <p className="text-sm text-slate-500">
                Reconhecimento de voz não disponível neste navegador. Tente no Chrome ou Edge.
              </p>
            )}

            <button
              onClick={() => { pararReconhecimento(); setFase('escutar'); }}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Voltar e ouvir novamente
            </button>
          </div>
        </div>
      )}

      {/* Fase: Resultado */}
      {fase === 'resultado' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Resultado</h3>

            {/* Stats */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-black text-green-600">{resultado.total - resultado.erros}</p>
                <p className="text-xs text-slate-500">Acertos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-red-500">{resultado.erros}</p>
                <p className="text-xs text-slate-500">Erros</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-slate-700">{resultado.total}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>

            {/* Word comparison */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {versiculo.texto.split(/\s+/).filter(p => normalizar(p).length > 0).map((palavra, i) => {
                const erro = erros.find(e => e.indice === i);
                const acertou = !erro;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {acertou ? (
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-red-500 flex-shrink-0" />
                    )}
                    <span className={acertou ? 'text-green-700' : 'text-red-700'}>
                      {palavra}
                    </span>
                    {!acertou && (
                      <span className="text-slate-400 text-xs">
                        ← {erro.obtido}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={tentarNovamente}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition w-full max-w-xs"
            >
              <RotateCcw size={16} />
              Tentar novamente
            </button>
            <button
              onClick={() => onConcluido(getResultado())}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition w-full max-w-xs"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}