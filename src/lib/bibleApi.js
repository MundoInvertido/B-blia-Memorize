export const TRADUCOES = [
  { id: 'almeida', nome: 'Almeida Revisada (ARA)',          idioma: '🇧🇷', descricao: 'Português', autoFetch: true,  yvId: null },
  { id: 'acf',     nome: 'Almeida Corrigida Fiel (ACF)',    idioma: '🇧🇷', descricao: 'Português', autoFetch: true,  yvId: null },
  { id: 'naa',     nome: 'Nova Almeida Atualizada (NAA)',   idioma: '🇧🇷', descricao: 'Português', autoFetch: false, yvId: 2645 },
  { id: 'nvi',     nome: 'Nova Versão Internacional (NVI)', idioma: '🇧🇷', descricao: 'Português', autoFetch: false, yvId: 129  },
  { id: 'kjv',     nome: 'King James Version (KJV)',        idioma: '🇬🇧', descricao: 'English',   autoFetch: true,  yvId: null },
  { id: 'web',     nome: 'World English Bible (WEB)',       idioma: '🌐',  descricao: 'English',   autoFetch: true,  yvId: null },
  { id: 'bbe',     nome: 'Bible in Basic English (BBE)',    idioma: '🌐',  descricao: 'English',   autoFetch: true,  yvId: null },
];

export const TRADUCAO_PADRAO = 'almeida';

// USFM book codes for YouVersion URLs
const USFM = {
  genesis:'GEN', gn:'GEN', gen:'GEN',
  exodo:'EXO', ex:'EXO', exo:'EXO',
  levitico:'LEV', lv:'LEV', lev:'LEV',
  numeros:'NUM', nm:'NUM', num:'NUM',
  deuteronomio:'DEU', dt:'DEU', deu:'DEU',
  josue:'JOS', js:'JOS', jos:'JOS',
  juizes:'JDG', jz:'JDG', jui:'JDG',
  rute:'RUT', rt:'RUT',
  '1samuel':'1SA', '1sm':'1SA',
  '2samuel':'2SA', '2sm':'2SA',
  '1reis':'1KI', '1rs':'1KI',
  '2reis':'2KI', '2rs':'2KI',
  '1cronicas':'1CH', '1cr':'1CH',
  '2cronicas':'2CH', '2cr':'2CH',
  esdras:'EZR', ed:'EZR', esd:'EZR',
  neemias:'NEH', ne:'NEH',
  ester:'EST', est:'EST', et:'EST',
  jo:'JOB', job:'JOB',
  salmos:'PSA', sl:'PSA', sal:'PSA',
  proverbios:'PRO', pv:'PRO', prov:'PRO',
  eclesiastes:'ECC', ec:'ECC', ecl:'ECC',
  cantares:'SNG', ct:'SNG',
  isaias:'ISA', is:'ISA', isa:'ISA',
  jeremias:'JER', jr:'JER', jer:'JER',
  lamentacoes:'LAM', lm:'LAM',
  ezequiel:'EZK', ez:'EZK',
  daniel:'DAN', dn:'DAN', dan:'DAN',
  oseias:'HOS', os:'HOS',
  joel:'JOL', jl:'JOL',
  amos:'AMO', am:'AMO',
  obadias:'OBA', ob:'OBA',
  jonas:'JON', jon:'JON',
  miqueias:'MIC', mq:'MIC', mic:'MIC',
  naum:'NAM', na:'NAM',
  habacuque:'HAB', hc:'HAB', hab:'HAB',
  sofonias:'ZEP', sf:'ZEP', sof:'ZEP',
  ageu:'HAG', ag:'HAG',
  zacarias:'ZEC', zc:'ZEC', zac:'ZEC',
  malaquias:'MAL', ml:'MAL', mal:'MAL',
  mateus:'MAT', mt:'MAT', mat:'MAT',
  marcos:'MRK', mc:'MRK', mar:'MRK',
  lucas:'LUK', lc:'LUK', luc:'LUK',
  joao:'JHN', joão:'JHN', jo:'JHN', joa:'JHN',
  atos:'ACT', at:'ACT',
  romanos:'ROM', rm:'ROM', rom:'ROM',
  '1corintios':'1CO', '1co':'1CO', '1cor':'1CO',
  '2corintios':'2CO', '2co':'2CO', '2cor':'2CO',
  galatas:'GAL', gl:'GAL', gal:'GAL',
  efesios:'EPH', ef:'EPH', efe:'EPH',
  filipenses:'PHP', fp:'PHP', fil:'PHP',
  colossenses:'COL', cl:'COL', col:'COL',
  '1tessalonicenses':'1TH', '1ts':'1TH', '1tes':'1TH',
  '2tessalonicenses':'2TH', '2ts':'2TH', '2tes':'2TH',
  '1timoteo':'1TI', '1tm':'1TI', '1ti':'1TI',
  '2timoteo':'2TI', '2tm':'2TI', '2ti':'2TI',
  tito:'TIT', tt:'TIT',
  filemom:'PHM', fm:'PHM',
  hebreus:'HEB', hb:'HEB', heb:'HEB',
  tiago:'JAS', tg:'JAS',
  '1pedro':'1PE', '1pe':'1PE',
  '2pedro':'2PE', '2pe':'2PE',
  '1joao':'1JN', '1jo':'1JN', '1jn':'1JN',
  '2joao':'2JN', '2jo':'2JN', '2jn':'2JN',
  '3joao':'3JN', '3jo':'3JN', '3jn':'3JN',
  judas:'JUD', jd:'JUD',
  apocalipse:'REV', ap:'REV',
};

function normChave(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
}

// Returns a bible.com URL for the given reference + YouVersion version ID
export function urlYouVersion(referencia, yvId) {
  const base = `https://www.bible.com/pt/bible/${yvId}`;
  if (!referencia?.trim()) return base;

  const match = referencia.trim().match(/^([1-3]?\s*[a-zA-ZÀ-ÿ]+)\s+(\d+):(\d+)/);
  if (!match) return base;

  const livroRaw = match[1].trim();
  const cap = match[2];
  const ver = match[3];

  const chave = normChave(livroRaw);
  const usfm = USFM[chave] ?? livroRaw.toUpperCase().slice(0, 3);

  return `${base}/${usfm}.${cap}.${ver}`;
}

// Maps common Portuguese book names → bible-api.com accepted names
const MAPA_LIVROS = {
  'genesis': 'genesis', 'gn': 'genesis', 'gen': 'genesis',
  'exodo': 'exodus', 'ex': 'exodus', 'exo': 'exodus',
  'levitico': 'leviticus', 'lv': 'leviticus', 'lev': 'leviticus',
  'numeros': 'numbers', 'nm': 'numbers', 'num': 'numbers',
  'deuteronomio': 'deuteronomy', 'dt': 'deuteronomy', 'deu': 'deuteronomy',
  'josue': 'joshua', 'js': 'joshua', 'jos': 'joshua',
  'juizes': 'judges', 'jz': 'judges', 'jui': 'judges',
  'rute': 'ruth', 'rt': 'ruth',
  '1samuel': '1 samuel', '1sm': '1 samuel',
  '2samuel': '2 samuel', '2sm': '2 samuel',
  '1reis': '1 kings', '1rs': '1 kings',
  '2reis': '2 kings', '2rs': '2 kings',
  '1cronicas': '1 chronicles', '1cr': '1 chronicles',
  '2cronicas': '2 chronicles', '2cr': '2 chronicles',
  'esdras': 'ezra', 'ed': 'ezra', 'esd': 'ezra',
  'neemias': 'nehemiah', 'ne': 'nehemiah', 'nee': 'nehemiah',
  'ester': 'esther', 'est': 'esther', 'et': 'esther',
  'jo': 'job', 'jó': 'job', 'job': 'job',
  'salmos': 'psalms', 'sl': 'psalms', 'sal': 'psalms',
  'proverbios': 'proverbs', 'pv': 'proverbs', 'prov': 'proverbs',
  'eclesiastes': 'ecclesiastes', 'ec': 'ecclesiastes', 'ecl': 'ecclesiastes',
  'cantares': 'song of solomon', 'ct': 'song of solomon',
  'isaias': 'isaiah', 'is': 'isaiah', 'isa': 'isaiah',
  'jeremias': 'jeremiah', 'jr': 'jeremiah', 'jer': 'jeremiah',
  'lamentacoes': 'lamentations', 'lm': 'lamentations',
  'ezequiel': 'ezekiel', 'ez': 'ezekiel', 'ezq': 'ezekiel',
  'daniel': 'daniel', 'dn': 'daniel', 'dan': 'daniel',
  'oseias': 'hosea', 'os': 'hosea',
  'joel': 'joel', 'jl': 'joel',
  'amos': 'amos', 'am': 'amos',
  'obadias': 'obadiah', 'ob': 'obadiah',
  'jonas': 'jonah', 'jn': 'jonah', 'jon': 'jonah',
  'miqueias': 'micah', 'mq': 'micah', 'mic': 'micah',
  'naum': 'nahum', 'na': 'nahum',
  'habacuque': 'habakkuk', 'hc': 'habakkuk', 'hab': 'habakkuk',
  'sofonias': 'zephaniah', 'sf': 'zephaniah', 'sof': 'zephaniah',
  'ageu': 'haggai', 'ag': 'haggai',
  'zacarias': 'zechariah', 'zc': 'zechariah', 'zac': 'zechariah',
  'malaquias': 'malachi', 'ml': 'malachi', 'mal': 'malachi',
  'mateus': 'matthew', 'mt': 'matthew', 'mat': 'matthew',
  'marcos': 'mark', 'mc': 'mark', 'mar': 'mark',
  'lucas': 'luke', 'lc': 'luke', 'luc': 'luke',
  'joao': 'john', 'joão': 'john', 'jo': 'john', 'joa': 'john',
  'atos': 'acts', 'at': 'acts',
  'romanos': 'romans', 'rm': 'romans', 'rom': 'romans',
  '1corintios': '1 corinthians', '1co': '1 corinthians', '1cor': '1 corinthians',
  '2corintios': '2 corinthians', '2co': '2 corinthians', '2cor': '2 corinthians',
  'galatas': 'galatians', 'gl': 'galatians', 'gal': 'galatians',
  'efesios': 'ephesians', 'ef': 'ephesians', 'efe': 'ephesians',
  'filipenses': 'philippians', 'fp': 'philippians', 'fil': 'philippians',
  'colossenses': 'colossians', 'cl': 'colossians', 'col': 'colossians',
  '1tessalonicenses': '1 thessalonians', '1ts': '1 thessalonians', '1tes': '1 thessalonians',
  '2tessalonicenses': '2 thessalonians', '2ts': '2 thessalonians', '2tes': '2 thessalonians',
  '1timoteo': '1 timothy', '1tm': '1 timothy', '1ti': '1 timothy',
  '2timoteo': '2 timothy', '2tm': '2 timothy', '2ti': '2 timothy',
  'tito': 'titus', 'tt': 'titus',
  'filemom': 'philemon', 'fm': 'philemon',
  'hebreus': 'hebrews', 'hb': 'hebrews', 'heb': 'hebrews',
  'tiago': 'james', 'tg': 'james',
  '1pedro': '1 peter', '1pe': '1 peter',
  '2pedro': '2 peter', '2pe': '2 peter',
  '1joao': '1 john', '1jo': '1 john', '1jn': '1 john',
  '2joao': '2 john', '2jo': '2 john', '2jn': '2 john',
  '3joao': '3 john', '3jo': '3 john', '3jn': '3 john',
  'judas': 'jude', 'jd': 'jude',
  'apocalipse': 'revelation', 'ap': 'revelation',
};

function normalizarChave(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
}

function normalizarReferencia(ref) {
  const match = ref.trim().match(/^([1-3]?\s*[a-zA-ZÀ-ÿ]+)\s+(\d+:\d+(?:-\d+)?)$/);
  if (!match) return ref;

  const livroRaw = match[1].trim();
  const trecho = match[2];
  const chave = normalizarChave(livroRaw);
  const livroEn = MAPA_LIVROS[chave] ?? livroRaw;

  return `${livroEn} ${trecho}`;
}

export async function buscarVersiculo(referencia, traducao = TRADUCAO_PADRAO) {
  const refNorm = normalizarReferencia(referencia);
  const url = `https://bible-api.com/${encodeURIComponent(refNorm)}?translation=${traducao}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Versículo não encontrado. Verifique a referência.');
  const data = await res.json();
  if (data.error) throw new Error('Versículo não encontrado. Exemplo: "João 3:16"');

  return data.text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}
