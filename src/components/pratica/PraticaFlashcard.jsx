import { useState } from 'react';

export default function PraticaFlashcard({ versiculo, onConcluido }) {
  const [revelado, setRevelado] = useState(false);

  const revelar = () => {
    if (!revelado) {
      setRevelado(true);
      onConcluido();
    }
  };

  const getImagemUrl = () => {
    if (!versiculo.imagemUrl) return null;
    const url = versiculo.imagemUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(url)}`;
  };

  const imgUrl = getImagemUrl();
  const temImagem = !!imgUrl;

  const cardStyle = temImagem 
    ? { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.75)), url(${imgUrl})` }
    : {};

  const cardBgClass = temImagem
    ? 'bg-cover bg-center text-white border-none'
    : versiculo.corFundo
      ? `bg-gradient-to-br ${versiculo.corFundo} text-white border-none`
      : 'bg-white text-slate-700 border-slate-100';

  return (
    <div
      onClick={revelar}
      style={cardStyle}
      className={`${cardBgClass} p-8 rounded-2xl shadow-md min-h-[340px] flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-300 hover:shadow-lg active:scale-[0.99] border relative overflow-hidden`}
    >
      {!temImagem && versiculo.corFundo && (
        <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none" />
      )}

      <h2 className={`text-3xl font-black mb-6 tracking-tight ${!temImagem && !versiculo.corFundo ? 'text-blue-800' : 'text-white'}`}>
        {versiculo.referencia}
      </h2>
      
      {revelado ? (
        <p className={`text-xl font-bold leading-relaxed max-w-lg transition duration-500 ${!temImagem && !versiculo.corFundo ? 'text-slate-700' : 'text-white'}`}>
          {versiculo.texto}
        </p>
      ) : (
        <p className={`text-sm italic tracking-wide transition duration-300 ${!temImagem && !versiculo.corFundo ? 'text-slate-400' : 'text-white/60'}`}>
          Toque no cartão para revelar o texto
        </p>
      )}
    </div>
  );
}
