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

    // Tentar múltiplos seletores
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
          
          // Tentar extrair link de várias formas
          const link = $row.find('a[href*="DetalheIniciativa"], a[href*="Iniciativa"], a').first();
          const url = link.attr("href");
          
          // Extrair título
          let titulo = link.text().trim() || 
                      $row.find('.title, .titulo, h3, h4').text().trim() ||
                      $row.find('p').first().text().trim();
          
          // Extrair descrição
          const descricao = $row.find('.desc, .descricao, p.desc').text().trim() ||
                           $row.find('p').last().text().trim();
          
          // Extrair data
          let dataTexto = $row.find('.date, .data, time').text().trim();
          const dataCompleta = normalizarData(dataTexto);
          
          // Extrair número e tipo
          const match = titulo.match(/^(.*?)\s+(\d+\/[^\s]+)/);
          let tipo = "";
          let numero = "";
          let autores = "";
          
          if (match) {
            tipo = match[1].trim();
            numero = match[2].trim();
            
            // Procurar autores entre []
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

    // Estrutura: <div class="row margin_h0 margin-Top-15"> com colunas para Tipo, Número, Data, Título
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

    // Estrutura: <div class="row home_calendar hc-detail">
    //   <div class="col-xs-2"><p class="date">17.10</p><p class="time">2025</p></div>
    //   <div class="col-xs-10"><a href="..."><p class="title">Resultado das votações</p></a></div>
    // </div>

    $(".row.home_calendar.hc-detail").each((index, element) => {
      const $row = $(element);
      
      // Extrair data (dia.mes + ano)
      const dia_mes = $row.find('.col-xs-2 p.date').text().trim(); // "17.10"
      const ano = $row.find('.col-xs-2 p.time').text().trim(); // "2025"
      
      // Extrair link e título
      const link = $row.find('.col-xs-10 a').first();
      const titulo = link.find('p.title').text().trim() || link.text().trim();
      const url = link.attr("href");
      
      // Construir data completa
      let data_publicacao = new Date().toISOString().split("T")[0];
      if (dia_mes && ano) {
        const [dia, mes] = dia_mes.split('.');
        if (dia && mes) {
          data_publicacao = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
      }

      if (titulo && url) {
        votacoes.push({
          tipo_conteudo: "votacao",
          categoria: "geral_votacoes",
          titulo: titulo,
          data_publicacao: data_publicacao,
          resumo: titulo,
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

    // Buscar links para PDFs e DOCs
    $('a[href*=".pdf"], a[href*=".doc"], a[href*="sumula"], a[href*="Sumula"]').each((index, element) => {
      const $link = $(element);
      const url = $link.attr("href");
      const titulo = $link.text().trim();
      
      if (!titulo || !url) return;
      
      // Tentar encontrar data próxima
      const $parent = $link.closest('.row, tr, article, li');
      const dataTexto = $parent.find('.date, .data, time').first().text().trim() ||
                       $parent.find('td').first().text().trim();
      const dataCompleta = normalizarData(dataTexto);
      
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

  console.log(`\n📦 Total de documentos a processar: ${todosDocumentos.length}`);

  // Guardar na base de dados
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
  console.log(`  └─ Súmulas: ${sumulas.length}`);
  console.log(`\nNovos documentos guardados: ${novosGuardados}`);
  console.log(`Duplicados ignorados: ${duplicadosIgnorados}`);
  console.log(`Erros: ${erros}`);
  console.log(`Tempo total: ${duracao}s`);
  console.log("✅ Scraping de páginas gerais concluído!\n");

  return novosGuardados;
}