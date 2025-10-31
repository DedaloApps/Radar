import axios from "axios";
import * as cheerio from "cheerio";
import Document from "../models/Document.js";
import https from "https";

// ============================================
// CONFIGURAÇÃO DOS STAKEHOLDERS
// ============================================
const STAKEHOLDERS_CONFIG = {
  // CONCERTAÇÃO SOCIAL
  cgtp: {
    url: "https://www.cgtp.pt/accao-e-luta",
    rss: "https://www.cgtp.pt/rss.xml",
    nome: "CGTP-IN",
    categoria: "stake_concertacao",
    seletores: [
      ".page-header h2 a",
      "h2[itemprop='headline'] a",
      ".blog-item h2 a",
      "h2 a[href*='/accao-e-luta/']",
    ],
    seletorData: ".article-info time, time[datetime]",
    seletorResumo: ".item-content p, .article-intro",
    tipo_conteudo: "noticia",
  },
  ugt: {
    url: "https://www.ugt.pt/noticias",
    rss: "https://www.ugt.pt/feed",
    nome: "UGT",
    categoria: "stake_concertacao",
    seletores: [
      ".title h6 a",
      "article.item .title a",
      ".col-md-6 article .title a",
    ],
    seletorData: ".date p",
    seletorTags: ".tags .tag",
    seletorCategoria: ".tags__category .tag",
    tipo_conteudo: "noticia",
  },
  cap: {
    url: "https://www.cap.pt/noticias-cap",
    rss: "https://www.cap.pt/feed",
    nome: "CAP",
    categoria: "stake_concertacao",
    seletores: [
      ".article-link",
      ".card-body.article-body a.article-link",
      "h3.article-title",
    ],
    seletorData: ".article-time",
    seletorResumo: ".article-excerpt",
    tipo_conteudo: "noticia",
  },
  ccp: {
    url: "https://ccp.pt/noticias/",
    rss: "https://ccp.pt/feed",
    nome: "CCP",
    categoria: "stake_concertacao",
    seletores: [
      ".card-title a",
      "h5.card-title a",
      ".grid-item .card-title a",
    ],
    seletorData: ".card-date",
    seletorResumo: ".card-text",
    tipo_conteudo: "noticia",
  },
  ctp: {
    url: "https://ctp.org.pt/noticias",
    rss: "https://ctp.org.pt/feed",
    nome: "CTP",
    categoria: "stake_concertacao",
    seletores: [
      "a.title",
      ".info a.title",
      ".article .info .title",
    ],
    seletorData: ".info > p",
    seletorResumo: ".description, p.description",
    tipo_conteudo: "noticia",
  },

  // LABORAL
  act: {
    url: "https://portal.act.gov.pt/Pages/TodasNoticias.aspx",
    baseUrl: "https://portal.act.gov.pt",
    nome: "ACT",
    timeout: 30000,
    categoria: "stake_laboral",
    seletores: [
      ".dvNewsTitulo a",
      ".dvNew .dvNewsTitulo a",
      ".col-md-12.dvNewsTitulo a",
    ],
    seletorData: ".dvNewsData",
    seletorResumo: ".dvNewsCorpo",
    tipo_conteudo: "noticia",
  },
  cite: {
    url: "https://cite.gov.pt/noticias-antigas",
    baseUrl: "https://cite.gov.pt",
    nome: "CITE",
    categoria: "stake_laboral",
    seletores: [
      ".span9 a",
      ".row-fluid .span9 a",
      "a[href*='/noticias']",
    ],
    seletorData: ".span9 p",
    seletorResumo: ".span9 p:nth-of-type(2)",
    tipo_conteudo: "noticia",
  },
  aima: {
    url: "https://aima.gov.pt/pt/noticias",
    baseUrl: "https://aima.gov.pt",
    nome: "AIMA",
    categoria: "stake_laboral",
    seletores: [
      ".uk-h4 a",
      "h3.uk-h4 a.uk-link-reset",
      ".uk-card h3 a",
    ],
    seletorData: ".uk-text-meta",
    seletorResumo: ".uk-h4 a",
    tipo_conteudo: "noticia",
  },

  // AMBIENTE
  apambiente: {
    url: "https://apambiente.pt/destaques",
    baseUrl: "https://apambiente.pt",
    nome: "APA",
    categoria: "stake_ambiente",
    seletores: [
      "h2.is-size-5 a",
      ".content h2 a",
      "article h2 a",
    ],
    seletorData: "time[datetime]",
    seletorResumo: ".content",
    tipo_conteudo: "noticia",
  },
  igamaot: {
    url: "https://www.igamaot.gov.pt/pt/espaco-publico/destaques#1",
    baseUrl: "https://www.igamaot.gov.pt",
    nome: "IGAMAOT",
    categoria: "stake_ambiente",
    seletores: [
      ".info .title a",
      ".title a[href*='/destaques/']",
      "div.title a",
    ],
    seletorData: ".tag a",
    seletorResumo: ".title a",
    tipo_conteudo: "noticia",
  },
  dgav: {
    url: "https://www.dgav.pt/destaques/noticias/",
    baseUrl: "https://www.dgav.pt",
    nome: "DGAV",
    categoria: "stake_ambiente",
    seletores: [
      "h5 a.red",
      "h5 a[rel='bookmark']",
      ".pb-3 h5 a",
    ],
    seletorData: ".green",
    seletorResumo: "h5 a",
    tipo_conteudo: "noticia",
  },
  dgeg: {
    url: "https://www.dgeg.gov.pt/pt/destaques/",
    baseUrl: "https://www.dgeg.gov.pt",
    nome: "DGEG",
    categoria: "stake_ambiente",
    seletores: [
      ".card-button a",
      ".card .card-button a",
      "a.btn.btn-link",
    ],
    seletorData: ".card-content",
    seletorResumo: ".card-content p",
    timeout: 20000,
    ignorarSSL: true,
    tipo_conteudo: "noticia",
  },
  adene: {
    url: "https://www.adene.pt/comunicacao/noticias/",
    baseUrl: "https://www.adene.pt",
    nome: "ADENE",
    categoria: "stake_ambiente",
    seletores: [
      "h4.pt-cv-title a",
      ".pt-cv-content-item h4 a",
      "a[href*='/adene-lanca']",
    ],
    seletorData: ".entry-date time",
    seletorResumo: "h4.pt-cv-title a",
    tipo_conteudo: "noticia",
  },
  erse: {
    url: "https://www.erse.pt/comunicacao/destaques/",
    baseUrl: "https://www.erse.pt",
    nome: "ERSE",
    categoria: "stake_ambiente",
    seletores: [
      ".card-body a",
      ".card.listagem a",
      "a.without-underline",
    ],
    seletorData: ".card-data",
    seletorResumo: ".card-title",
    tipo_conteudo: "noticia",
  },

  // AGRICULTURA
  dgadr: {
    url: "https://www.dgadr.gov.pt/pt/destaques",
    baseUrl: "https://www.dgadr.gov.pt",
    nome: "DGADR",
    categoria: "stake_agricultura",
    seletores: [
      ".page-header h2 a",
      "h2[itemprop='name'] a",
      ".jl-article h2 a",
    ],
    seletorData: "meta[property='datePublished']",
    seletorResumo: "[property='text'] p",
    tipo_conteudo: "noticia",
  },
  iniav: {
    url: "https://www.iniav.pt/divulgacao/noticias-iniav",
    baseUrl: "https://www.iniav.pt",
    nome: "INIAV",
    categoria: "stake_agricultura",
    seletores: [
      ".article-header h2 a",
      ".article h2 a",
      "[itemprop='blogPost'] h2 a",
    ],
    seletorData: "time[datetime]",
    seletorResumo: ".article-introtext p",
    tipo_conteudo: "noticia",
  },

  // ECONOMIA/FINANÇAS
  iapmei: {
    url: "https://www.iapmei.pt/NOTICIAS.aspx",
    baseUrl: "https://www.iapmei.pt",
    nome: "IAPMEI",
    categoria: "stake_economia",
    seletores: [
      ".contain h1 a",
      ".col-lg-3 h1 a",
      ".contain a[href*='/NOTICIAS/']",
    ],
    seletorData: ".data",
    seletorResumo: ".contain p",
    tipo_conteudo: "noticia",
  },
  concorrencia: {
    url: "https://www.concorrencia.pt/pt/noticias-comunicados-e-intervencoes",
    baseUrl: "https://www.concorrencia.pt",
    nome: "AdC",
    categoria: "noticia",
    seletores: [
      ".text-wrapper a",
      ".title a",
      "a[href*='/noticias-comunicados']",
    ],
    seletorData: ".text-wrapper .date",
    seletorResumo: ".title",
    tipo_conteudo: "comunicado",
  },
  aduaneiro: {
    url: "https://info-aduaneiro.portaldasfinancas.gov.pt/pt/noticias/Pages/noticias.aspx",
    baseUrl: "https://info-aduaneiro.portaldasfinancas.gov.pt",
    nome: "AT Aduaneiro",
    categoria: "stake_economia",
    seletores: [
      ".col-sm-9 a.more-btn",
      "a.more-btn",
      ".col-sm-9 a",
    ],
    seletorData: ".col-sm-9",
    seletorResumo: ".col-sm-9 p",
    tipo_conteudo: "noticia",
  },
  bportugal: {
    url: "https://www.bportugal.pt/comunicados/media/banco-de-portugal",
    baseUrl: "https://www.bportugal.pt",
    nome: "Banco de Portugal",
    categoria: "stake_economia",
    seletores: [
      ".content-container--slide-title--span",
      ".bdpsi-h6 .content-container--slide-title--span",
      ".content-container--link-container",
    ],
    seletorData: ".content-container--slide-date",
    seletorResumo: ".content-container--slide-title--span",
    tipo_conteudo: "comunicado",
  },
  portugalglobal: {
    url: "https://portugalglobal.pt/noticias/",
    baseUrl: "https://portugalglobal.pt",
    nome: "Portugal Global",
    categoria: "stake_economia",
    seletores: [
      "a.readingTextCard",
      ".readingTextCard.card",
      ".readingTextCard__title",
    ],
    seletorData: ".readingImageCard__infoItem",
    seletorResumo: ".readingTextCard__description",
    tipo_conteudo: "noticia",
  },
  dgae: {
    url: "https://www.dgae.gov.pt/comunicacao/noticias.aspx",
    baseUrl: "https://www.dgae.gov.pt",
    nome: "DGAE",
    categoria: "stake_economia",
    seletores: [
      ".register-title a",
      ".register .register-title a",
      "a[href*='comunicacao/noticias/']",
    ],
    seletorData: ".register-date",
    seletorResumo: ".register-text",
    tipo_conteudo: "noticia",
  },

  // SAÚDE
  infarmed: {
    url: "https://www.infarmed.pt/web/infarmed/noticias",
    baseUrl: "https://www.infarmed.pt",
    nome: "INFARMED",
    categoria: "stake_saude",
    seletores: [
      "a.event-link",
      ".event a",
      "article.event a",
    ],
    seletorData: ".event-header p",
    seletorResumo: ".event-header h4",
    tipo_conteudo: "noticia",
  },
  ers: {
    url: "https://www.ers.pt/pt/comunicacao/noticias-1/",
    nome: "ERS",
    categoria: "stake_saude",
    ignorarSSL: true,
    seletor: ".noticia-titulo a",
    tipo_conteudo: "noticia",
  },
  igas: {
    url: "https://www.igas.min-saude.pt/comunicacao/destaques/",
    nome: "IGAS",
    categoria: "stake_saude",
    seletor: ".destaque-link",
    tipo_conteudo: "noticia",
  },

  // IMOBILIÁRIO/HABITAÇÃO
  cmvm: {
    url: "https://www.cmvm.pt/PInstitucional/Content?Input=AA705D4345ECEED10489BB4C4251855EB3212B697F98169A3E39F971F60ECC1B",
    baseUrl: "https://www.cmvm.pt",
    nome: "CMVM",
    categoria: "stake_imobiliario",
    seletores: [
      ".gc-card-layout__title span",
      ".gc-card-layout__title",
    ],
    seletorData: ".gc-date", // Extração especial
    seletorResumo: ".gc-card-layout__description",
    tipo_conteudo: "comunicado",
  },
  dgterritorio: {
    url: "https://www.dgterritorio.gov.pt/todas-noticias",
    baseUrl: "https://www.dgterritorio.gov.pt",
    nome: "DGTerritório",
    categoria: "stake_imobiliario",
    seletores: [
      ".post-title a",
      ".post-block .post-title a",
    ],
    seletorData: ".post-created",
    seletorResumo: ".post-body .field--name-body",
    tipo_conteudo: "noticia",
  },
  ihru: {
    url: "https://www.ihru.pt/web/guest/noticias",
    baseUrl: "https://www.ihru.pt",
    nome: "IHRU",
    categoria: "stake_imobiliario",
    seletores: [
      ".noticiasLink a",
      ".noticiasItem .noticiasLink a",
    ],
    seletorData: ".noticiasDate",
    seletorResumo: ".noticiasTitle",
    tipo_conteudo: "noticia",
  },

  // ============================================
  // PARTIDOS POLÍTICOS
  // ============================================

  // ========== PSD ==========
  psd_observador: {
    url: "https://observador.pt/seccao/politica/psd/",
    baseUrl: "https://observador.pt",
    nome: "PSD",
    fonte_original: "Observador",
    categoria: "stake_partidos",
    seletores: [
      ".editorial-grid .mod-posttype-post h1.title a",
    ],
    seletorData: "time.timeago",
    seletorResumo: ".lead",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "PSD",
      "Social Democrata",
      "social-democrata",
      "Luís Montenegro",
      "Montenegro",
      "Marques Mendes",
      "Pedro Passos Coelho",
    ],
  },

  psd_cnn: {
    url: "https://cnnportugal.iol.pt/noticias/PSD",
    baseUrl: "https://cnnportugal.iol.pt",
    nome: "PSD",
    fonte_original: "CNN Portugal",
    categoria: "stake_partidos",
    seletores: [
      ".item a",
      ".item-title a",
      "article .item a",
    ],
    seletorData: ".item-date",
    seletorResumo: ".item-description",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "PSD",
      "Social Democrata",
      "social-democrata",
      "Luís Montenegro",
      "Montenegro",
      "Marques Mendes",
    ],
  },

  // ========== PS ==========
  ps_observador: {
    url: "https://observador.pt/seccao/politica/ps/",
    baseUrl: "https://observador.pt",
    nome: "PS",
    fonte_original: "Observador",
    categoria: "stake_partidos",
    seletores: [
      ".editorial-grid .mod-posttype-post h1.title a",
    ],
    seletorData: "time.timeago",
    seletorResumo: ".lead",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "PS",
      "Partido Socialista",
      "socialista",
      "socialistas",
      "Pedro Nuno Santos",
      "Pedro Nuno",
      "António Costa",
    ],
  },

  ps_cnn: {
    url: "https://cnnportugal.iol.pt/noticias/PS",
    baseUrl: "https://cnnportugal.iol.pt",
    nome: "PS",
    fonte_original: "CNN Portugal",
    categoria: "stake_partidos",
    seletores: [
      ".item a",
      ".item-title a",
      "article .item a",
    ],
    seletorData: ".item-date",
    seletorResumo: ".item-description",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "PS",
      "Partido Socialista",
      "socialista",
      "socialistas",
      "Pedro Nuno Santos",
      "Pedro Nuno",
    ],
  },

  // ========== CHEGA ==========
  chega_observador: {
    url: "https://observador.pt/seccao/politica/partido-chega/",
    baseUrl: "https://observador.pt",
    nome: "CHEGA",
    fonte_original: "Observador",
    categoria: "stake_partidos",
    seletores: [
      ".editorial-grid .mod-posttype-post h1.title a",
    ],
    seletorData: "time.timeago",
    seletorResumo: ".lead",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "CHEGA",
      "Chega",
      "André Ventura",
      "Ventura",
    ],
  },

  chega_cnn: {
    url: "https://cnnportugal.iol.pt/noticias/chega",
    baseUrl: "https://cnnportugal.iol.pt",
    nome: "CHEGA",
    fonte_original: "CNN Portugal",
    categoria: "stake_partidos",
    seletores: [
      ".item a",
      ".item-title a",
      "article .item a",
    ],
    seletorData: ".item-date",
    seletorResumo: ".item-description",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "CHEGA",
      "Chega",
      "André Ventura",
      "Ventura",
    ],
  },

  // ========== IL (Iniciativa Liberal) ==========
  il_observador: {
    url: "https://observador.pt/seccao/politica/iniciativa-liberal/",
    baseUrl: "https://observador.pt",
    nome: "IL",
    fonte_original: "Observador",
    categoria: "stake_partidos",
    seletores: [
      ".editorial-grid .mod-posttype-post h1.title a",
    ],
    seletorData: "time.timeago",
    seletorResumo: ".lead",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "IL",
      "Iniciativa Liberal",
      "liberal",
      "liberais",
      "Rui Rocha",
      "João Cotrim Figueiredo",
    ],
  },

  il_cnn: {
    url: "https://cnnportugal.iol.pt/noticias/iniciativa-liberal",
    baseUrl: "https://cnnportugal.iol.pt",
    nome: "IL",
    fonte_original: "CNN Portugal",
    categoria: "stake_partidos",
    seletores: [
      ".item a",
      ".item-title a",
      "article .item a",
    ],
    seletorData: ".item-date",
    seletorResumo: ".item-description",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "IL",
      "Iniciativa Liberal",
      "liberal",
      "liberais",
      "Rui Rocha",
    ],
  },

  // ========== LIVRE ==========
  livre_observador: {
    url: "https://observador.pt/seccao/politica/partido-livre-2/",
    baseUrl: "https://observador.pt",
    nome: "LIVRE",
    fonte_original: "Observador",
    categoria: "stake_partidos",
    seletores: [
      ".editorial-grid .mod-posttype-post h1.title a",
    ],
    seletorData: "time.timeago",
    seletorResumo: ".lead",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "LIVRE",
      "Livre",
      "Rui Tavares",
      "partido Livre",
    ],
  },

  livre_cnn: {
    url: "https://cnnportugal.iol.pt/noticias/livre",
    baseUrl: "https://cnnportugal.iol.pt",
    nome: "LIVRE",
    fonte_original: "CNN Portugal",
    categoria: "stake_partidos",
    seletores: [
      ".item a",
      ".item-title a",
      "article .item a",
    ],
    seletorData: ".item-date",
    seletorResumo: ".item-description",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "LIVRE",
      "Livre",
      "Rui Tavares",
      "partido Livre",
    ],
  },

  // ========== PCP ==========
  pcp_observador: {
    url: "https://observador.pt/seccao/politica/pcp-4/",
    baseUrl: "https://observador.pt",
    nome: "PCP",
    fonte_original: "Observador",
    categoria: "stake_partidos",
    seletores: [
      ".editorial-grid .mod-posttype-post h1.title a",
    ],
    seletorData: "time.timeago",
    seletorResumo: ".lead",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "PCP",
      "Partido Comunista",
      "comunista",
      "comunistas",
      "Paulo Raimundo",
      "Jerónimo de Sousa",
    ],
  },

  pcp_cnn: {
    url: "https://cnnportugal.iol.pt/noticias/pcp",
    baseUrl: "https://cnnportugal.iol.pt",
    nome: "PCP",
    fonte_original: "CNN Portugal",
    categoria: "stake_partidos",
    seletores: [
      ".item a",
      ".item-title a",
      "article .item a",
    ],
    seletorData: ".item-date",
    seletorResumo: ".item-description",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "PCP",
      "Partido Comunista",
      "comunista",
      "comunistas",
      "Paulo Raimundo",
    ],
  },

  // ========== BE (Bloco de Esquerda) ==========
  be_observador: {
    url: "https://observador.pt/seccao/politica/bloco-de-esquerda/",
    baseUrl: "https://observador.pt",
    nome: "BE",
    fonte_original: "Observador",
    categoria: "stake_partidos",
    seletores: [
      ".editorial-grid .mod-posttype-post h1.title a",
    ],
    seletorData: "time.timeago",
    seletorResumo: ".lead",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "BE",
      "Bloco de Esquerda",
      "bloquista",
      "bloquistas",
      "Mariana Mortágua",
      "Catarina Martins",
    ],
  },

  be_cnn: {
    url: "https://cnnportugal.iol.pt/noticias/be",
    baseUrl: "https://cnnportugal.iol.pt",
    nome: "BE",
    fonte_original: "CNN Portugal",
    categoria: "stake_partidos",
    seletores: [
      ".item a",
      ".item-title a",
      "article .item a",
    ],
    seletorData: ".item-date",
    seletorResumo: ".item-description",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "BE",
      "Bloco de Esquerda",
      "bloquista",
      "bloquistas",
      "Mariana Mortágua",
    ],
  },

  // ========== PAN ==========
  pan_observador: {
    url: "https://observador.pt/seccao/politica/pan/",
    baseUrl: "https://observador.pt",
    nome: "PAN",
    fonte_original: "Observador",
    categoria: "stake_partidos",
    seletores: [
      ".editorial-grid .mod-posttype-post h1.title a",
    ],
    seletorData: "time.timeago",
    seletorResumo: ".lead",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "PAN",
      "Pessoas-Animais-Natureza",
      "Inês Sousa Real",
      "partido PAN",
    ],
  },

  pan_cnn: {
    url: "https://cnnportugal.iol.pt/noticias/pan",
    baseUrl: "https://cnnportugal.iol.pt",
    nome: "PAN",
    fonte_original: "CNN Portugal",
    categoria: "stake_partidos",
    seletores: [
      ".item a",
      ".item-title a",
      "article .item a",
    ],
    seletorData: ".item-date",
    seletorResumo: ".item-description",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "PAN",
      "Pessoas-Animais-Natureza",
      "Inês Sousa Real",
      "partido PAN",
    ],
  },

  // ========== JPP (Juntos Pelo Povo) ==========
  jpp_observador: {
    url: "https://observador.pt/seccao/politica/jpp-juntos-pelo-povo/",
    baseUrl: "https://observador.pt",
    nome: "JPP",
    fonte_original: "Observador",
    categoria: "stake_partidos",
    seletores: [
      ".editorial-grid .mod-posttype-post h1.title a",
    ],
    seletorData: "time.timeago",
    seletorResumo: ".lead",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "JPP",
      "Juntos Pelo Povo",
      "Élvio Sousa",
      "partido JPP",
    ],
  },

  jpp_cnn: {
    url: "https://cnnportugal.iol.pt/noticias/jpp",
    baseUrl: "https://cnnportugal.iol.pt",
    nome: "JPP",
    fonte_original: "CNN Portugal",
    categoria: "stake_partidos",
    seletores: [
      ".item a",
      ".item-title a",
      "article .item a",
    ],
    seletorData: ".item-date",
    seletorResumo: ".item-description",
    tipo_conteudo: "noticia",
    palavras_chave: [
      "JPP",
      "Juntos Pelo Povo",
      "Élvio Sousa",
      "partido JPP",
    ],
  },
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function limparUrl(baseUrl, url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return new URL(url, baseUrl).href;
  return new URL(url, baseUrl).href;
}

// ✅ NOVA FUNÇÃO: Limpar data/hora do título
function limparTitulo(titulo) {
  if (!titulo) return titulo;
  
  return titulo
    .replace(/\s+\d{1,2}\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-z]*,?\s+\d{1,2}:\d{2}$/i, '')
    .replace(/\s+\d{1,2}\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)[,\s]+\d{4}$/i, '')
    .replace(/\s+\d{1,2}\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)[,\s]+\d{4}$/i, '')
    .replace(/\s+\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}(\s+\d{1,2}:\d{2})?$/i, '')
    .trim();
}

// ============================================
// SCRAPER DE UM STAKEHOLDER
// ============================================

async function scrapeStakeholder(stakeholderId, config) {
  console.log(`\n📡 ${config.nome} (${stakeholderId})`);
  console.log(`   URL: ${config.url}`);

  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const axiosConfig = {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
        },
        timeout: config.timeout || 15000,
      };
      
      if (config.ignorarSSL) {
        axiosConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
      }
      
      const response = await axios.get(config.url, axiosConfig);
      const $ = cheerio.load(response.data);
      const documentos = [];

      const seletores = Array.isArray(config.seletores) ? config.seletores : [config.seletor];
      
      for (const seletor of seletores) {
        const elementos = $(seletor);
        
        if (elementos.length > 0) {
          console.log(`   ✓ Seletor funcionou: "${seletor}" (${elementos.length} elementos)`);

          elementos.each((index, element) => {
            if (index >= 30) return false;

            const $link = $(element);
            const titulo = $link.text().trim();
            const url = $link.attr("href");

            if (titulo && url && titulo.length > 10) {
              const baseUrl = config.baseUrl || config.url;
              const urlCompleta = limparUrl(baseUrl, url);

              // Filtro para partidos
              if (config.categoria === "stake_partidos" && config.palavras_chave) {
                const tituloLower = titulo.toLowerCase();
                const contemPalavraChave = config.palavras_chave.some(palavra => 
                  tituloLower.includes(palavra.toLowerCase())
                );
                if (!contemPalavraChave) return;
              }

              // ✅ EXTRAÇÃO ESPECIAL PARA CMVM
              let data = new Date().toISOString().split("T")[0];
              
              if (stakeholderId === 'cmvm') {
                const $container = $link.closest(".gc-card-layout");
                const dia = $container.find(".gc-date__day").text().trim();
                const mes = $container.find(".gc-date__month").text().trim();
                const ano = $container.find(".gc-date__year").text().trim();
                
                if (dia && mes && ano) {
                  const mesesPT = {
                    'Jan': '01', 'Fev': '02', 'Mar': '03', 'Abr': '04',
                    'Mai': '05', 'Jun': '06', 'Jul': '07', 'Ago': '08',
                    'Set': '09', 'Out': '10', 'Nov': '11', 'Dez': '12'
                  };
                  const mesNum = mesesPT[mes] || '01';
                  data = `${ano}-${mesNum}-${dia.padStart(2, '0')}`;
                }
              } else if (config.seletorData) {
                // Extração normal
                const $container = $link.closest("article, .news-item, .entry, .post, .destaque, .noticia, .noticiasItem, li, div, .row-fluid, .dvNew, .uk-card, .mod, .post-block");
                const dataTexto = $container.find(config.seletorData).first().text().trim();
                if (dataTexto) {
                  const dataParsed = parseData(dataTexto);
                  if (dataParsed) data = dataParsed;
                }
              }

              // Extrair resumo
              let resumo = titulo.substring(0, 200);
              if (config.seletorResumo) {
                const $container = $link.closest("article, .news-item, .entry, .post, .destaque, .noticia, .noticiasItem, li, div, .row-fluid, .dvNew, .uk-card, .mod, .post-block");
                const resumoTexto = $container.find(config.seletorResumo).first().text().trim();
                if (resumoTexto && resumoTexto.length > 20) {
                  resumo = resumoTexto.substring(0, 300);
                }
              }

              // Filtro adicional para partidos
              if (config.categoria === "stake_partidos" && config.palavras_chave) {
                const resumoLower = resumo.toLowerCase();
                const contemPalavraChave = config.palavras_chave.some(palavra => 
                  resumoLower.includes(palavra.toLowerCase())
                );
                if (!contemPalavraChave) return;
              }

              const documento = {
                tipo_conteudo: config.tipo_conteudo,
                tipo_radar: "stakeholders",
                categoria: config.categoria,
                titulo: limparTitulo(titulo), // ✅ LIMPAR TÍTULO
                data_publicacao: data,
                url: urlCompleta,
                fonte: "stakeholders",
                entidades: config.nome,
                resumo: resumo,
              };

              if (config.categoria === "stake_partidos" && config.fonte_original) {
                documento.fonte_original = config.fonte_original;
              }

              documentos.push(documento);
            }
          });

          break;
        } else {
          console.log(`   ✗ Seletor sem resultados: "${seletor}"`);
        }
      }

      if (documentos.length === 0) {
        console.log(`  ⚠️  Nenhum documento encontrado`);
        return 0;
      }

      console.log(`  📊 Encontrados: ${documentos.length} documentos`);

      let novosGuardados = 0;
      let duplicadosIgnorados = 0;

      for (const doc of documentos) {
        try {
          const existe = await Document.findOne({ url: doc.url });

          if (!existe) {
            await Document.create(doc);
            novosGuardados++;
            console.log(`    ✅ Novo: ${doc.titulo.substring(0, 70)}...`);
          } else {
            duplicadosIgnorados++;
          }
        } catch (error) {
          if (
            error.code === "23505" ||
            error.message?.includes("duplicate key") ||
            error.message?.includes("unique constraint")
          ) {
            duplicadosIgnorados++;
          } else {
            console.error(`    ❌ Erro ao guardar: ${error.message}`);
          }
        }
      }

      console.log(`  ✅ ${config.nome}: ${novosGuardados} novos, ${duplicadosIgnorados} duplicados`);
      return novosGuardados;

    } catch (error) {
      if (tentativa < 3 && (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND')) {
        console.log(`   ⚠️  ${error.message} - Tentando novamente...`);
        continue;
      }

      if (tentativa === 3 || error.response?.status === 403) {
        if (error.response?.status === 403) {
          console.error(`  ❌ Acesso negado (403)`);
        } else if (error.code === 'ECONNABORTED') {
          console.error(`  ❌ Timeout`);
        } else if (error.response?.status === 404) {
          console.error(`  ❌ Página não encontrada (404)`);
        } else {
          console.error(`  ❌ Erro:`, error.message);
        }
        return 0;
      }
    }
  }

  console.error(`  ❌ Todas as tentativas falharam`);
  return 0;
}

// ✅ Função de parsing de datas MELHORADA
function parseData(dataString) {
  if (!dataString) return null;

  try {
    let texto = dataString
      .replace(/publicado em|publicado a|data:|em/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const mesesPT = {
      'janeiro': '01', 'jan': '01',
      'fevereiro': '02', 'fev': '02',
      'março': '03', 'mar': '03',
      'abril': '04', 'abr': '04',
      'maio': '05', 'mai': '05',
      'junho': '06', 'jun': '06',
      'julho': '07', 'jul': '07',
      'agosto': '08', 'ago': '08',
      'setembro': '09', 'set': '09',
      'outubro': '10', 'out': '10',
      'novembro': '11', 'nov': '11',
      'dezembro': '12', 'dez': '12',
    };

    // ✅ Formato: "30 10 2025" (DGTerritório)
    const matchDGT = texto.match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{4})$/);
    if (matchDGT) {
      const dia = matchDGT[1].padStart(2, '0');
      const mes = matchDGT[2].padStart(2, '0');
      const ano = matchDGT[3];
      return `${ano}-${mes}-${dia}`;
    }

    // "29 out 2025" (IHRU)
    const matchPT = texto.match(/(\d{1,2})\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s+(\d{4})/i);
    if (matchPT) {
      const dia = matchPT[1].padStart(2, '0');
      const mes = mesesPT[matchPT[2].toLowerCase()];
      const ano = matchPT[3];
      return `${ano}-${mes}-${dia}`;
    }

    // "24 de Outubro, 2025"
    const matchPTPrep = texto.match(/(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro),?\s+(\d{4})/i);
    if (matchPTPrep) {
      const dia = matchPTPrep[1].padStart(2, '0');
      const mes = mesesPT[matchPTPrep[2].toLowerCase()];
      const ano = matchPTPrep[3];
      return `${ano}-${mes}-${dia}`;
    }

    // Formatos numéricos
    const regexes = [
      /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/,
      /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,
    ];

    for (const regex of regexes) {
      const match = texto.match(regex);
      if (match) {
        let ano, mes, dia;
        if (match[1].length === 4) {
          [, ano, mes, dia] = match;
        } else {
          [, dia, mes, ano] = match;
        }
        const data = new Date(ano, mes - 1, dia);
        if (!isNaN(data.getTime())) {
          return data.toISOString().split("T")[0];
        }
      }
    }

    const data = new Date(texto);
    if (!isNaN(data.getTime())) {
      return data.toISOString().split("T")[0];
    }
  } catch (e) {
    // Ignorar
  }

  return null;
}

// ============================================
// SCRAPER DE TODOS OS STAKEHOLDERS
// ============================================

export async function scrapeTodosStakeholders() {
  console.log("\n🚀 ========== SCRAPING STAKEHOLDERS ==========");
  const inicio = Date.now();

  let totalNovos = 0;
  const totalStakeholders = Object.keys(STAKEHOLDERS_CONFIG).length;

  for (const [stakeholderId, config] of Object.entries(STAKEHOLDERS_CONFIG)) {
    const novos = await scrapeStakeholder(stakeholderId, config);
    totalNovos += novos;

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const duracao = ((Date.now() - inicio) / 1000).toFixed(2);

  console.log("\n📊 ========== RESUMO STAKEHOLDERS ==========");
  console.log(`Total de entidades: ${totalStakeholders}`);
  console.log(`Total de novos documentos: ${totalNovos}`);
  console.log(`Tempo total: ${duracao}s`);
  console.log("✅ Scraping de Stakeholders concluído!\n");

  return totalNovos;
}
