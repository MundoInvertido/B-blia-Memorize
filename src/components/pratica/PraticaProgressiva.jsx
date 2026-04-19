import { useState, useCallback } from 'react';
import { ChevronRight, RotateCcw, Check } from 'lucide-react';

const ESTAGIOS = [
  { id: 0, label: 'Ler',       desc: 'Leia e familiarize-se',          pct: 0,   digitar: false },
  { id: 1, label: '30% oculto', desc: 'Relembre algumas palavras',      pct: 0.3, digitar: false },
  { id: 2, label: '60% oculto', desc: 'Mais palavras para relembrar',   pct: 0.6, digitar: false },
  { id: 3, label: '100% oculto', desc: 'Teste completo com dicas',      pct: 1.0, digitar: false },
  { id: 4, label: 'Digitar',    desc: 'Digite cada palavra de memória', pct: 1.0, digitar: true  },
];

// Split text preserving spaces as tokens
function tokenizar(texto) {
  return texto.split(/(\s+)/).map((t, i) => ({
    idx: i,
    texto: t,
    isPalavra: t.trim() !== '',
  }));
}

function gerarOcultos(tokens, pct) {
  if (pct === 0) return new Set();
  const indicePalavras = tokens.filter(t => t.isPalavra).map(t => t.idx);
  if (pct >= 1) return new Set(indicePalavras);
  const quantidade = Math.round(indicePalavras.length * pct);
  const embaralhados = [...indicePalavras].sort(() => Math.random() - 0.5);
  return new Set(embaralhados.slice(0, quantidade));
}

function primeiraLetra(palavra) {
  const match = palavra.match(/[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/);
  return match ? match[0] : '';
}

// --- Sub-component: Estágio de Leitura ---
function EstagioLeitura({ tokens, onProximo }) {
  return (
    <div>
      <p className="text-xl leading-relaxed text-slate-800 mb-6">
        {tokens.map(t => <span key={t.idx}>{t.texto}</span>)}
      </p>
      <button
        onClick={onProximo}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
      >
        Aprendi, próximo estágio <ChevronRight size={18} />
      </button>
    </div>
  );
}

// --- Sub-component: Estágio de Ocultar com Dica (primeira letra) ---
function EstagioOcultar({ tokens, pct, onProximo }) {
  const [ocultos, setOcultos] = useState(() => gerarOcultos(tokens, pct));
  const [revelados, setRevelados] = useState(new Set());

  const revelar = (idx) => {
    setRevelados(prev => new Set([...prev, idx]));
  };

  const todasReveladas = [...ocultos].every(idx => revelados.has(idx));

  return (
    <div>
      <div className="text-xl leading-relaxed mb-6 select-none">
        {tokens.map(t => {
          if (!t.isPalavra) return <span key={t.idx}>{t.texto}</span>;

          if (!ocultos.has(t.idx)) {
            return <span key={t.idx}>{t.texto}</span>;
          }

          if (revelados.has(t.idx)) {
            return (
              <span key={t.idx} className="text-green-700 font-medium transition-all">
                {t.texto}
              </span>
            );
          }

          // Oculta: mostra primeira letra + traços
          const pl = primeiraLetra(t.texto);
          const resto = '_'.repeat(Math.max(1, t.texto.replace(/[^a-zA-ZÀ-ÿ]/g, '').length - 1));
          return (
            <span
              key={t.idx}
              onClick={() => revelar(t.idx)}
              className="inline-block cursor-pointer bg-blue-50 border-b-2 border-blue-400 px-0.5 mx-0.5 rounded-t hover:bg-blue-100 transition text-blue-700 font-mono"
              title="Clique para revelar"
            >
              <span className="font-bold">{pl}</span>
              <span className="text-blue-300">{resto}</span>
            </span>
          );
        })}
      </div>
      <button
        onClick={onProximo}
        className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition ${
          todasReveladas
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {todasReveladas ? <><Check size={18} /> Próximo estágio</> : <>Próximo estágio <ChevronRight size={18} /></>}
      </button>
    </div>
  );
}

// --- Sub-component: Estágio Digitar ---
function EstagioDigitar({ tokens, onConcluido }) {
  const palavras = tokens.filter(t => t.isPalavra);
  const [indice, setIndice] = useState(0);
  const [revelados, setRevelados] = useState(new Set());
  const [input, setInput] = useState('');
  const [erro, setErro] = useState(false);
  const [terminou, setTerminou] = useState(false);

  const palavraAtual = palavras[indice];

  const normalizar = (str) =>
    str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');

  const verificar = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (!palavraAtual) return;

    const digitado = normalizar(input);
    const alvo = normalizar(palavraAtual.texto);

    if (digitado === alvo) {
      setRevelados(prev => new Set([...prev, palavraAtual.idx]));
      setInput('');
      setErro(false);
      if (indice + 1 >= palavras.length) {
        setTerminou(true);
        setTimeout(onConcluido, 800);
      } else {
        setIndice(i => i + 1);
      }
    } else {
      setErro(true);
      setTimeout(() => setErro(false), 400);
    }
  };

  return (
    <div>
      <div className="text-xl leading-relaxed mb-6">
        {tokens.map(t => {
          if (!t.isPalavra) return <span key={t.idx}>{t.texto}</span>;

          if (revelados.has(t.idx)) {
            return <span key={t.idx} className="text-green-700 font-medium">{t.texto}</span>;
          }

          if (t.idx === palavraAtual?.idx) {
            return (
              <span key={t.idx} className={`inline-block px-1 rounded border-b-2 text-transparent bg-clip-text ${
                erro ? 'border-red-500 bg-red-100' : 'border-blue-500 bg-blue-100'
              }`}>
                {t.texto}
              </span>
            );
          }

          const comprimento = t.texto.replace(/[^a-zA-ZÀ-ÿ]/g, '').length;
          return (
            <span key={t.idx} className="text-slate-300 font-mono tracking-wider">
              {'_'.repeat(Math.max(1, comprimento))}
            </span>
          );
        })}
      </div>

      {terminou ? (
        <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 p-4 rounded-xl font-bold animate-fade-in">
          <Check size={20} /> Perfeito! Completou digitando!
        </div>
      ) : (
        <div className={`flex gap-2 ${erro ? 'animate-shake' : ''}`}>
          <input
            autoFocus
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={verificar}
            placeholder={`Digite: ${palavraAtual?.texto[0] ?? ''}...`}
            className={`flex-1 p-3 border-2 rounded-xl outline-none text-sm transition-colors ${
              erro ? 'border-red-400 bg-red-50' : 'border-blue-400 focus:border-blue-600'
            }`}
            autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false"
          />
          <button
            onClick={() => verificar({ key: 'Enter', preventDefault: () => {} })}
            className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 font-bold"
          >
            →
          </button>
        </div>
      )}

      <p className="text-center text-xs text-slate-400 mt-3">
        {indice}/{palavras.length} palavras · Enter ou Espaço para confirmar
      </p>
    </div>
  );
}

// --- Componente Principal ---
export default function PraticaProgressiva({ versiculo, onConcluido }) {
  const [estagioIdx, setEstagioIdx] = useState(0);
  const tokens = tokenizar(versiculo.texto);
  const estagio = ESTAGIOS[estagioIdx];
  const total = ESTAGIOS.length;

  const avancar = useCallback(() => {
    if (estagioIdx + 1 >= total) {
      onConcluido();
    } else {
      setEstagioIdx(i => i + 1);
    }
  }, [estagioIdx, total, onConcluido]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      {/* Cabeçalho com progresso */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-blue-800">{versiculo.referencia}</h2>
          <span className="text-sm font-semibold text-slate-500">
            Estágio {estagioIdx + 1}/{total}
          </span>
        </div>

        {/* Barra de estágios */}
        <div className="flex gap-1.5 mb-1">
          {ESTAGIOS.map((e, i) => (
            <div
              key={e.id}
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                i < estagioIdx ? 'bg-green-400' :
                i === estagioIdx ? 'bg-blue-500' :
                'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-500">{estagio.label} — {estagio.desc}</p>
      </div>

      {/* Conteúdo do estágio */}
      {estagio.id === 0 && (
        <EstagioLeitura tokens={tokens} onProximo={avancar} />
      )}
      {estagio.id > 0 && !estagio.digitar && (
        <EstagioOcultar
          key={estagioIdx}
          tokens={tokens}
          pct={estagio.pct}
          onProximo={avancar}
        />
      )}
      {estagio.digitar && (
        <EstagioDigitar key={estagioIdx} tokens={tokens} onConcluido={avancar} />
      )}
    </div>
  );
}
