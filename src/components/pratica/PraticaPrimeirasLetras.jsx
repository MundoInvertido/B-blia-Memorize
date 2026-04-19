import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Check, Type } from 'lucide-react';

function prepararFragmentos(texto) {
  return texto.split(/(\s+)/).map(frag => {
    if (frag.trim() === '') return { tipo: 'espaco', texto: frag };
    const match = frag.match(/[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/);
    const primeiraLetra = match ? match[0].toLowerCase() : '';
    const letraBase = primeiraLetra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return { tipo: 'palavra', texto: frag, primeiraLetra, letraBase, revelada: false };
  });
}

export default function PraticaPrimeirasLetras({ versiculo, onConcluido }) {
  const fragmentosIniciais = prepararFragmentos(versiculo.texto);
  const [frags, setFrags] = useState(fragmentosIniciais);
  const [indice, setIndice] = useState(0);
  const [erro, setErro] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const proximoIndice = (atual, estado) => {
    let i = atual;
    while (i < estado.length) {
      if (estado[i].tipo === 'palavra' && !estado[i].revelada) return i;
      i++;
    }
    return -1;
  };

  const indiceAtivo = proximoIndice(indice, frags);
  const terminou = indiceAtivo === -1;

  useEffect(() => {
    if (terminou && !concluido) {
      setConcluido(true);
      onConcluido();
    }
  }, [terminou, concluido, onConcluido]);

  const lidarEntrada = (e) => {
    const char = e.target.value.toLowerCase().slice(-1);
    e.target.value = '';
    if (!char || terminou) return;

    const alvo = frags[indiceAtivo];
    if (char === alvo.primeiraLetra || char === alvo.letraBase) {
      setErro(false);
      setFrags(prev => {
        const n = [...prev];
        n[indiceAtivo] = { ...n[indiceAtivo], revelada: true };
        return n;
      });
      setIndice(indiceAtivo + 1);
    } else {
      setErro(true);
      setTimeout(() => setErro(false), 280);
    }
  };

  const recomecar = () => {
    setFrags(fragmentosIniciais);
    setIndice(0);
    setErro(false);
    setConcluido(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        onChange={lidarEntrada}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
      />

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-blue-800">{versiculo.referencia}</h2>
        <span className="text-xs bg-slate-100 text-slate-500 py-1 px-2 rounded-full flex items-center gap-1">
          <Type size={11} /> Teclado ativo
        </span>
      </div>

      <div className={`text-xl leading-relaxed mb-6 transition-all ${erro ? 'text-red-500' : 'text-slate-800'}`}>
        {frags.map((item, i) => {
          if (item.tipo === 'espaco') return <span key={i}>{item.texto}</span>;

          if (item.revelada) {
            return <span key={i}>{item.texto}</span>;
          }

          if (i === indiceAtivo) {
            return (
              <span
                key={i}
                className={`px-0.5 rounded-t border-b-2 bg-transparent ${
                  erro ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-600'
                } font-bold animate-pulse`}
              >
                _
              </span>
            );
          }

          const comprimento = item.texto.replace(/[^a-zA-ZÀ-ÿ]/g, '').length;
          return (
            <span key={i} className="text-slate-300 font-mono tracking-widest">
              {'_'.repeat(Math.max(1, comprimento))}
            </span>
          );
        })}
      </div>

      {terminou ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex flex-col items-center animate-fade-in">
          <Check size={28} className="mb-1" />
          <p className="font-bold">Excelente! Versículo concluído.</p>
          <button
            onClick={recomecar}
            className="mt-3 flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition"
          >
            <RotateCcw size={15} /> Praticar novamente
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400">
          Digite a primeira letra da palavra destacada
        </p>
      )}
    </div>
  );
}
