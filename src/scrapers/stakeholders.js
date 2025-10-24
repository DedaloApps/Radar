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
    nome: "CGTP",
    categoria: "concertacao_social",
    seletor: ".entry-title a", // Ajustar conforme HTML real
    tipo_conteudo: "noticia"
  },
  ugt: {
    url: "https://www.ugt.pt/noticias",
    nome: "UGT",
    categoria: "concertacao_social",
    seletor: ".news-item h3 a",
    tipo_conteudo: "noticia"
  },
  cap: {
    url: "https://www.cap.pt/noticias-cap",
    nome: "CAP",
    categoria: "concertacao_social",
    seletor: ".noticia-titulo a",
    tipo_conteudo: "noticia"
  },
  ccp: {
    url: "https://ccp.pt/noticias/",
    nome: "CCP",
    categoria: "concertacao_social",
    seletor: ".post-title a",
    tipo_conteudo: "noticia"
  },
  ctp: {
    url: "https://ctp.org.pt/noticias",
    nome: "CTP",
    categoria: "concertacao_social",
    seletor: "article h2 a",
    tipo_conteudo: "noticia"
  },

  // LABORAL
  act: {
    url: "https://portal.act.gov.pt/Pages/TodasNoticias.aspx#1",
    nome: "ACT",
    categoria: "laboral",
    seletor: ".ms-vb a",
    tipo_conteudo: "noticia"
  },
  cite: {
    url: "https://cite.gov.pt/noticias-antigas",
    nome: "CITE",
    categoria: "laboral",
    seletor: ".entry-title a",
    tipo_conteudo: "noticia"
  },
  aima: {
    url: "https://aima.gov.pt/pt/noticias",
    nome: "AIMA",
    categoria: "laboral",
    seletor: ".news-item h3 a",
    tipo_conteudo: "noticia"
  },

  // AMBIENTE
  apambiente: {
    url: "https://apambiente.pt/destaques",
    nome: "APA",
    categoria: "ambiente",
    seletor: ".destaque-titulo a",
    tipo_conteudo: "destaque"
  },
  igamaot: {
    url: "https://www.igamaot.gov.pt/pt/espaco-publico/destaques#1",
    nome: "IGAMAOT",
    categoria: "ambiente",
    seletor: ".ms-vb a",
    tipo_conteudo: "destaque"
  },
  dgav: {
    url: "https://www.dgav.pt/destaques/noticias/",
    nome: "DGAV",
    categoria: "ambiente",
    seletor: ".entry-title a",
    tipo_conteudo: "noticia"
  },
  dgeg: {
    url: "https://www.dgeg.gov.pt/pt/destaques/",
    nome: "DGEG",
    categoria: "ambiente",
    seletor: ".news-item h3 a",
    tipo_conteudo: "destaque"
  },
  adene: {
    url: "https://www.adene.pt/comunicacao/noticias/",
    nome: "ADENE",
    categoria: "ambiente",
    seletor: ".noticia a",
    tipo_conteudo: "noticia"
  },
  erse: {
    url: "https://www.erse.pt/comunicacao/destaques/",
    nome: "ERSE",
    categoria: "ambiente",
    seletor: ".destaque h3 a",
    tipo_conteudo: "destaque"
  },

  // AGRICULTURA
  dgadr: {
    url: "https://www.dgadr.gov.pt/pt/destaques",
    nome: "DGADR",
    categoria: "agricultura",
    seletor: ".destaque-item a",
    tipo_conteudo: "destaque"
  },
  iniav: {
    url: "https://www.iniav.pt/divulgacao/noticias-iniav",
    nome: "INIAV",
    categoria: "agricultura",
    seletor: ".news-title a",
    tipo_conteudo: "noticia"
  },

  // ECONOMIA/FINANÇAS
  iapmei: {
    url: "https://www.iapmei.pt/NOTICIAS.aspx",
    nome: "IAPMEI",
    categoria: "economia_financas",
    seletor: ".noticia-link",
    tipo_conteudo: "noticia"
  },
  concorrencia: {
    url: "https://www.concorrencia.pt/pt/noticias-comunicados-e-intervencoes",
    nome: "AdC",
    categoria: "economia_financas",
    seletor: ".views-row h3 a",
    tipo_conteudo: "comunicado"
  },
  aduaneiro: {
    url: "https://info-aduaneiro.portaldasfinancas.gov.pt/pt/noticias/Pages/noticias.aspx",
    nome: "AT Aduaneiro",
    categoria: "economia_financas",
    seletor: ".ms-vb a",
    tipo_conteudo: "noticia"
  },
  bportugal: {
    url: "https://www.bportugal.pt/comunicados/media/banco-de-portugal",
    nome: "Banco de Portugal",
    categoria: "economia_financas",
    seletor: ".comunicado-titulo a",
    tipo_conteudo: "comunicado"
  },
  portugalglobal: {
    url: "https://portugalglobal.pt/noticias/",
    nome: "Portugal Global",
    categoria: "economia_financas",
    seletor: ".news-item h3 a",
    tipo_conteudo: "noticia"
  },
  consumidor: {
    url: "https://www.consumidor.gov.pt/comunicacao1/noticias1?page=1",
    nome: "Portal Consumidor",
    categoria: "economia_financas",
    seletor: ".noticia-titulo a",
    tipo_conteudo: "noticia"
  },
  dgae: {
    url: "https://www.dgae.gov.pt/comunicacao/noticias.aspx",
    nome: "DGAE",
    categoria: "economia_financas",
    seletor: ".news-title a",
    tipo_conteudo: "noticia"
  },

  // SAÚDE
  infarmed: {
    url: "https://www.infarmed.pt/web/infarmed/noticias",
    nome: "INFARMED",
    categoria: "saude",
    seletor: ".news-item h3 a",
    tipo_conteudo: "noticia"
  },
  ers: {
    url: "https://www.ers.pt/pt/comunicacao/noticias/",
    nome: "ERS",
    categoria: "saude",
    seletor: ".noticia-titulo a",
    tipo_conteudo: "noticia"
  },
  igas: {
    url: "https://www.igas.min-saude.pt/category/noticias-e-eventos/noticias/",
    nome: "IGAS",
    categoria: "saude",
    seletor: ".entry-title a",
    tipo_conteudo: "noticia"
  },

  // IMOBILIÁRIO/HABITAÇÃO
  cmvm: {
    url: "https://www.cmvm.pt/PInstitucional/Content?Input=E9639BDA21F5F3D13613E5F7C187F1A785B6EE9D48F21D9B121B7E5EC2D6A6F5",
    nome: "CMVM",
    categoria: "imobiliario_habitacao",
    seletor: ".comunicado a",
    tipo_conteudo: "comunicado"
  },
  dgterritorio: {
    url: "https://www.dgterritorio.gov.pt/todas-noticias",
    nome: "DGTerritório",
    categoria: "imobiliario_habitacao",
    seletor: ".news-title a",
    tipo_conteudo: "noticia"
  },
  ihru: {
    url: "https://www.ihru.pt/noticias",
    nome: "IHRU",
    categoria: "imobiliario_habitacao",
    seletor: ".noticia-item a",
    tipo_conteudo: "noticia"
  }
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
  const dataTexto = $(element).find('.data, .date, time, .published').first().text().trim();
  
  if (dataTexto) {
    // Converter para ISO se possível
    try {
      const data = new Date(dataTexto);
      if (!isNaN(data.getTime())) {
        return data.toISOString().split('T')[0];
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
  }

  // Default: data de hoje
  return new Date().toISOString().split('T')[0];
}

// ============================================
// SCRAPER GENÉRICO
// ============================================

async function scrapeStakeholder(stakeholderId, config) {
  console.log(`\n🔍 Scraping ${config.nome}...`);

  try {
    const response = await axios.get(config.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const documentos = [];

    // Buscar notícias usando o seletor configurado
    $(config.seletor).each((index, element) => {
      const $link = $(element);
      const titulo = $link.text().trim();
      const url = $link.attr('href');

      if (titulo && url) {
        const urlCompleta = limparUrl(config.url, url);
        const data = extrairData($, $link.closest('article, .news-item, .entry, .post, .destaque'));

        documentos.push({
          tipo_conteudo: config.tipo_conteudo,
          tipo_radar: 'stakeholders', // ← IMPORTANTE
          categoria: config.categoria,
          titulo: titulo,
          data_publicacao: data,
          url: urlCompleta,
          fonte: stakeholderId,
          entidades: config.nome
        });
      }
    });

    console.log(`  📊 Encontrados: ${documentos.length} documentos`);

    // Guardar na base de dados
    let novosGuardados = 0;
    let duplicadosIgnorados = 0;

    for (const doc of documentos) {
      try {
        await Document.create({
          ...doc,
          resumo: doc.titulo.substring(0, 200),
        });

        novosGuardados++;
        console.log(`    ✅ Novo: ${doc.titulo.substring(0, 80)}...`);
      } catch (error) {
        if (error.code === "23505" || error.message?.includes("duplicate key")) {
          duplicadosIgnorados++;
        } else {
          console.error(`    ❌ Erro ao guardar: ${error.message}`);
        }
      }
    }

    console.log(`  ✅ ${config.nome}: ${novosGuardados} novos, ${duplicadosIgnorados} duplicados ignorados`);
    return novosGuardados;

  } catch (error) {
    console.error(`  ❌ Erro no scraping de ${config.nome}:`, error.message);
    return 0;
  }
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