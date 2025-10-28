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

  // ✅ LABORAL - CORRIGIDO
  act: {
    url: "https://portal.act.gov.pt/Pages/TodasNoticias.aspx",
    baseUrl: "https://portal.act.gov.pt",
    nome: "ACT",
    timeout: 30000,  // ACT é lento
    categoria: "stake_laboral",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".dvNewsTitulo a",                  // ✅ Seletor correto confirmado
      ".dvNew .dvNewsTitulo a",           // Fallback 1
      ".col-md-12.dvNewsTitulo a",        // Fallback 2
    ],
    seletorData: ".dvNewsData",           // Data: "09/10/2025"
    seletorResumo: ".dvNewsCorpo",        // Resumo da notícia
    tipo_conteudo: "noticia",
  },
  cite: {
    url: "https://cite.gov.pt/noticias-antigas",
    baseUrl: "https://cite.gov.pt",
    nome: "CITE",
    categoria: "stake_laboral",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".span9 a",                    // ✅ Seletor correto confirmado (título no span)
      ".row-fluid .span9 a",              // Fallback 1
      "a[href*='/noticias']",          // Fallback 2
    ],
    seletorData: ".span9 p",              // Data: "28-10-2025" (primeiro p)
    seletorResumo: ".span9 p:nth-of-type(2)", // Resumo (segundo p)
    tipo_conteudo: "noticia",
  },
  aima: {
    url: "https://aima.gov.pt/pt/noticias",
    baseUrl: "https://aima.gov.pt",
    nome: "AIMA",
    categoria: "stake_laboral",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".uk-h4 a",                         // ✅ Seletor correto confirmado
      "h3.uk-h4 a.uk-link-reset",         // Fallback 1
      ".uk-card h3 a",                    // Fallback 2
    ],
    seletorData: ".uk-text-meta",         // Data: "24.10.2025"
    seletorResumo: ".uk-h4 a",            // AIMA não tem resumo, usar título
    tipo_conteudo: "noticia",
  },

  // AMBIENTE
  apambiente: {
    url: "https://apambiente.pt/destaques",
    baseUrl: "https://apambiente.pt",
    nome: "APA",
    categoria: "stake_ambiente",
    // ✅ Seletores baseados em HTML real
    seletores: [
      "h2.is-size-5 a",                       // ✅ Seletor correto confirmado
      ".content h2 a",                        // Fallback 1
      "article h2 a",                         // Fallback 2
    ],
    seletorData: "time[datetime]",            // Data: "2025-10-28T10:40:12+00:00"
    seletorResumo: ".content",                // Resumo após o título
    tipo_conteudo: "noticia",
  },
  igamaot: {
    url: "https://www.igamaot.gov.pt/pt/espaco-publico/destaques#1",
    baseUrl: "https://www.igamaot.gov.pt",
    nome: "IGAMAOT",
    categoria: "stake_ambiente",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".info .title a",                       // ✅ Seletor correto confirmado
      ".title a[href*='/destaques/']",        // Fallback 1
      "div.title a",                          // Fallback 2
    ],
    seletorData: ".tag a",                    // Data: "2025-10-28" (dentro de .tag)
    seletorResumo: ".title a",                // IGAMAOT não tem resumo, usar título
    tipo_conteudo: "noticia",
  },
  dgav: {
    url: "https://www.dgav.pt/destaques/noticias/",
    baseUrl: "https://www.dgav.pt",
    nome: "DGAV",
    categoria: "stake_ambiente",
    // ✅ Seletores baseados em HTML real
    seletores: [
      "h5 a.red",                             // ✅ Seletor correto confirmado
      "h5 a[rel='bookmark']",                 // Fallback 1
      ".pb-3 h5 a",                           // Fallback 2
    ],
    seletorData: ".green",                    // Data: "28/10/2025" (span com class green)
    seletorResumo: "h5 a",                    // DGAV não tem resumo, usar título
    tipo_conteudo: "noticia",
  },
  dgeg: {
    url: "https://www.dgeg.gov.pt/pt/destaques/",
    baseUrl: "https://www.dgeg.gov.pt",
    nome: "DGEG",
    categoria: "stake_ambiente",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".card-button a",                       // ✅ Link "Ler mais" - CORRIGIDO
      ".card .card-button a",                 // Fallback 1
      "a.btn.btn-link",                       // Fallback 2
    ],
    seletorData: ".card-content",             // DGEG não tem data visível no HTML fornecido
    seletorResumo: ".card-content p",         // Resumo vazio no exemplo, mas preservar para futuro
    timeout: 20000,
    ignorarSSL: true,  // DGEG tem problema de certificado
    tipo_conteudo: "noticia",
  },
  adene: {
    url: "https://www.adene.pt/comunicacao/noticias/",
    baseUrl: "https://www.adene.pt",
    nome: "ADENE",
    categoria: "stake_ambiente",
    // ✅ Seletores baseados em HTML real
    seletores: [
      "h4.pt-cv-title a",                     // ✅ Seletor correto confirmado
      ".pt-cv-content-item h4 a",             // Fallback 1
      "a[href*='/adene-lanca']",              // Fallback 2
    ],
    seletorData: ".entry-date time",          // Data: "Outubro 27, 2025" (time[datetime])
    seletorResumo: "h4.pt-cv-title a",        // ADENE não tem resumo, usar título
    tipo_conteudo: "noticia",
  },
  erse: {
    url: "https://www.erse.pt/comunicacao/destaques/",
    baseUrl: "https://www.erse.pt",
    nome: "ERSE",
    categoria: "stake_ambiente",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".card-body a",                         // ✅ Link correto - CORRIGIDO
      ".card.listagem a",                     // Fallback 1
      "a.without-underline",                  // Fallback 2
    ],
    seletorData: ".card-data",                // Data: "28/10/2025" (p.card-text.card-data)
    seletorResumo: ".card-title",             // ERSE não tem resumo, usar título
    tipo_conteudo: "noticia",
  },

  // AGRICULTURA
  dgadr: {
    url: "https://www.dgadr.gov.pt/pt/destaques",
    baseUrl: "https://www.dgadr.gov.pt",
    nome: "DGADR",
    categoria: "stake_agricultura",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".page-header h2 a",                    // ✅ Seletor correto confirmado
      "h2[itemprop='name'] a",                // Fallback 1
      ".jl-article h2 a",                     // Fallback 2
    ],
    seletorData: "meta[property='datePublished']", // Data: "2025-10-24T12:24:33+01:00"
    seletorResumo: "[property='text'] p",     // Resumo do artigo
    tipo_conteudo: "noticia",
  },
  iniav: {
    url: "https://www.iniav.pt/divulgacao/noticias-iniav",
    baseUrl: "https://www.iniav.pt",
    nome: "INIAV",
    categoria: "stake_agricultura",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".article-header h2 a",                 // ✅ Seletor correto confirmado
      ".article h2 a",                        // Fallback 1
      "[itemprop='blogPost'] h2 a",           // Fallback 2
    ],
    seletorData: "time[datetime]",            // Data: "2025-10-23T10:04:43+01:00"
    seletorResumo: ".article-introtext p",    // Resumo da notícia
    tipo_conteudo: "noticia",
  },



  // ECONOMIA/FINANÇAS
  iapmei: {
    url: "https://www.iapmei.pt/NOTICIAS.aspx",
    baseUrl: "https://www.iapmei.pt",
    nome: "IAPMEI",
    categoria: "stake_economia",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".contain h1 a",                        // ✅ Seletor correto confirmado
      ".col-lg-3 h1 a",                       // Fallback 1
      ".contain a[href*='/NOTICIAS/']",       // Fallback 2
    ],
    seletorData: ".data",                     // Data: "27-10-2025"
    seletorResumo: ".contain p",              // Resumo da notícia
    tipo_conteudo: "noticia",
  },
  concorrencia: {
    url: "https://www.concorrencia.pt/pt/noticias-comunicados-e-intervencoes",
    baseUrl: "https://www.concorrencia.pt",
    nome: "AdC",
    categoria: "stake_economia",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".text-wrapper a",                      // Link wrapper (assumindo que existe)
      ".title a",                             // Fallback 1  
      "a[href*='/noticias-comunicados']",     // Fallback 2
    ],
    seletorData: ".text-wrapper .date",       // Data: "23-10-2025"
    seletorResumo: ".title",                  // AdC não tem resumo separado, usar título
    tipo_conteudo: "comunicado",
  },
  aduaneiro: {
    url: "https://info-aduaneiro.portaldasfinancas.gov.pt/pt/noticias/Pages/noticias.aspx",
    baseUrl: "https://info-aduaneiro.portaldasfinancas.gov.pt",
    nome: "AT Aduaneiro",
    categoria: "stake_economia",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".col-sm-9 a.more-btn",                 // ✅ Link "Ver mais"
      "a.more-btn",                           // Fallback 1
      ".col-sm-9 a",                          // Fallback 2
    ],
    seletorData: ".col-sm-9",                 // AT Aduaneiro não tem data visível
    seletorResumo: ".col-sm-9 p",             // Resumo da notícia
    tipo_conteudo: "noticia",
  },
  bportugal: {
    url: "https://www.bportugal.pt/comunicados/media/banco-de-portugal",
    baseUrl: "https://www.bportugal.pt",
    nome: "Banco de Portugal",
    categoria: "stake_economia",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".content-container--slide-title--span", // ✅ Seletor correto confirmado
      ".bdpsi-h6 .content-container--slide-title--span", // Fallback 1
      ".content-container--link-container",   // Fallback 2
    ],
    seletorData: ".content-container--slide-date", // Data: "27-10-2025"
    seletorResumo: ".content-container--slide-title--span", // Banco Portugal não tem resumo, usar título
    tipo_conteudo: "comunicado",
  },
  portugalglobal: {
    url: "https://portugalglobal.pt/noticias/",
    baseUrl: "https://portugalglobal.pt",
    nome: "Portugal Global",
    categoria: "stake_economia",
    // ✅ Seletores baseados em HTML real
    seletores: [
      "a.readingTextCard",                    // ✅ Link principal - CORRIGIDO
      ".readingTextCard.card",                // Fallback 1
      ".readingTextCard__title",              // Fallback 2 (título dentro do link)
    ],
    seletorData: ".readingImageCard__infoItem", // Data: "31/10/2025"
    seletorResumo: ".readingTextCard__description", // Resumo da notícia
    tipo_conteudo: "noticia",
  },
  // ⚠️ DESATIVADO - Portal Consumidor não tem links individuais para notícias no HTML
  // consumidor: {
  //   url: "https://www.consumidor.gov.pt/comunicacao1/noticias1?page=1",
  //   baseUrl: "https://www.consumidor.gov.pt",
  //   nome: "Portal Consumidor",
  //   categoria: "stake_economia",
  //   seletores: [
  //     ".MainCard2__content a",
  //     ".card-body a",
  //     "a[href*='/comunicacao1/noticias1/']",
  //   ],
  //   seletorData: ".MainCard2__contentDate",
  //   seletorResumo: ".MainCard2__contentText",
  //   tipo_conteudo: "noticia",
  // },
  dgae: {
    url: "https://www.dgae.gov.pt/comunicacao/noticias.aspx",
    baseUrl: "https://www.dgae.gov.pt",
    nome: "DGAE",
    categoria: "stake_economia",
    // ✅ Seletores baseados em HTML real
    seletores: [
      ".register-title a",                    // ✅ Seletor correto confirmado
      ".register .register-title a",          // Fallback 1
      "a[href*='comunicacao/noticias/']",     // Fallback 2
    ],
    seletorData: ".register-date",            // Data: "2025-10-28"
    seletorResumo: ".register-text",          // Resumo da notícia
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
    ignorarSSL: true,  // ERS tem problema de certificado
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
    url: "https://www.cmvm.pt/pt/Comunicados/Paginas/Index.aspx",
    nome: "CMVM",
    categoria: "stake_imobiliario",
    seletor: ".comunicado-link",
    tipo_conteudo: "comunicado",
  },
  dgterritorio: {
    url: "https://www.dgterritorio.gov.pt/noticias",
    baseUrl: "https://www.dgterritorio.gov.pt",
    nome: "DGTerritório",
    categoria: "stake_imobiliario",
    seletores: [
      ".post-title a",
      ".post-block .post-title a",
      "a[href*='/ciclo']",
    ],
    seletorData: ".post-created",
    seletorResumo: ".post-body",
    tipo_conteudo: "noticia",
  },
  ihru: {
    url: "https://www.ihru.pt/web/guest/noticias",
    baseUrl: "https://www.ihru.pt",
    nome: "IHRU",
    categoria: "stake_imobiliario",
    seletores: [
      ".noticiasLink a",
      ".noticiasItem a",
      "a[title*='Saber mais']",
    ],
    seletorData: ".noticiasDate",
    seletorResumo: ".noticiasTitle",
    tipo_conteudo: "noticia",
  },







  ihru: {
    url: "https://www.ihru.pt/web/guest/noticias",
    nome: "IHRU",
    categoria: "stake_imobiliario",
    seletor: ".portlet-title a",
    tipo_conteudo: "noticia",
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

// ============================================
// SCRAPER DE UM STAKEHOLDER
// ============================================

async function scrapeStakeholder(stakeholderId, config) {
  console.log(`\n📡 ${config.nome} (${stakeholderId})`);
  console.log(`   URL: ${config.url}`);

  // Tentar 3 vezes antes de desistir
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
      let seletorUsado = null;

      // Tentar cada seletor até encontrar resultados
      const seletores = Array.isArray(config.seletores) ? config.seletores : [config.seletor];
      
      for (const seletor of seletores) {
        const elementos = $(seletor);
        
        if (elementos.length > 0) {
          console.log(`   ✓ Seletor funcionou: "${seletor}" (${elementos.length} elementos)`);
          seletorUsado = seletor;

          elementos.each((index, element) => {
            if (index >= 30) return false; // Limitar a 30 notícias

            const $link = $(element);
            const titulo = $link.text().trim();
            const url = $link.attr("href");

            if (titulo && url && titulo.length > 10) {
              const baseUrl = config.baseUrl || config.url;
              const urlCompleta = limparUrl(baseUrl, url);

              // Extrair data
              let data = new Date().toISOString().split("T")[0];
              if (config.seletorData) {
                const $container = $link.closest("article, .news-item, .entry, .post, .destaque, .noticia, li, div, .row-fluid, .dvNew, .uk-card");
                const dataTexto = $container.find(config.seletorData).first().text().trim();
                if (dataTexto) {
                  const dataParsed = parseData(dataTexto);
                  if (dataParsed) data = dataParsed;
                }
              }

              // Extrair resumo
              let resumo = titulo.substring(0, 200);
              if (config.seletorResumo) {
                const $container = $link.closest("article, .news-item, .entry, .post, .destaque, .noticia, li, div, .row-fluid, .dvNew, .uk-card");
                const resumoTexto = $container.find(config.seletorResumo).first().text().trim();
                if (resumoTexto && resumoTexto.length > 20) {
                  resumo = resumoTexto.substring(0, 300);
                }
              }

              documentos.push({
                tipo_conteudo: config.tipo_conteudo,
                tipo_radar: "stakeholders",
                categoria: config.categoria,
                titulo: titulo,
                data_publicacao: data,
                url: urlCompleta,
                fonte: "stakeholders",
                entidades: config.nome,
                resumo: resumo,
              });
            }
          });

          break; // Encontrou resultados
        } else {
          console.log(`   ✗ Seletor sem resultados: "${seletor}"`);
        }
      }

      if (documentos.length === 0) {
        console.log(`  ⚠️  Nenhum documento encontrado`);
        return 0;
      }

      console.log(`  📊 Encontrados: ${documentos.length} documentos`);

      // Guardar na BD
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
          console.error(`  ❌ Acesso negado (403) - site tem proteção anti-scraping`);
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

// Função auxiliar para parsing de datas
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

    // "22 outubro 2025"
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

    // Formatos numéricos: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
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

    // Pausa entre requests
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
