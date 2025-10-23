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
  
  // Formato: "22.10" + "2025" separado
  const partes = dataStr.trim().split('.');
  if (partes.length === 2) {
    return partes; // Retorna [dia, mes] para combinar com ano
  }
  
  // Formato completo: "DD.MM.YYYY", "DD-MM-YYYY", "DD/MM/YYYY"
  const match = dataStr.match(/(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{4})/);
  if (match) {
    const [_, dia, mes, ano] = match;
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

    // Procurar divs com classe "row home_calendar hc-detail"
    $(".row.home_calendar.hc-detail").each((index, element) => {
      const $row = $(element);
      
      // Extrair data (dividida em dois <p>)
      const dia_mes = $row.find('.col-xs-2 p.date').text().trim(); // "22.10"
      const ano = $row.find('.col-xs-2 p.time').text().trim(); // "2025"
      
      // Extrair link e título
      const link = $row.find('.col-xs-10 a').first();
      const titulo_completo = link.find('p.title').text().trim(); // "Projeto de Lei 286/XVII/1 [PSD]"
      const url = link.attr("href");
      
      // Extrair descrição
      const descricao = $row.find('.col-xs-10 p.desc').text().trim();
      
      // Extrair tipo e número do título
      // Formato: "Projeto de Lei 286/XVII/1 [PSD]"
      const match = titulo_completo.match(/^(.*?)\s+(\d+\/[^\s]+)\s*(?:\[(.*?)\])?/);
      let tipo = "";
      let numero = "";
      let autores = "";
      
      if (match) {
        tipo = match[1]; // "Projeto de Lei"
        numero = match[2]; // "286/XVII/1"
        autores = match[3] || ""; // "PSD"
      }
      
      // Construir data completa
      let data_publicacao = new Date().toISOString().split("T")[0];
      if (dia_mes && ano) {
        const [dia, mes] = dia_mes.split('.');
        if (dia && mes) {
          data_publicacao = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      }

      if (titulo_completo && url) {
        iniciativas.push({
          tipo_conteudo: "iniciativa",
          categoria: "geral_iniciativas",
          titulo: descricao || titulo_completo,
          numero: numero || null,
          data_publicacao: data_publicacao,
          autores: autores || null,
          resumo: descricao || titulo_completo,
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

    // Usar mesma estrutura
    $(".row.home_calendar.hc-detail, tr").each((index, element) => {
      const $row = $(element);
      
      // Tentar estrutura de div primeiro
      let dia_mes = $row.find('.col-xs-2 p.date').text().trim();
      let ano = $row.find('.col-xs-2 p.time').text().trim();
      let link = $row.find('.col-xs-10 a').first();
      let titulo = link.find('p.title').text().trim();
      let descricao = $row.find('.col-xs-10 p.desc').text().trim();
      let url = link.attr("href");
      
      // Se não encontrou, tentar estrutura de tabela
      if (!titulo) {
        const tds = $row.find("td");
        if (tds.length > 0) {
          link = $row.find('a').first();
          titulo = link.text().trim() || tds.eq(1).text().trim();
          url = link.attr("href");
          dia_mes = tds.eq(0).text().trim();
          descricao = tds.eq(2).text().trim() || tds.eq(3).text().trim();
        }
      }
      
      // Construir data
      let data_publicacao = new Date().toISOString().split("T")[0];
      if (dia_mes && ano) {
        const [dia, mes] = dia_mes.split('.');
        if (dia && mes) {
          data_publicacao = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      } else if (dia_mes) {
        const partes = normalizarData(dia_mes);
        if (typeof partes === 'string') data_publicacao = partes;
      }

      if (titulo && url) {
        // Determinar tipo
        const tipo = titulo.toLowerCase().includes("pergunta") ? "pergunta" : "requerimento";
        
        perguntas.push({
          tipo_conteudo: tipo,
          categoria: "geral_perguntas",
          titulo: descricao || titulo,
          data_publicacao: data_publicacao,
          resumo: descricao || titulo,
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

    // Tentar mesma estrutura
    $(".row.home_calendar.hc-detail, tr").each((index, element) => {
      const $row = $(element);
      
      let dia_mes = $row.find('.col-xs-2 p.date').text().trim();
      let ano = $row.find('.col-xs-2 p.time').text().trim();
      let link = $row.find('.col-xs-10 a').first();
      let titulo = link.find('p.title').text().trim();
      let descricao = $row.find('.col-xs-10 p.desc').text().trim();
      let url = link.attr("href");
      
      // Fallback para tabela
      if (!titulo) {
        const tds = $row.find("td");
        if (tds.length > 0) {
          link = $row.find('a').first();
          titulo = link.text().trim();
          url = link.attr("href");
          dia_mes = tds.eq(0).text().trim();
          descricao = tds.eq(1).text().trim() || tds.eq(2).text().trim();
        }
      }
      
      let data_publicacao = new Date().toISOString().split("T")[0];
      if (dia_mes && ano) {
        const [dia, mes] = dia_mes.split('.');
        if (dia && mes) {
          data_publicacao = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      } else if (dia_mes) {
        const partes = normalizarData(dia_mes);
        if (typeof partes === 'string') data_publicacao = partes;
      }

      if (titulo && url) {
        votacoes.push({
          tipo_conteudo: "votacao",
          categoria: "geral_votacoes",
          titulo: descricao || titulo,
          data_publicacao: data_publicacao,
          resumo: descricao || titulo,
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

    $(".row.home_calendar.hc-detail, a[href*='pdf'], a[href*='doc']").each((index, element) => {
      const $element = $(element);
      
      let dia_mes, ano, titulo, url, descricao;
      
      if ($element.hasClass('row')) {
        // Estrutura de div
        dia_mes = $element.find('.col-xs-2 p.date').text().trim();
        ano = $element.find('.col-xs-2 p.time').text().trim();
        const link = $element.find('.col-xs-10 a').first();
        titulo = link.find('p.title').text().trim();
        url = link.attr("href");
        descricao = $element.find('.col-xs-10 p.desc').text().trim();
      } else {
        // Link direto
        titulo = $element.text().trim();
        url = $element.attr("href");
        const parent = $element.closest('.row, tr');
        dia_mes = parent.find('p.date, td').first().text().trim();
        ano = parent.find('p.time').text().trim();
      }
      
      let data_publicacao = new Date().toISOString().split("T")[0];
      if (dia_mes && ano) {
        const [dia, mes] = dia_mes.split('.');
        if (dia && mes) {
          data_publicacao = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      }

      if (titulo && url && (url.includes('pdf') || url.includes('doc'))) {
        sumulas.push({
          tipo_conteudo: "sumula",
          categoria: "geral_sumulas",
          titulo: titulo.startsWith("Súmula") ? titulo : `Súmula - ${titulo}`,
          data_publicacao: data_publicacao,
          resumo: descricao || titulo,
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
      console.log(`    ✅ Novo: ${doc.titulo.substring(0, 60)}...`);
    } catch (error) {
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        duplicadosIgnorados++;
      } else {
        console.error(`    ❌ Erro ao guardar "${doc.titulo.substring(0, 40)}": ${error.message}`);
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