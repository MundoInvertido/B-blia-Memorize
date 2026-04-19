import { useState, useRef, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';

function tokenizar(texto) {
  return texto.split(/(\s+)/).map((t, i) => ({
    idx: i,
    texto: t,
    isPalavra: t.trim() !== '',
  }));
}

const normalizar = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');

export default function PraticaDigitar({ versiculo, onConcluido }) {
  const tokens = tokenizar(versiculo.texto);
  const palavras = tokens.filter(t => t.isPalavra);

  const [indice, setIndice] = useState(0);
  const [revelados, setRevelados] = useState(new Set());
  const [input, setInput] = useState('');
  const [erro, setErro] = useState(false);
  const [erros, setErros] = useState(0);
  const [terminou, setTerminou] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const palavraAtual = palavras[indice];

  const verificar = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (terminou || !palavraAtual) return;

    const digitado = normalizar(input);
    const alvo = normalizar(palavraAtual.texto);

    if (digitado === alvo) {
      setRevelados(prev => new Set([...prev, palavraAtual.idx]));
      setInput('');
      setErro(false);
      if (indice + 1 >= palavras.length) {
        setTerminou(true);
        onConcluido();
      } else {
        setIndice(i => i + 1);
      }
    } else {
      setErros(n => n + 1);
      setErro(true);
      setTimeout(() => setErro(false), 400);
    }
  };

  const reiniciar = () => {
    setIndice(0);
    setRevelados(new Set());
    setInput('');
    setErro(false);
    setErros(0);
    setTerminou(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const progresso = palavras.length > 0 ? indice / palavras.length : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-blue-800">{versiculo.referencia}</h2>
        <span className="text-xs text-slate-500">{indice}/{palavras.length} palavras</span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full transition-all duration-300"
          style={{ width: `${progresso * 100}%` }}
        />
      </div>

      {/* Texto */}
      <div className="text-xl leading-loose mb-6 select-none">
        {tokens.map(t => {
          if (!t.isPalavra) return <span key={t.idx}>{t.texto}</span>;

          if (revelados.has(t.idx)) {
            return (
              <span key={t.idx} className="text-green-700 font-medium">
                {t.texto}
              </span>
            );
          }

          if (t.idx === palavraAtual?.idx) {
            return (
              <span
                key={t.idx}
                className={`inline-block px-1 rounded-t border-b-2 transition-colors ${
                  erro
                    ? 'border-red-500 bg-red-100 text-red-700'
                    : 'border-blue-500 bg-blue-100 text-blue-700'
                } font-bold`}
              >
                ?
              </span>
            );
          }

          const comprimento = t.texto.replace(/[^a-zA-ZÀ-ÿ]/g, '').length;
          return (
            <span key={t.idx} className="text-slate-300 font-mono tracking-widest">
              {'_'.repeat(Math.max(1, comprimento))}
            </span>
          );
        })}
      </div>

      {/* Input ou resultado */}
      {terminou ? (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex flex-col items-center animate-fade-in">
          <Check size={28} className="mb-2" />
          <p className="font-bold text-lg">Versículo concluído!</p>
          {erros > 0 && (
            <p className="text-sm text-green-600 mt-1">{erros} erro{erros !== 1 ? 's' : ''} cometido{erros !== 1 ? 's' : ''}</p>
          )}
          <button
            onClick={reiniciar}
            className="mt-3 flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 transition text-sm"
          >
            <RotateCcw size={14} /> Tentar novamente
          </button>
        </div>
      ) : (
        <div>
          <div className={`flex gap-2 ${erro ? 'animate-shake' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={verificar}
              placeholder="Digite a próxima palavra..."
              className={`flex-1 p-3 border-2 rounded-xl outline-none text-sm transition-colors ${
                erro
                  ? 'border-red-400 bg-red-50 text-red-800'
                  : 'border-blue-300 focus:border-blue-600'
              }`}
              autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false"
            />
            <button
              onClick={() => verificar({ key: 'Enter', preventDefault: () => {} })}
              className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 font-bold text-lg transition"
            >
              →
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Enter ou Espaço para confirmar · {erros > 0 && `${erros} erro${erros !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}
    </div>
  );
}
