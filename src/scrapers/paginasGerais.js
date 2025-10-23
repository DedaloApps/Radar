import axios from "axios";
import * as cheerio from "cheerio";
import Document from "../models/Document.js";

// Função helper para limpar URLs
function limparUrl(urlRelativo) {
  if (!urlRelativo) return "";
  urlRelativo = urlRelativo.trim();
  
  if (urlRelativo.startsWith("http://") || urlRelativo.startsWith("https://")) {
    return urlRelativo;
  }
  if (urlRelativo.startsWith("//")) {
    return `https:${urlRelativo}`;
  }
  if (urlRelativo.startsWith("/")) {
    return `https://www.parlamento.pt${urlRelativo}`;
  }
  return `https://www.parlamento.pt/${urlRelativo}`;
}

// Função helper para normalizar datas portuguesas
function normalizarData(dataStr) {
  if (!dataStr) return new Date().toISOString().split("T")[0];
  
  // Formatos possíveis: "DD-MM-YYYY", "DD/MM/YYYY", "DD.MM.YYYY"
  const partes = dataStr.split(/[-/.]/);
  if (partes.length === 3) {
    const [dia, mes, ano] = partes;
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  
  return new Date().toISOString().split("T")[0];
}

// 1. ÚLTIMAS INICIATIVAS ENTRADAS
async function scrapeUltimasIniciativas() {
  console.log("\n🔍 Scraping Últimas Iniciativas Entradas...");
  
  try {
    const response = await axios.get(
      "https://www.parlamento.pt/Paginas/UltimasIniciativasEntradas.aspx",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      }
    );

    const $ = cheerio.load(response.data);
    const iniciativas = [];

    // Procurar linhas de iniciativas
    $(".iniciativa-row, tr").each((index, element) => {
      const $row = $(element);
      
      // Tentar encontrar link da iniciativa
      const link = $row.find('a[href*="DetalheIniciativa"]').first();
      if (!link.length) return;
      
      const titulo = link.text().trim();
      const url = link.attr("href");
      
      // Extrair outros dados da linha
      const tds = $row.find("td");
      const tipo = tds.eq(0).text().trim();
      const numero = tds.eq(1).text().trim();
      const data = tds.eq(3).text().trim() || tds.eq(4).text().trim();
      const autores = tds.eq(5).text().trim() || tds.eq(6).text().trim();

      if (titulo && url) {
        iniciativas.push({
          tipo_conteudo: "iniciativa",
          categoria: "geral_iniciativas",
          titulo: titulo,
          numero: numero || null,
          data_publicacao: normalizarData(data),
          autores: autores || null,
          url: limparUrl(url),
          fonte: "parlamento",
        });
      }
    });

    console.log(`  📊 Encontradas: ${iniciativas.length} iniciativas`);
    return iniciativas;
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Últimas Iniciativas:`, error.message);
    return [];
  }
}

// 2. PERGUNTAS E REQUERIMENTOS
async function scrapePerguntasRequerimentos() {
  console.log("\n🔍 Scraping Perguntas e Requerimentos...");
  
  try {
    const response = await axios.get(
      "https://www.parlamento.pt/ActividadeParlamentar/Paginas/PerguntasRequerimentos.aspx",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      }
    );

    const $ = cheerio.load(response.data);
    const perguntas = [];

    // Procurar linhas de perguntas/requerimentos
    $("tr, .pergunta-row").each((index, element) => {
      const $row = $(element);
      
      const link = $row.find('a[href*="DetalheIniciativa"], a[href*="Detalhes"]').first();
      if (!link.length) return;
      
      const titulo = link.text().trim();
      const url = link.attr("href");
      
      const tds = $row.find("td");
      const tipo = tds.eq(0).text().trim();
      const numero = tds.eq(1).text().trim();
      const data = tds.eq(2).text().trim() || tds.eq(3).text().trim();
      const autor = tds.eq(4).text().trim() || tds.eq(5).text().trim();

      if (titulo && url) {
        perguntas.push({
          tipo_conteudo: tipo.toLowerCase().includes("pergunta") ? "pergunta" : "requerimento",
          categoria: "geral_perguntas",
          titulo: titulo,
          numero: numero || null,
          data_publicacao: normalizarData(data),
          autores: autor || null,
          url: limparUrl(url),
          fonte: "parlamento",
        });
      }
    });

    console.log(`  📊 Encontradas: ${perguntas.length} perguntas/requerimentos`);
    return perguntas;
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Perguntas:`, error.message);
    return [];
  }
}

// 3. VOTAÇÕES
async function scrapeVotacoes() {
  console.log("\n🔍 Scraping Votações...");
  
  try {
    const response = await axios.get(
      "https://www.parlamento.pt/ArquivoDocumentacao/Paginas/Arquivodevotacoes.aspx",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      }
    );

    const $ = cheerio.load(response.data);
    const votacoes = [];

    // Procurar linhas de votações
    $("tr, .votacao-row").each((index, element) => {
      const $row = $(element);
      
      const link = $row.find('a[href*="DetalheVotacao"], a[href*="Votacao"]').first();
      if (!link.length) return;
      
      const titulo = link.text().trim();
      const url = link.attr("href");
      
      const tds = $row.find("td");
      const data = tds.eq(0).text().trim() || tds.eq(1).text().trim();
      const assunto = tds.eq(2).text().trim() || tds.eq(3).text().trim();
      const resultado = tds.eq(4).text().trim() || tds.eq(5).text().trim();

      if (titulo && url) {
        votacoes.push({
          tipo_conteudo: "votacao",
          categoria: "geral_votacoes",
          titulo: assunto || titulo,
          data_publicacao: normalizarData(data),
          estado: resultado || null,
          url: limparUrl(url),
          fonte: "parlamento",
        });
      }
    });

    console.log(`  📊 Encontradas: ${votacoes.length} votações`);
    return votacoes;
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Votações:`, error.message);
    return [];
  }
}

// 4. SÚMULAS DA CONFERÊNCIA DE LÍDERES
async function scrapeSumulasConferencia() {
  console.log("\n🔍 Scraping Súmulas da Conferência de Líderes...");
  
  try {
    const response = await axios.get(
      "https://www.parlamento.pt/ActividadeParlamentar/Paginas/Sumulas-Conferencia-Lideres.aspx",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      }
    );

    const $ = cheerio.load(response.data);
    const sumulas = [];

    // Procurar linhas de súmulas
    $("tr, .sumula-row, a[href*='sumula'], a[href*='Sumula']").each((index, element) => {
      const $element = $(element);
      
      let link, titulo, url, data;
      
      if ($element.is('a')) {
        link = $element;
        titulo = link.text().trim();
        url = link.attr("href");
        // Tentar extrair data do título ou do elemento pai
        const textoCompleto = $element.parent().text();
        const matchData = textoCompleto.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/);
        data = matchData ? matchData[1] : "";
      } else {
        link = $element.find('a[href*="pdf"], a[href*="doc"], a').first();
        if (!link.length) return;
        
        titulo = link.text().trim();
        url = link.attr("href");
        
        const tds = $element.find("td");
        data = tds.eq(0).text().trim() || tds.eq(1).text().trim();
      }

      if (titulo && url) {
        sumulas.push({
          tipo_conteudo: "sumula",
          categoria: "geral_sumulas",
          titulo: titulo.startsWith("Súmula") ? titulo : `Súmula - ${titulo}`,
          data_publicacao: normalizarData(data),
          url: limparUrl(url),
          fonte: "parlamento",
        });
      }
    });

    console.log(`  📊 Encontradas: ${sumulas.length} súmulas`);
    return sumulas;
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Súmulas:`, error.message);
    return [];
  }
}

// SCRAPER PRINCIPAL - Todas as páginas gerais
export async function scrapeTodasPaginasGerais() {
  console.log("\n🚀 ========== SCRAPING DAS PÁGINAS GERAIS ==========");
  const inicio = Date.now();

  // Executar todos os scrapers
  const [iniciativas, perguntas, votacoes, sumulas] = await Promise.all([
    scrapeUltimasIniciativas(),
    scrapePerguntasRequerimentos(),
    scrapeVotacoes(),
    scrapeSumulasConferencia(),
  ]);

  const todosDocumentos = [
    ...iniciativas,
    ...perguntas,
    ...votacoes,
    ...sumulas,
  ];

  // Guardar na base de dados
  let novosGuardados = 0;
  let duplicadosIgnorados = 0;

  for (const doc of todosDocumentos) {
    try {
      if (!doc.url || !doc.titulo) continue;

      await Document.create({
        ...doc,
        resumo: doc.resumo || doc.titulo.substring(0, 200),
      });

      novosGuardados++;
    } catch (error) {
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        duplicadosIgnorados++;
      } else {
        console.error(`    ❌ Erro ao guardar "${doc.titulo}": ${error.message}`);
      }
    }
  }

  const duracao = ((Date.now() - inicio) / 1000).toFixed(2);

  console.log("\n📊 ========== RESUMO PÁGINAS GERAIS ==========");
  console.log(`Total de documentos encontrados: ${todosDocumentos.length}`);
  console.log(`Novos documentos guardados: ${novosGuardados}`);
  console.log(`Duplicados ignorados: ${duplicadosIgnorados}`);
  console.log(`Tempo total: ${duracao}s`);
  console.log("✅ Scraping de páginas gerais concluído!\n");

  return novosGuardados;
}