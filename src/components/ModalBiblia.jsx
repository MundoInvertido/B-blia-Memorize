import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ExternalLink, ClipboardPaste, RefreshCw, AlertTriangle } from 'lucide-react';

export default function ModalBiblia({ url, referencia, traducaoNome, onColar, onFechar }) {
  const [carregando, setCarregando] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const iframeRef = useRef(null);
  // Detectar se o iframe foi bloqueado (X-Frame-Options)
  // O iframe dispara onLoad mesmo quando bloqueado, mas contentDocument fica inacessível
  const handleLoad = () => {
    setCarregando(false);
    try {
      // Se conseguir acessar, não foi bloqueado (só funciona se same-origin, então sempre vai lançar)
      // eslint-disable-next-line no-unused-vars
      const _ = iframeRef.current?.contentWindow?.location?.href;
    } catch {
      // Cross-origin — normal. Assumimos que carregou.
    }
  };

  // Timeout: se não carregar em 8s, provavelmente foi bloqueado
  useEffect(() => {
    const t = setTimeout(() => {
      if (carregando) setBloqueado(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [carregando]);

  // Fechar com Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onFechar]);

  const colarDaArea = async () => {
    try {
      const texto = await navigator.clipboard.readText();
      if (texto.trim()) {
        onColar(texto.trim());
        onFechar();
      }
    } catch {
      alert('Permissão de área de transferência negada.\nCole o texto manualmente no campo após fechar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay escuro */}
      <div
        className="hidden lg:block flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onFechar}
      />

      {/* Drawer */}
      <div className="w-full lg:w-[480px] xl:w-[520px] bg-white flex flex-col shadow-2xl animate-slide-in-right">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="font-black text-base leading-tight truncate">YouVersion — {traducaoNome}</p>
            <p className="text-orange-100 text-sm truncate">{referencia}</p>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/20 transition"
              title="Abrir em nova aba"
            >
              <ExternalLink size={18} />
            </a>
            <button
              onClick={onFechar}
              className="p-2 rounded-lg hover:bg-white/20 transition"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Área do iframe */}
        <div className="flex-1 relative overflow-hidden bg-slate-100">
          {carregando && !bloqueado && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10">
              <Loader2 size={32} className="text-orange-500 animate-spin" />
              <p className="text-slate-500 text-sm">Carregando YouVersion...</p>
            </div>
          )}

          {bloqueado ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white p-8 text-center">
              <AlertTriangle size={40} className="text-amber-500" />
              <div>
                <p className="font-bold text-slate-800 text-lg">Conteúdo bloqueado</p>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  O YouVersion não permite exibição em outros sites (X-Frame-Options).
                  Abra em nova aba, copie o texto e cole abaixo.
                </p>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-orange-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition"
              >
                <ExternalLink size={16} /> Abrir no YouVersion
              </a>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={url}
              title={`YouVersion — ${referencia}`}
              className="w-full h-full border-none"
              onLoad={handleLoad}
              allow="clipboard-read; clipboard-write"
            />
          )}
        </div>

        {/* Footer — ações */}
        <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50 space-y-2">
          <p className="text-xs text-slate-500 text-center mb-3">
            Copie o texto do versículo no YouVersion e cole aqui:
          </p>
          <button
            onClick={colarDaArea}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition"
          >
            <ClipboardPaste size={18} /> Colar texto copiado
          </button>
          <button
            onClick={onFechar}
            className="w-full py-2.5 text-slate-500 text-sm hover:text-slate-700 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
