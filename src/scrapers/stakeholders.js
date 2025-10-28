import axios from "axios";
import * as cheerio from "cheerio";
import Document from "../models/Document.js";

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
      ".span9 a span",                    // ✅ Seletor correto confirmado (título no span)
      ".row-fluid .span9 a",              // Fallback 1
      "a[title*='Conferência']",          // Fallback 2
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
    nome: "APA",
    categoria: "stake_ambiente",
    seletor: ".destaque-titulo a",
    tipo_conteudo: "destaque",
  },
  igamaot: {
    url: "https://www.igamaot.gov.pt/pt/espaco-publico/destaques#1",
    nome: "IGAMAOT",
    categoria: "stake_ambiente",
    seletor: ".ms-vb a",
    tipo_conteudo: "destaque",
  },
  dgav: {
    url: "https://www.dgav.pt/destaques/noticias/",
    nome: "DGAV",
    categoria: "stake_ambiente",
    seletor: ".entry-title a",
    tipo_conteudo: "noticia",
  },
  dgeg: {
    url: "https://www.dgeg.gov.pt/pt/destaques/",
    nome: "DGEG",
    categoria: "stake_ambiente",
    seletor: ".news-item h3 a",
    tipo_conteudo: "destaque",
  },
  adene: {
    url: "https://www.adene.pt/comunicacao/noticias/",
    nome: "ADENE",
    categoria: "stake_ambiente",
    seletor: ".noticia a",
    tipo_conteudo: "noticia",
  },
  erse: {
    url: "https://www.erse.pt/comunicacao/destaques/",
    nome: "ERSE",
    categoria: "stake_ambiente",
    seletor: ".destaque h3 a",
    tipo_conteudo: "destaque",
  },

  // AGRICULTURA
  dgadr: {
    url: "https://www.dgadr.gov.pt/pt/destaques",
    nome: "DGADR",
    categoria: "stake_agricultura",
    seletor: ".destaque-item a",
    tipo_conteudo: "destaque",
  },
  iniav: {
    url: "https://www.iniav.pt/divulgacao/noticias-iniav",
    nome: "INIAV",
    categoria: "stake_agricultura",
    seletor: ".news-title a",
    tipo_conteudo: "noticia",
  },

  // ECONOMIA/FINANÇAS
  iapmei: {
    url: "https://www.iapmei.pt/NOTICIAS.aspx",
    nome: "IAPMEI",
    categoria: "stake_economia",
    seletor: ".noticia-link",
    tipo_conteudo: "noticia",
  },
  concorrencia: {
    url: "https://www.concorrencia.pt/pt/noticias-comunicados-e-intervencoes",
    nome: "AdC",
    categoria: "stake_economia",
    seletor: ".views-row h3 a",
    tipo_conteudo: "comunicado",
  },
  aduaneiro: {
    url: "https://info-aduaneiro.portaldasfinancas.gov.pt/pt/noticias/Pages/noticias.aspx",
    nome: "AT Aduaneiro",
    categoria: "stake_economia",
    seletor: ".ms-vb a",
    tipo_conteudo: "noticia",
  },
  bportugal: {
    url: "https://www.bportugal.pt/comunicados/media/banco-de-portugal",
    nome: "Banco de Portugal",
    categoria: "stake_economia",
    seletor: ".comunicado-titulo a",
    tipo_conteudo: "comunicado",
  },
  portugalglobal: {
    url: "https://portugalglobal.pt/noticias/",
    nome: "Portugal Global",
    categoria: "stake_economia",
    seletor: ".news-item h3 a",
    tipo_conteudo: "noticia",
  },
  consumidor: {
    url: "https://www.consumidor.gov.pt/comunicacao1/noticias1?page=1",
    nome: "Portal Consumidor",
    categoria: "stake_economia",
    seletor: ".noticia-titulo a",
    tipo_conteudo: "noticia",
  },
  dgae: {
    url: "https://www.dgae.gov.pt/comunicacao/noticias.aspx",
    nome: "DGAE",
    categoria: "stake_economia",
    seletor: ".news-title a",
    tipo_conteudo: "noticia",
  },

  // SAÚDE
  infarmed: {
    url: "https://www.infarmed.pt/web/infarmed/noticias",
    nome: "INFARMED",
    categoria: "stake_saude",
    seletor: ".news-title a",
    tipo_conteudo: "noticia",
  },
  ers: {
    url: "https://www.ers.pt/pt/comunicacao/noticias-1/",
    nome: "ERS",
    categoria: "stake_saude",
    seletor: ".noticia-titulo a",
    tipo_conteudo: "noticia",
  },
  igas: {
    url: "https://www.igas.min-saude.pt/comunicacao/destaques/",
    nome: "IGAS",
    categoria: "stake_saude",
    seletor: ".destaque-link",
    tipo_conteudo: "destaque",
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
    nome: "DGTerritório",
    categoria: "stake_imobiliario",
    seletor: ".news-item a",
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
      const response = await axios.get(config.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
        },
        timeout: 15000,
      });

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
