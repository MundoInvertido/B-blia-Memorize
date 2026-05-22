import { useState, useEffect } from 'react';
import { Undo, Play } from 'lucide-react';

const normalizar = (str) =>
  str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

export default function PraticaOrdenar({ versiculo, onConcluido }) {
  // Split words keeping original punctuation for display
  const palavrasOriginais = versiculo.texto.split(/\s+/).filter(p => p.trim().length > 0);
  
  const [palavrasMisturadas, setPalavrasMisturadas] = useState([]);
  const [palavrasSelecionadas, setPalavrasSelecionadas] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [erroAtivo, setErroAtivo] = useState(null);

  // Initialize and shuffle
  useEffect(() => {
    reiniciar();
  }, [versiculo.texto]);

  const reiniciar = () => {
    const list = palavrasOriginais.map((p, index) => ({
      id: index,
      texto: p,
      normalizada: normalizar(p),
      selecionada: false
    }));

    // Shuffle array
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setPalavrasMisturadas(shuffled);
    setPalavrasSelecionadas([]);
    setIndiceAtual(0);
    setErroAtivo(null);
  };

  const handlePalavraClick = (palavra) => {
    if (palavra.selecionada) return;

    const palavraEsperada = palavrasOriginais[indiceAtual];
    if (palavra.normalizada === normalizar(palavraEsperada)) {
      // Correct!
      setPalavrasMisturadas(prev => prev.map(p => p.id === palavra.id ? { ...p, selecionada: true } : p));
      setPalavrasSelecionadas(prev => [...prev, palavra.texto]);
      setIndiceAtual(prev => prev + 1);
      setErroAtivo(null);
      
      // Check if finished
      if (indiceAtual + 1 === palavrasOriginais.length) {
        // Complete! Call completion handler after a short delay
        setTimeout(() => {
          onConcluido();
        }, 800);
      }
    } else {
      // Wrong word! Trigger red flash on the clicked word
      setErroAtivo(palavra.id);
      setTimeout(() => {
        setErroAtivo(null);
      }, 500);
    }
  };

  const handleDesfazer = () => {
    if (palavrasSelecionadas.length === 0) return;
    
    // Remove last word
    const ultimoTexto = palavrasSelecionadas[palavrasSelecionadas.length - 1];
    const ultimoIndice = indiceAtual - 1;
    const palavraEsperada = palavrasOriginais[ultimoIndice];

    // Find the corresponding item in shuffled list and make it active again
    setPalavrasMisturadas(prev => {
      // Find the first matching selected word that has id matching the original index
      const item = prev.find(p => p.normalizada === normalizar(palavraEsperada) && p.selecionada);
      if (item) {
        return prev.map(p => p.id === item.id ? { ...p, selecionada: false } : p);
      }
      return prev;
    });

    palavrasSelecionadas.pop();
    setPalavrasSelecionadas([...palavrasSelecionadas]);
    setIndiceAtual(ultimoIndice);
    setErroAtivo(null);
  };

  const progresso = palavrasOriginais.length > 0 ? (indiceAtual / palavrasOriginais.length) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800 mb-1">Ordenar Palavras</h3>
        <p className="text-slate-500 text-sm">{versiculo.referencia}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300 ease-out" 
          style={{ width: `${progresso}%` }}
        />
      </div>

      {/* Selected words (placed area) */}
      <div className="bg-slate-50 rounded-2xl p-5 min-h-[120px] flex flex-wrap gap-2 items-center justify-center border border-dashed border-slate-200">
        {palavrasSelecionadas.length === 0 ? (
          <p className="text-slate-400 text-sm italic">Toque nas palavras abaixo na ordem correta...</p>
        ) : (
          palavrasSelecionadas.map((p, i) => (
            <span 
              key={i} 
              className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl shadow-sm text-sm border border-blue-700 transition"
            >
              {p}
            </span>
          ))
        )}
      </div>

      {/* Unselected words (shuffled area) */}
      <div className="flex flex-wrap gap-2.5 justify-center py-4">
        {palavrasMisturadas.map((palavra) => {
          if (palavra.selecionada) {
            // Invisible placeholder
            return (
              <div 
                key={palavra.id} 
                className="w-16 h-8 bg-slate-100 rounded-xl opacity-20 border border-slate-200" 
              />
            );
          }

          const isErro = erroAtivo === palavra.id;

          return (
            <button
              key={palavra.id}
              onClick={() => handlePalavraClick(palavra)}
              className={`font-semibold px-4 py-2 rounded-xl text-sm border shadow-sm transition active:scale-95 duration-200 select-none ${
                isErro 
                  ? 'bg-red-500 text-white border-red-600' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100'
              }`}
            >
              {palavra.texto}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={handleDesfazer}
          disabled={palavrasSelecionadas.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:pointer-events-none transition animate-fade-in"
        >
          <Undo size={16} />
          Desfazer
        </button>

        <button
          onClick={reiniciar}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
        >
          <Play size={16} className="rotate-90" />
          Reiniciar
        </button>
      </div>
    </div>
  );
}
