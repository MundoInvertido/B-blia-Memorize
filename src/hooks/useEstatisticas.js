import { useMemo } from 'react';

function parseBook(referencia) {
  const match = referencia.match(/^([1-3]?\s*[a-zA-ZÀ-ÿ]+)/);
  return match ? match[1].trim() : referencia.split(' ')[0];
}

function parseChapter(referencia) {
  const match = referencia.match(/^([1-3]?\s*[a-zA-ZÀ-ÿ]+\s*\d+)/);
  return match ? match[1].trim() : referencia.split(' ').slice(0, 2).join(' ');
}

export function useEstatisticas(versiculos) {
  return useMemo(() => {
    if (!versiculos || versiculos.length === 0) {
      return {
        totalPalavras: 0,
        totalVersiculos: 0,
        palavrasPorLivro: {},
        progressoLivro: {},
        progressoCapitulo: {},
        livroFavorito: null,
        palavrasMemorizadas: 0,
      };
    }

    const totalPalavras = versiculos.reduce((acc, v) => {
      const texto = v.texto || '';
      return acc + texto.trim().split(/\s+/).filter(p => p.length > 0).length;
    }, 0);

    const dominados = versiculos.filter(v => (v.nivel ?? 0) >= 5);
    const palavrasMemorizadas = dominados.reduce((acc, v) => {
      const texto = v.texto || '';
      return acc + texto.trim().split(/\s+/).filter(p => p.length > 0).length;
    }, 0);

    // Group by book
    const porLivro = {};
    const porCapitulo = {};
    versiculos.forEach(v => {
      const livro = parseBook(v.referencia);
      const capitulo = parseChapter(v.referencia);

      if (!porLivro[livro]) porLivro[livro] = { total: 0, dominados: 0, palavrasTotal: 0, palavrasDominadas: 0 };
      if (!porCapitulo[capitulo]) porCapitulo[capitulo] = { total: 0, dominados: 0, palavrasTotal: 0, palavrasDominadas: 0 };

      const palavras = (v.palavras || v.texto?.trim().split(/\s+/).filter(p => p.length > 0).length) || 0;
      const eDominado = (v.nivel ?? 0) >= 5;

      porLivro[livro].total++;
      porLivro[livro].palavrasTotal += palavras;
      if (eDominado) {
        porLivro[livro].dominados++;
        porLivro[livro].palavrasDominadas += palavras;
      }

      porCapitulo[capitulo].total++;
      porCapitulo[capitulo].palavrasTotal += palavras;
      if (eDominado) {
        porCapitulo[capitulo].dominados++;
        porCapitulo[capitulo].palavrasDominadas += palavras;
      }
    });

    // Progress percentages
    const progressoLivro = Object.fromEntries(
      Object.entries(porLivro).map(([k, v]) => [
        k,
        {
          total: v.palavrasTotal,
          memorizado: v.palavrasDominadas,
          pct: v.palavrasTotal > 0 ? Math.round((v.palavrasDominadas / v.palavrasTotal) * 100) : 0,
          dominados: v.dominados,
          totalVersiculos: v.total,
        }
      ])
    );

    const progressoCapitulo = Object.fromEntries(
      Object.entries(porCapitulo).map(([k, v]) => [
        k,
        {
          total: v.palavrasTotal,
          memorizado: v.palavrasDominadas,
          pct: v.palavrasTotal > 0 ? Math.round((v.palavrasDominadas / v.palavrasTotal) * 100) : 0,
          dominados: v.dominados,
          totalVersiculos: v.total,
        }
      ])
    );

    // Favorite book (most verses)
    const livroFavorito = Object.entries(porLivro).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || null;

    return {
      totalPalavras,
      totalVersiculos: versiculos.length,
      palavrasMemorizadas,
      palavrasPorLivro: porLivro,
      progressoLivro,
      progressoCapitulo,
      livroFavorito,
    };
  }, [versiculos]);
}

export function formatarImpacto(estatisticas) {
  const { totalPalavras, palavrasMemorizadas, progressoLivro, livroFavorito } = estatisticas;

  const pct = totalPalavras > 0 ? Math.round((palavrasMemorizadas / totalPalavras) * 100) : 0;

  let livroTexto = '';
  if (livroFavorito && progressoLivro[livroFavorito]) {
    const p = progressoLivro[livroFavorito];
    livroTexto = `${livroFavorito}: ${p.pct}% memorizado (${p.memorizado}/${p.total} palavras)`;
  }

  return {
    totalPalavras,
    palavrasMemorizadas,
    pct,
    livroFavorito,
    livroTexto,
  };
}