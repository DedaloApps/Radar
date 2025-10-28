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
    rss: "https://www.cgtp.pt/rss.xml", // Tentar RSS primeiro
    nome: "CGTP-IN",
    categoria: "stake_concertacao",
    // ✅ Seletores baseados em HTML real fornecido pelo utilizador
    seletores: [
      ".page-header h2 a",              // ✅ Seletor correto confirmado
      "h2[itemprop='headline'] a",      // Fallback 1
      ".blog-item h2 a",                // Fallback 2
      "h2 a[href*='/accao-e-luta/']",   // Fallback 3
    ],
    seletorData: ".article-info time, time[datetime]",
    seletorResumo: ".item-content p, .article-intro",
    tipo_conteudo: "noticia",
  },
  ugt: {
    url: "https://www.ugt.pt/noticias",
    rss: "https://www.ugt.pt/feed", // Tentar RSS
    nome: "UGT",
    categoria: "stake_concertacao",
    // ✅ Seletores baseados em HTML real fornecido pelo utilizador
    seletores: [
      ".title h6 a",                    // ✅ Seletor correto confirmado
      "article.item .title a",          // Fallback 1
      ".col-md-6 article .title a",     // Fallback 2
    ],
    seletorData: ".date p",              // Data: "22 outubro 2025"
    seletorTags: ".tags .tag",           // Tags da notícia
    seletorCategoria: ".tags__category .tag",  // Categoria
    tipo_conteudo: "noticia",
  },
  cap: {
    url: "https://www.cap.pt/noticias-cap",
    rss: "https://www.cap.pt/feed", // Tentar RSS
    nome: "CAP",
    categoria: "stake_concertacao",
    // ✅ Seletores baseados em HTML real fornecido pelo utilizador
    seletores: [
      ".article-link",                  // ✅ Seletor correto confirmado
      ".card-body.article-body a.article-link", // Fallback 1
      "h3.article-title",               // Fallback 2 (pegar texto do h3)
    ],
    seletorData: ".article-time",       // Data: "22 out 2025"
    seletorResumo: ".article-excerpt",  // Resumo da notícia
    tipo_conteudo: "noticia",
  },
  ccp: {
    url: "https://ccp.pt/noticias/",
    rss: "https://ccp.pt/feed", // Tentar RSS
    nome: "CCP",
    categoria: "stake_concertacao",
    seletores: [
      ".post-title a",
      "article h2 a",
      ".entry-title a",
      "h2 a[href*='/noticias/']",
      ".news-item a"
    ],
    seletorData: ".post-date, .entry-date, time, .published",
    seletorResumo: ".post-excerpt, .entry-summary, p",
    tipo_conteudo: "noticia",
  },
  ctp: {
    url: "https://ctp.org.pt/noticias",
    rss: "https://ctp.org.pt/feed", // Tentar RSS
    nome: "CTP",
    categoria: "stake_concertacao",
    seletores: [
      "article h2 a",
      ".entry-title a",
      ".post-title a",
      "h3 a[href*='/noticias']",
      ".news-item a"
    ],
    seletorData: ".entry-date, .post-date, time, .published",
    seletorResumo: ".entry-excerpt, .post-excerpt, p",
    tipo_conteudo: "noticia",
  },

  // LABORAL
  act: {
    url: "https://portal.act.gov.pt/Pages/TodasNoticias.aspx#1",
    nome: "ACT",
    categoria: "stake_laboral",
    seletores: [".ms-vb a", "article a", ".news-item a"],
    seletorData: ".ms-vb-lastmod, .date, time",
    seletorResumo: ".ms-vb-brief, p",
    tipo_conteudo: "noticia",
  },
  cite: {
    url: "https://cite.gov.pt/noticias-antigas",
    nome: "CITE",
    categoria: "stake_laboral",
    seletores: [".entry-title a", "article h2 a", ".news-title a"],
    seletorData: ".entry-date, time, .published",
    seletorResumo: ".entry-summary, p",
    tipo_conteudo: "noticia",
  },
  aima: {
    url: "https://aima.gov.pt/pt/noticias",
    nome: "AIMA",
    categoria: "stake_laboral",
    seletores: [".news-item h3 a", "article a", ".noticia a"],
    seletorData: ".news-date, time, .published",
    seletorResumo: ".news-summary, p",
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
    seletor: ".news-item h3 a",
    tipo_conteudo: "noticia",
  },
  ers: {
    url: "https://www.ers.pt/pt/comunicacao/noticias/",
    nome: "ERS",
    categoria: "stake_saude",
    seletor: ".noticia-titulo a",
    tipo_conteudo: "noticia",
  },
  igas: {
    url: "https://www.igas.min-saude.pt/category/noticias-e-eventos/noticias/",
    nome: "IGAS",
    categoria: "stake_saude",
    seletor: ".entry-title a",
    tipo_conteudo: "noticia",
  },

  // IMOBILIÁRIO/HABITAÇÃO
  cmvm: {
    url: "https://www.cmvm.pt/PInstitucional/Content?Input=E9639BDA21F5F3D13613E5F7C187F1A785B6EE9D48F21D9B121B7E5EC2D6A6F5",
    nome: "CMVM",
    categoria: "stake_imobiliario",
    seletor: ".comunicado a",
    tipo_conteudo: "comunicado",
  },
  dgterritorio: {
    url: "https://www.dgterritorio.gov.pt/todas-noticias",
    nome: "DGTerritório",
    categoria: "stake_imobiliario",
    seletor: ".news-title a",
    tipo_conteudo: "noticia",
  },
  ihru: {
    url: "https://www.ihru.pt/noticias",
    nome: "IHRU",
    categoria: "stake_imobiliario",
    seletor: ".noticia-item a",
    tipo_conteudo: "noticia",
  },
};

// ============================================
// FUNÇÕES HELPER
// ============================================

function limparUrl(urlBase, urlRelativo) {
  if (!urlRelativo) return "";
  urlRelativo = urlRelativo.trim();

  if (urlRelativo.startsWith("http://") || urlRelativo.startsWith("https://")) {
    return urlRelativo;
  }

  if (urlRelativo.startsWith("//")) {
    return `https:${urlRelativo}`;
  }

  if (urlRelativo.startsWith("/")) {
    const dominio = new URL(urlBase).origin;
    return `${dominio}${urlRelativo}`;
  }

  return `${urlBase}/${urlRelativo}`;
}

function extrairData($, element) {
  // Tentar encontrar data em vários formatos comuns
  const dataTexto = $(element)
    .find(".data, .date, time, .published")
    .first()
    .text()
    .trim();

  if (dataTexto) {
    // Converter para ISO se possível
    try {
      const data = new Date(dataTexto);
      if (!isNaN(data.getTime())) {
        return data.toISOString().split("T")[0];
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
  }

  // Default: data de hoje
  return new Date().toISOString().split("T")[0];
}

// ============================================
// SCRAPER GENÉRICO MELHORADO
// ============================================

// User-Agents variados para evitar bloqueios
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function scrapeStakeholder(stakeholderId, config) {
  console.log(`\n🔍 Scraping ${config.nome} (${stakeholderId})...`);
  console.log(`   URL: ${config.url}`);

  // Tentar com retry (até 3 tentativas)
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      if (tentativa > 1) {
        console.log(`   🔄 Tentativa ${tentativa}/3...`);
        // Delay maior entre retries
        await new Promise(resolve => setTimeout(resolve, 3000 * tentativa));
      }

      const response = await axios.get(config.url, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "DNT": "1",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Cache-Control": "max-age=0",
          "Referer": new URL(config.url).origin,
        },
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // Aceitar 4xx para tratar depois
      });

      // Verificar status
      if (response.status === 403) {
        if (tentativa < 3) {
          console.log(`   ⚠️  Status 403 - Tentando novamente...`);
          continue; // Tentar próxima iteração
        }
        throw new Error('Status 403 - Acesso negado após 3 tentativas');
      }

      if (response.status === 404) {
        console.error(`  ❌ Página não encontrada (404)`);
        return 0;
      }

      if (response.status >= 400) {
        throw new Error(`Status HTTP ${response.status}`);
      }

      const $ = cheerio.load(response.data);
      const documentos = [];
      let seletorUsado = null;

      // Suportar configuração antiga (seletor único) e nova (múltiplos seletores)
      const seletores = config.seletores || [config.seletor];

      // Tentar cada seletor até encontrar resultados
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
              const urlCompleta = limparUrl(config.url, url);

              // Extrair data se existir seletor
              let data = new Date().toISOString().split("T")[0];
              if (config.seletorData) {
                const $container = $link.closest("article, .news-item, .entry, .post, .destaque, .noticia, li, div");
                const dataTexto = $container.find(config.seletorData).first().text().trim();
                if (dataTexto) {
                  const dataParsed = parseData(dataTexto);
                  if (dataParsed) data = dataParsed;
                }
              }

              // Extrair resumo se existir seletor
              let resumo = titulo.substring(0, 200);
              if (config.seletorResumo) {
                const $container = $link.closest("article, .news-item, .entry, .post, .destaque, .noticia, li, div");
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
                fonte: stakeholderId,
                entidades: config.nome,
                resumo: resumo,
              });
            }
          });

          break; // Encontrou resultados, não precisa testar outros seletores
        } else {
          console.log(`   ✗ Seletor sem resultados: "${seletor}"`);
        }
      }

      if (documentos.length === 0) {
        console.log(`  ⚠️  Nenhum documento encontrado com os seletores configurados`);
        return 0;
      }

      console.log(`  📊 Encontrados: ${documentos.length} documentos (seletor: "${seletorUsado}")`);

      // Guardar na base de dados
      let novosGuardados = 0;
      let duplicadosIgnorados = 0;

      for (const doc of documentos) {
        try {
          // Verificar se já existe
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

      console.log(
        `  ✅ ${config.nome}: ${novosGuardados} novos, ${duplicadosIgnorados} duplicados`
      );
      return novosGuardados;

    } catch (error) {
      // Se não for a última tentativa e for erro de conexão, continuar
      if (tentativa < 3 && (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND')) {
        console.log(`   ⚠️  ${error.message} - Tentando novamente...`);
        continue;
      }

      // Última tentativa ou erro não recuperável
      if (tentativa === 3 || error.response?.status === 403) {
        if (error.response?.status === 403) {
          console.error(`  ❌ Acesso negado (403) para ${config.nome} - site tem proteção anti-scraping forte`);
        } else if (error.code === 'ECONNABORTED') {
          console.error(`  ❌ Timeout ao aceder ${config.nome}`);
        } else if (error.response?.status === 404) {
          console.error(`  ❌ Página não encontrada (404) para ${config.nome}`);
        } else {
          console.error(`  ❌ Erro no scraping de ${config.nome}:`, error.message);
        }
        return 0;
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  console.error(`  ❌ Todas as tentativas falharam para ${config.nome}`);
  return 0;
}

// Função auxiliar para parsing de datas melhorada
function parseData(dataString) {
  if (!dataString) return null;

  try {
    // Remover texto extra e normalizar
    let texto = dataString
      .replace(/publicado em|publicado a|data:|em/gi, "")
      .replace(/\s+/g, " ")  // Normalizar espaços
      .trim();

    // Mapa de meses em português
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

    // Formato: "22 outubro 2025" (UGT)
    const matchPT = texto.match(/(\d{1,2})\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s+(\d{4})/i);
    if (matchPT) {
      const dia = matchPT[1].padStart(2, '0');
      const mes = mesesPT[matchPT[2].toLowerCase()];
      const ano = matchPT[3];
      return `${ano}-${mes}-${dia}`;
    }

    // Tentar formatos comuns numéricos
    const regexes = [
      /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/,  // 15/01/2025 ou 15-01-2025
      /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,  // 2025-01-15
    ];

    for (const regex of regexes) {
      const match = texto.match(regex);
      if (match) {
        let ano, mes, dia;
        if (match[1].length === 4) {
          // Formato YYYY-MM-DD
          [, ano, mes, dia] = match;
        } else {
          // Formato DD/MM/YYYY
          [, dia, mes, ano] = match;
        }
        const data = new Date(ano, mes - 1, dia);
        if (!isNaN(data.getTime())) {
          return data.toISOString().split("T")[0];
        }
      }
    }

    // Tentar parseamento direto
    const data = new Date(texto);
    if (!isNaN(data.getTime())) {
      return data.toISOString().split("T")[0];
    }
  } catch (e) {
    // Ignorar erros
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
