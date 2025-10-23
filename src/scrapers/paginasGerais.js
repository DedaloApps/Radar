import axios from "axios";
import * as cheerio from "cheerio";
import pdf from "pdf-parse";
import Document from "../models/Document.js";

// ============================================
// FUNÇÕES HELPER
// ============================================

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

function normalizarData(dataStr) {
  if (!dataStr) return new Date().toISOString().split("T")[0];
  
  dataStr = dataStr.trim();
  
  // Formato: "YYYY-MM-DD" (já correto)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
    return dataStr;
  }
  
  // Formato: "YYYY.MM.DD"
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(dataStr)) {
    return dataStr.replace(/\./g, '-');
  }
  
  // Formato: "DD.MM.YYYY"
  const match1 = dataStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (match1) {
    const [_, dia, mes, ano] = match1;
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  
  // Formato: "DD-MM-YYYY"
  const match2 = dataStr.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (match2) {
    const [_, dia, mes, ano] = match2;
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  
  // Formato: "DD/MM/YYYY"
  const match3 = dataStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match3) {
    const [_, dia, mes, ano] = match3;
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  
  return new Date().toISOString().split("T")[0];
}

// ============================================
// 1. ÚLTIMAS INICIATIVAS ENTRADAS
// ============================================

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

    $(".row.home_calendar.hc-detail, .iniciativa-item, article").each((index, element) => {
      const $row = $(element);
      
      const link = $row.find('a[href*="DetalheIniciativa"], a[href*="Iniciativa"], a').first();
      const url = link.attr("href");
      
      let titulo = link.text().trim() || 
                  $row.find('.title, .titulo, h3, h4').text().trim() ||
                  $row.find('p').first().text().trim();
      
      const descricao = $row.find('.desc, .descricao, p.desc').text().trim() ||
                       $row.find('p').last().text().trim();
      
      let dataTexto = $row.find('.date, .data, time').text().trim();
      const dataCompleta = normalizarData(dataTexto);
      
      const match = titulo.match(/^(.*?)\s+(\d+\/[^\s]+)/);
      let tipo = "";
      let numero = "";
      let autores = "";
      
      if (match) {
        tipo = match[1].trim();
        numero = match[2].trim();
        
        const autoresMatch = titulo.match(/\[(.*?)\]/);
        if (autoresMatch) {
          autores = autoresMatch[1].trim();
        }
      }

      if (titulo && url) {
        iniciativas.push({
          tipo_conteudo: "iniciativa",
          categoria: "geral_iniciativas",
          titulo: descricao || titulo,
          numero: numero || null,
          data_publicacao: dataCompleta,
          autores: autores || null,
          resumo: descricao || titulo,
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

// ============================================
// 2. PERGUNTAS E REQUERIMENTOS
// ============================================

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

    $(".row.margin_h0.margin-Top-15").each((index, element) => {
      const $row = $(element);
      
      const colunas = $row.find('.col-xs-12');
      
      if (colunas.length < 4) return;
      
      let tipo = "";
      let numero = "";
      let data = "";
      let titulo = "";
      let url = "";
      
      colunas.each((i, col) => {
        const $col = $(col);
        const label = $col.find('.TextoRegular-Titulo').text().trim();
        
        if (label === "Tipo") {
          tipo = $col.find('.TextoRegular, span[id*="lblPergReq"]').text().trim();
        } else if (label === "Número" || label === "Nº" || label.includes("mero")) {
          numero = $col.find('.TextoRegular, span[id*="lblNumero"]').text().trim();
        } else if (label === "Data") {
          data = $col.find('.TextoRegular, span[id*="lblData"]').text().trim();
        } else if (label === "Título" || label.includes("tulo")) {
          const link = $col.find('a[id*="hplTitulo"]');
          titulo = link.text().trim();
          url = link.attr("href");
        }
      });
      
      if (titulo && url) {
        const tipoConteudo = tipo.toLowerCase().includes("pergunta") ? "pergunta" : "requerimento";
        const dataCompleta = normalizarData(data);
        
        perguntas.push({
          tipo_conteudo: tipoConteudo,
          categoria: "geral_perguntas",
          titulo: titulo,
          numero: numero || null,
          data_publicacao: dataCompleta,
          resumo: titulo,
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

// ============================================
// 3. VOTAÇÕES (COM EXTRAÇÃO DE PDFs)
// ============================================

function parseVotacoesDoPDF(textoCompleto, dataVotacao, urlPDF) {
  const votacoes = [];
  
  const regexVotacao = /(Projeto de (?:Lei|Resolução|Voto|Deliberação)|Proposta de (?:Lei|Resolução))\s+n\.º\s+([\d\/\.ªº]+)\s+\(([^)]+)\)\s+[-–]\s+([^\n]+?)(?=\s+Resultado|\s+PSD\s+CH)/gi;
  
  let match;
  while ((match = regexVotacao.exec(textoCompleto)) !== null) {
    const tipo = match[1].trim();
    const numero = match[2].trim();
    const partido = match[3].trim();
    const titulo = match[4].trim();
    
    const posicaoAtual = match.index;
    const proximasLinhas = textoCompleto.substring(posicaoAtual, posicaoAtual + 500);
    
    let resultado = "Desconhecido";
    if (/Resultado\s+Aprovado por unanimidade/i.test(proximasLinhas)) {
      resultado = "Aprovado por unanimidade";
    } else if (/Resultado\s+Aprovado/i.test(proximasLinhas)) {
      resultado = "Aprovado";
    } else if (/Resultado\s+Rejeitado/i.test(proximasLinhas)) {
      resultado = "Rejeitado";
    }
    
    let fase = "DELIBERAÇÃO";
    const textoPrecedente = textoCompleto.substring(Math.max(0, posicaoAtual - 200), posicaoAtual);
    if (/VOTAÇÃO NA GENERALIDADE/i.test(textoPrecedente)) {
      fase = "VOTAÇÃO NA GENERALIDADE";
    } else if (/VOTAÇÃO FINAL GLOBAL/i.test(textoPrecedente)) {
      fase = "VOTAÇÃO FINAL GLOBAL";
    }
    
    let tipoConteudo = "votacao";
    if (tipo.includes("Lei")) {
      tipoConteudo = "votacao_lei";
    } else if (tipo.includes("Resolução")) {
      tipoConteudo = "votacao_resolucao";
    } else if (tipo.includes("Voto")) {
      tipoConteudo = "votacao_voto";
    } else if (tipo.includes("Deliberação")) {
      tipoConteudo = "votacao_deliberacao";
    }
    
    votacoes.push({
      tipo_conteudo: tipoConteudo,
      categoria: "geral_votacoes",
      titulo: `${tipo} ${numero} (${partido}) - ${titulo}`,
      numero: numero,
      data_publicacao: dataVotacao,
      resultado: resultado,
      fase: fase,
      partido_proponente: partido,
      resumo: `${fase}: ${titulo} - ${resultado}`,
      url: urlPDF,
      fonte: "parlamento",
    });
  }
  
  return votacoes;
}

async function scrapePDFVotacoes(url, data) {
  console.log(`  📄 Processando PDF de ${data}...`);
  
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 30000,
    });
    
    const dataBuffer = Buffer.from(response.data);
    const pdfData = await pdf(dataBuffer);
    const texto = pdfData.text;
    
    const votacoes = parseVotacoesDoPDF(texto, data, url);
    
    console.log(`    ✓ Extraídas ${votacoes.length} votações do PDF`);
    return votacoes;
    
  } catch (error) {
    console.error(`    ❌ Erro ao processar PDF: ${error.message}`);
    return [];
  }
}

async function scrapeVotacoes() {
  console.log("\n🔍 Scraping Votações (com extração de PDFs)...");
  
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
    const todasVotacoes = [];

    const pdfLinks = [];
    
    $(".row.home_calendar.hc-detail").each((index, element) => {
      const $row = $(element);
      
      const dia_mes = $row.find('.col-xs-2 p.date').text().trim();
      const ano = $row.find('.col-xs-2 p.time').text().trim();
      
      const link = $row.find('.col-xs-10 a').first();
      const url = link.attr("href");
      
      if (url && url.includes('.pdf')) {
        let data_publicacao = new Date().toISOString().split("T")[0];
        if (dia_mes && ano) {
          const [dia, mes] = dia_mes.split('.');
          if (dia && mes) {
            data_publicacao = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
          }
        }
        
        pdfLinks.push({
          url: url.startsWith('http') ? url : `https://app.parlamento.pt${url}`,
          data: data_publicacao
        });
      }
    });

    console.log(`  📊 Encontrados ${pdfLinks.length} PDFs de votações`);
    
    const limite = Math.min(pdfLinks.length, 3);
    console.log(`  ⚠️  Processando apenas os primeiros ${limite} PDFs...`);
    
    for (let i = 0; i < limite; i++) {
      const pdfLink = pdfLinks[i];
      const votacoesDoPDF = await scrapePDFVotacoes(pdfLink.url, pdfLink.data);
      todasVotacoes.push(...votacoesDoPDF);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`  📊 Total de votações extraídas: ${todasVotacoes.length}`);
    return todasVotacoes;
    
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Votações:`, error.message);
    return [];
  }
}

// ============================================
// 4. SÚMULAS DA CONFERÊNCIA DE LÍDERES (COM PDFs)
// ============================================

function parseSumulaDoPDF(textoCompleto, dataReuniao, numeroSumula, urlPDF) {
  const agendamentos = [];
  
  // Extrair reuniões plenárias com suas datas
  const regexPlenaria = /REUNIÃO PLENÁRIA[-\s]*(\d{4})\.(\d{2})\.(\d{2})\s*\(([^)]+)\)\s*(\d{2}:\d{2})?\s*HORAS?/gi;
  
  let match;
  while ((match = regexPlenaria.exec(textoCompleto)) !== null) {
    const ano = match[1];
    const mes = match[2];
    const dia = match[3];
    const diaSemana = match[4];
    const hora = match[5] || "15:00";
    
    const dataReuniaoPlenaria = `${ano}-${mes}-${dia}`;
    const posicao = match.index;
    
    // Pegar o texto após esta reunião até a próxima
    const proximaPosicao = textoCompleto.indexOf("REUNIÃO PLENÁRIA", posicao + 1);
    const textoReuniao = proximaPosicao > 0 
      ? textoCompleto.substring(posicao, proximaPosicao)
      : textoCompleto.substring(posicao);
    
    // Extrair projetos desta reunião
    const regexProjeto = /(Projeto de (?:Lei|Resolução|Voto|Deliberação)|Proposta de (?:Lei|Resolução))\s+n\.º\s+([\d\/\.ªº]+)\s+\(([^)]+)\)\s+[-–]\s+([^\n]+)/gi;
    
    let matchProjeto;
    while ((matchProjeto = regexProjeto.exec(textoReuniao)) !== null) {
      const tipo = matchProjeto[1].trim();
      const numero = matchProjeto[2].trim();
      const partido = matchProjeto[3].trim();
      const titulo = matchProjeto[4].trim();
      
      agendamentos.push({
        tipo_conteudo: "sumula_agendamento",
        categoria: "geral_sumulas",
        titulo: `${tipo} ${numero} (${partido}) - ${titulo}`,
        numero: numero,
        data_publicacao: dataReuniao,
        data_reuniao_plenaria: dataReuniaoPlenaria,
        hora_reuniao: hora,
        dia_semana: diaSemana,
        partido_proponente: partido,
        resumo: `Agendado para ${dataReuniaoPlenaria} (${diaSemana}) às ${hora} - ${titulo}`,
        url: urlPDF,
        fonte: "parlamento",
        numero_sumula: numeroSumula,
      });
    }
  }
  
  return agendamentos;
}

async function scrapePDFSumula(url, data, numeroSumula) {
  console.log(`  📄 Processando Súmula ${numeroSumula} de ${data}...`);
  
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 30000,
    });
    
    const dataBuffer = Buffer.from(response.data);
    const pdfData = await pdf(dataBuffer);
    const texto = pdfData.text;
    
    const agendamentos = parseSumulaDoPDF(texto, data, numeroSumula, url);
    
    console.log(`    ✓ Extraídos ${agendamentos.length} agendamentos da súmula`);
    return agendamentos;
    
  } catch (error) {
    console.error(`    ❌ Erro ao processar PDF da súmula: ${error.message}`);
    return [];
  }
}

async function scrapeSumulasConferencia() {
  console.log("\n🔍 Scraping Súmulas da Conferência de Líderes (com PDFs)...");
  
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
    const todosAgendamentos = [];
    const pdfLinks = [];

    $(".archive-item").each((index, element) => {
      const $item = $(element);
      const link = $item.find('a');
      const titulo = link.attr('title') || link.text().trim();
      const url = link.attr("href");
      
      if (!url) return;
      
      // Extrair número e data do título: "Súmula n.º 08 | 2025-10-15"
      const matchNumero = titulo.match(/Súmula n\.º (\d+)/i);
      const matchData = titulo.match(/(\d{4})[.-](\d{2})[.-](\d{2})/);
      
      const numeroSumula = matchNumero ? matchNumero[1] : null;
      let data_publicacao = new Date().toISOString().split("T")[0];
      
      if (matchData) {
        const [_, ano, mes, dia] = matchData;
        data_publicacao = `${ano}-${mes}-${dia}`;
      }
      
      pdfLinks.push({
        url: url.startsWith('http') ? url : limparUrl(url),
        data: data_publicacao,
        numero: numeroSumula,
        titulo: titulo
      });
    });

    console.log(`  📊 Encontradas ${pdfLinks.length} súmulas`);
    
    const limite = Math.min(pdfLinks.length, 3);
    console.log(`  ⚠️  Processando apenas as primeiras ${limite} súmulas...`);
    
    for (let i = 0; i < limite; i++) {
      const pdfLink = pdfLinks[i];
      const agendamentos = await scrapePDFSumula(pdfLink.url, pdfLink.data, pdfLink.numero);
      todosAgendamentos.push(...agendamentos);
      
      // Adicionar também a súmula em si como documento
      todosAgendamentos.push({
        tipo_conteudo: "sumula",
        categoria: "geral_sumulas",
        titulo: pdfLink.titulo,
        numero: pdfLink.numero,
        data_publicacao: pdfLink.data,
        resumo: `Súmula da Conferência de Líderes n.º ${pdfLink.numero}`,
        url: pdfLink.url,
        fonte: "parlamento",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`  📊 Total extraído: ${todosAgendamentos.length} (súmulas + agendamentos)`);
    return todosAgendamentos;
    
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Súmulas:`, error.message);
    return [];
  }
}

// ============================================
// SCRAPER PRINCIPAL
// ============================================

export async function scrapeTodasPaginasGerais() {
  console.log("\n🚀 ========== SCRAPING DAS PÁGINAS GERAIS ==========");
  const inicio = Date.now();

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

  console.log(`\n📦 Total de documentos a processar: ${todosDocumentos.length}`);

  let novosGuardados = 0;
  let duplicadosIgnorados = 0;
  let erros = 0;

  for (const doc of todosDocumentos) {
    try {
      if (!doc.url || !doc.titulo) {
        console.log(`    ⏭️  Documento inválido ignorado`);
        continue;
      }

      await Document.create({
        ...doc,
        resumo: doc.resumo || doc.titulo.substring(0, 200),
      });

      novosGuardados++;
      console.log(`    ✅ ${doc.categoria}: ${doc.titulo.substring(0, 50)}...`);
    } catch (error) {
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        duplicadosIgnorados++;
      } else {
        erros++;
        console.error(`    ❌ Erro: ${error.message}`);
      }
    }
  }

  const duracao = ((Date.now() - inicio) / 1000).toFixed(2);

  console.log("\n📊 ========== RESUMO PÁGINAS GERAIS ==========");
  console.log(`Total de documentos encontrados: ${todosDocumentos.length}`);
  console.log(`  ├─ Iniciativas: ${iniciativas.length}`);
  console.log(`  ├─ Perguntas/Requerimentos: ${perguntas.length}`);
  console.log(`  ├─ Votações (extraídas de PDFs): ${votacoes.length}`);
  console.log(`  └─ Súmulas + Agendamentos: ${sumulas.length}`);
  console.log(`\nNovos documentos guardados: ${novosGuardados}`);
  console.log(`Duplicados ignorados: ${duplicadosIgnorados}`);
  console.log(`Erros: ${erros}`);
  console.log(`Tempo total: ${duracao}s`);
  console.log("✅ Scraping de páginas gerais concluído!\n");

  return novosGuardados;
}