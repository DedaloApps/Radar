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
  
  dataStr = dataStr.trim();
  
  // Formato: "YYYY-MM-DD" (já correto)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
    return dataStr;
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

    const selectores = [
      ".row.home_calendar.hc-detail",
      ".iniciativa-item",
      "article",
      ".lista-iniciativas .item",
      ".conteudo-principal .item"
    ];

    let elementosEncontrados = false;
    
    for (const seletor of selectores) {
      const elementos = $(seletor);
      if (elementos.length > 0) {
        console.log(`  ✓ Usando seletor: ${seletor} (${elementos.length} elementos)`);
        elementosEncontrados = true;
        
        elementos.each((index, element) => {
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
        
        break;
      }
    }

    if (!elementosEncontrados) {
      console.log("  ⚠️  Nenhum elemento encontrado com os seletores conhecidos");
      console.log("  💡 Vou tentar buscar TODOS os links da página...");
      
      $('a[href*="DetalheIniciativa"], a[href*="Iniciativa"]').each((index, element) => {
        const $link = $(element);
        const url = $link.attr("href");
        const titulo = $link.text().trim();
        
        if (titulo && url) {
          iniciativas.push({
            tipo_conteudo: "iniciativa",
            categoria: "geral_iniciativas",
            titulo: titulo,
            numero: null,
            data_publicacao: new Date().toISOString().split("T")[0],
            autores: null,
            resumo: titulo,
            url: limparUrl(url),
            fonte: "parlamento",
          });
        }
      });
    }

    console.log(`  📊 Encontradas: ${iniciativas.length} iniciativas`);
    return iniciativas;
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Últimas Iniciativas:`, error.message);
    return [];
  }
}

// 2. PERGUNTAS E REQUERIMENTOS - COM DEBUG
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

    console.log(`  🔍 DEBUG: Procurando elementos com .row.margin_h0.margin-Top-15`);
    const rows = $(".row.margin_h0.margin-Top-15");
    console.log(`  📊 DEBUG: Encontrados ${rows.length} elementos`);

    rows.each((index, element) => {
      const $row = $(element);
      
      const colunas = $row.find('.col-xs-12');
      console.log(`  🔍 DEBUG Row ${index}: ${colunas.length} colunas`);
      
      if (colunas.length < 4) {
        console.log(`  ⏭️ DEBUG Row ${index}: Skip - menos de 4 colunas`);
        return;
      }
      
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
      
      console.log(`  🔍 DEBUG Row ${index}: tipo="${tipo}", numero="${numero}", data="${data}", titulo="${titulo?.substring(0, 30)}..."`);
      
      if (titulo && url) {
        const tipoConteudo = tipo.toLowerCase().includes("pergunta") ? "pergunta" : "requerimento";
        const dataCompleta = normalizarData(data);
        
        console.log(`  ✅ DEBUG Row ${index}: Adicionando documento`);
        
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
      } else {
        console.log(`  ❌ DEBUG Row ${index}: Falta título ou URL`);
      }
    });

    console.log(`  📊 Encontradas: ${perguntas.length} perguntas/requerimentos`);
    return perguntas;
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Perguntas:`, error.message);
    return [];
  }
}

// 3. VOTAÇÕES - COM DEBUG
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

    console.log(`  🔍 DEBUG: Procurando elementos com .row.home_calendar.hc-detail`);
    const rows = $(".row.home_calendar.hc-detail");
    console.log(`  📊 DEBUG: Encontrados ${rows.length} elementos`);

    rows.each((index, element) => {
      const $row = $(element);
      
      const dia_mes = $row.find('.col-xs-2 p.date').text().trim();
      const ano = $row.find('.col-xs-2 p.time').text().trim();
      
      const link = $row.find('.col-xs-10 a').first();
      const titulo = link.find('p.title').text().trim() || link.text().trim();
      const url = link.attr("href");
      
      console.log(`  🔍 DEBUG Row ${index}: dia_mes="${dia_mes}", ano="${ano}", titulo="${titulo?.substring(0, 30)}..."`);
      
      let data_publicacao = new Date().toISOString().split("T")[0];
      if (dia_mes && ano) {
        const [dia, mes] = dia_mes.split('.');
        if (dia && mes) {
          data_publicacao = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      }

      if (titulo && url) {
        console.log(`  ✅ DEBUG Row ${index}: Adicionando votação`);
        
        votacoes.push({
          tipo_conteudo: "votacao",
          categoria: "geral_votacoes",
          titulo: titulo,
          data_publicacao: data_publicacao,
          resumo: titulo,
          url: limparUrl(url),
          fonte: "parlamento",
        });
      } else {
        console.log(`  ❌ DEBUG Row ${index}: Falta título ou URL`);
      }
    });

    console.log(`  📊 Encontradas: ${votacoes.length} votações`);
    return votacoes;
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Votações:`, error.message);
    return [];
  }
}

// 4. SÚMULAS - COM DEBUG
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

    console.log(`  🔍 DEBUG: Procurando links com .pdf, .doc, sumula`);
    const links = $('a[href*=".pdf"], a[href*=".doc"], a[href*="sumula"], a[href*="Sumula"]');
    console.log(`  📊 DEBUG: Encontrados ${links.length} links`);

    links.each((index, element) => {
      const $link = $(element);
      const url = $link.attr("href");
      const titulo = $link.text().trim();
      
      console.log(`  🔍 DEBUG Link ${index}: titulo="${titulo?.substring(0, 30)}...", url="${url?.substring(0, 50)}..."`);
      
      if (!titulo || !url) {
        console.log(`  ❌ DEBUG Link ${index}: Falta título ou URL`);
        return;
      }
      
      const $parent = $link.closest('.row, tr, article, li');
      const dataTexto = $parent.find('.date, .data, time').first().text().trim() ||
                       $parent.find('td').first().text().trim();
      const dataCompleta = normalizarData(dataTexto);
      
      console.log(`  ✅ DEBUG Link ${index}: Adicionando súmula`);
      
      sumulas.push({
        tipo_conteudo: "sumula",
        categoria: "geral_sumulas",
        titulo: titulo.startsWith("Súmula") || titulo.startsWith("Sumula") ? titulo : `Súmula - ${titulo}`,
        data_publicacao: dataCompleta,
        resumo: titulo,
        url: limparUrl(url),
        fonte: "parlamento",
      });
    });

    console.log(`  📊 Encontradas: ${sumulas.length} súmulas`);
    return sumulas;
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Súmulas:`, error.message);
    return [];
  }
}

// 5. ALTERAÇÕES OE (Orçamento de Estado) - ADAPTADO PARA USAR CAMPOS EXISTENTES
async function scrapeAlteracoesOE() {
  console.log("\n🔍 Scraping Alterações OE...");
  
  try {
    const response = await axios.get(
      "https://www.parlamento.pt/OrcamentoEstado/Paginas/PesquisaPropAlteracao37XVII.aspx",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      }
    );

    const $ = cheerio.load(response.data);
    const alteracoes = [];

    console.log(`  🔍 DEBUG: Procurando elementos com .row.margin_h0.margin-Top-15`);
    const rows = $(".row.margin_h0.margin-Top-15");
    console.log(`  📊 DEBUG: Encontrados ${rows.length} elementos`);

    rows.each((index, element) => {
      const $row = $(element);
      
      // Verificar se tem colunas (para filtrar o header)
      const colunas = $row.find('.col-xs-12');
      if (colunas.length < 4) {
        return; // Skip - não é uma proposta válida
      }
      
      let numero = "";
      let data = "";
      let documentoUrl = "";
      let apresentada = "";
      let incide = "";
      let tipo = "";
      let proponentes = "";
      let estado = "";
      let detalhesUrl = "";
      
      colunas.each((i, col) => {
        const $col = $(col);
        const label = $col.find('.TextoRegular-Titulo').text().trim();
        
        if (label === "Documento") {
          const docLink = $col.find('a[id*="hplDocumento"]');
          documentoUrl = docLink.attr("href");
        } else if (label === "Número") {
          const numLink = $col.find('a[id*="hplNumero"]');
          numero = numLink.text().trim();
          detalhesUrl = numLink.attr("href");
        } else if (label === "Data") {
          data = $col.find('span[id*="lblData"]').text().trim();
        } else if (label === "Apresentada") {
          apresentada = $col.find('.TextoRegular').text().trim();
        } else if (label === "Incide") {
          incide = $col.find('.TextoRegular').text().trim();
        } else if (label === "Tipo") {
          tipo = $col.find('.TextoRegular').text().trim();
        } else if (label === "Proponentes") {
          proponentes = $col.find('.TextoRegular').text().trim();
        } else if (label === "Estado") {
          estado = $col.find('.TextoRegular').text().trim();
        }
      });
      
      console.log(`  🔍 DEBUG Row ${index}: numero="${numero}", data="${data}", proponentes="${proponentes}"`);
      
      if (numero && detalhesUrl) {
        const dataCompleta = normalizarData(data);
        
        const titulo = `Proposta de Alteração ${numero} - ${proponentes} [${estado}]`;
        
        // USANDO CAMPOS EXISTENTES:
        // - autores = proponentes
        // - entidades = apresentada
        // - resumo = incluir incide e tipo
        // - conteudo = URL do PDF
        
        const resumoCompleto = [
          `Alteração OE ${numero} apresentada por ${proponentes}`,
          estado ? `Estado: ${estado}` : null,
          incide ? `Incide: ${incide}` : null,
          tipo ? `Tipo: ${tipo}` : null,
          documentoUrl ? `PDF: ${limparUrl(documentoUrl)}` : null
        ].filter(Boolean).join(' | ');
        
        console.log(`  ✅ DEBUG Row ${index}: Adicionando alteração OE`);
        
        alteracoes.push({
          tipo_conteudo: "alteracao_oe",
          categoria: "geral_alteracoes_oe",
          titulo: titulo,
          numero: numero || null,
          data_publicacao: dataCompleta,
          autores: proponentes || null,           // ← USANDO autores para proponentes
          entidades: apresentada || null,         // ← USANDO entidades para apresentada
          estado: estado || null,
          resumo: resumoCompleto,                 // ← USANDO resumo para tudo
          conteudo: documentoUrl ? limparUrl(documentoUrl) : null, // ← PDF no conteudo
          url: limparUrl(detalhesUrl),
          fonte: "parlamento",
        });
      } else {
        console.log(`  ❌ DEBUG Row ${index}: Falta número ou URL de detalhes`);
      }
    });

    console.log(`  📊 Encontradas: ${alteracoes.length} alterações OE`);
    return alteracoes;
  } catch (error) {
    console.error(`  ❌ Erro ao scraping Alterações OE:`, error.message);
    return [];
  }
}

// SCRAPER PRINCIPAL - Todas as páginas gerais
export async function scrapeTodasPaginasGerais() {
  console.log("\n🚀 ========== SCRAPING DAS PÁGINAS GERAIS ==========");
  const inicio = Date.now();

  const [iniciativas, perguntas, votacoes, sumulas, alteracoesOE] = await Promise.all([
    scrapeUltimasIniciativas(),
    scrapePerguntasRequerimentos(),
    scrapeVotacoes(),
    scrapeSumulasConferencia(),
    scrapeAlteracoesOE(),
  ]);

  const todosDocumentos = [
    ...iniciativas,
    ...perguntas,
    ...votacoes,
    ...sumulas,
    ...alteracoesOE,
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
  console.log(`  ├─ Votações: ${votacoes.length}`);
  console.log(`  ├─ Súmulas: ${sumulas.length}`);
  console.log(`  └─ Alterações OE: ${alteracoesOE.length}`);
  console.log(`\nNovos documentos guardados: ${novosGuardados}`);
  console.log(`Duplicados ignorados: ${duplicadosIgnorados}`);
  console.log(`Erros: ${erros}`);
  console.log(`Tempo total: ${duracao}s`);
  console.log("✅ Scraping de páginas gerais concluído!\n");

  return novosGuardados;
}
