import axios from "axios";
import * as cheerio from "cheerio";
import Document from "../models/Document.js";

const COMISSOES = {
  comissao_01: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/1CACDLG/Paginas/default.aspx",
    nome: "Assuntos Constitucionais",
  },
  comissao_02: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/2CNECP/Paginas/default.aspx",
    nome: "Negócios Estrangeiros",
  },
  comissao_03: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/3CDN/Paginas/default.aspx",
    nome: "Defesa Nacional",
  },
  comissao_04: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/4CAE/Paginas/default.aspx",
    nome: "Assuntos Europeus",
  },
  comissao_05: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/5COFAP/Paginas/default.aspx",
    nome: "Orçamento e Finanças",
  },
  comissao_06: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/6CECT/Paginas/default.aspx",
    nome: "Economia e Coesão",
  },
  comissao_07: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/7CAP/Paginas/default.aspx",
    nome: "Agricultura e Pescas",
  }, // ← Esta dá 404
  comissao_08: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/8CEC/Paginas/default.aspx",
    nome: "Educação e Ciência",
  },
  comissao_09: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/9CS/Paginas/default.aspx",
    nome: "Saúde",
  },
  comissao_10: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/10CTSSI/Paginas/default.aspx",
    nome: "Trabalho e Seg. Social",
  },
  comissao_11: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/11CAE/Paginas/default.aspx",
    nome: "Ambiente e Energia",
  }, // ← Esta dá 404
  comissao_12: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/12CCCJD/Paginas/default.aspx",
    nome: "Cultura e Comunicação",
  },
  comissao_13: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/13CREPL/Paginas/default.aspx",
    nome: "Reforma do Estado",
  },
  comissao_14: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/14CIMH/Paginas/default.aspx",
    nome: "Infraestruturas",
  },
  comissao_15: {
    url: "https://www.parlamento.pt/sites/com/XVIILeg/15CTED/Paginas/default.aspx",
    nome: "Transparência",
  },
};

// Função helper para limpar URLs
function limparUrl(urlBase, urlRelativo) {
  if (!urlRelativo) return "";

  // Limpar espaços
  urlRelativo = urlRelativo.trim();

  // Se já é URL completo, retornar direto
  if (urlRelativo.startsWith("http://") || urlRelativo.startsWith("https://")) {
    return urlRelativo;
  }

  // Se começa com //, adicionar https:
  if (urlRelativo.startsWith("//")) {
    return `https:${urlRelativo}`;
  }

  // Se começa com /, é relativo ao domínio
  if (urlRelativo.startsWith("/")) {
    return `https://www.parlamento.pt${urlRelativo}`;
  }

  // Caso contrário, assumir que é relativo
  return `https://www.parlamento.pt/${urlRelativo}`;
}

// Extrair AGENDAS
function extrairAgendas($, comissaoId) {
  const agendas = [];

  $("#Agendas .row.margin_h0.margin-Top-15").each((index, element) => {
    const data = $(element).find(".TextoRegular").first().text().trim();
    const agendaLink = $(element).find('a[id*="hplNumAgenda"]');
    const agendaTexto = agendaLink.text().trim();
    const agendaUrl = agendaLink.attr("href");
    const hora = $(element).find(".TextoRegular").eq(2).text().trim();
    const local = $(element).find(".TextoRegular").last().text().trim();

    if (data && agendaTexto) {
      agendas.push({
        tipo_conteudo: "agenda",
        categoria: comissaoId,
        titulo: `Agenda ${agendaTexto}`,
        data_publicacao: data,
        hora: hora || null,
        local_evento: local || null,
        url: limparUrl("https://www.parlamento.pt", agendaUrl),
        fonte: "parlamento",
      });
    }
  });

  return agendas;
}

// Extrair AUDIÇÕES
function extrairAudicoes($, comissaoId) {
  const audicoes = [];

  $("#Audicoes .row.margin_h0.margin-Top-15").each((index, element) => {
    const numero = $(element).find(".TextoRegular").first().text().trim();
    const data = $(element).find(".TextoRegular").eq(3).text().trim();
    const assuntoLink = $(element).find('a[id*="hplAssunto"]');
    const assunto = assuntoLink.text().trim();
    const assuntoUrl = assuntoLink.attr("href");
    const entidades = $(element).find('span[id*="lblEntidades"]').text().trim();

    if (assunto) {
      audicoes.push({
        tipo_conteudo: "audicao",
        categoria: comissaoId,
        titulo: assunto,
        numero: numero || null,
        data_publicacao: data || new Date().toISOString().split("T")[0],
        entidades: entidades || null,
        url: limparUrl("https://www.parlamento.pt", assuntoUrl),
        fonte: "parlamento",
      });
    }
  });

  return audicoes;
}

// Extrair AUDIÊNCIAS
function extrairAudiencias($, comissaoId) {
  const audiencias = [];

  $("#Audiencias .row.margin_h0.margin-Top-15").each((index, element) => {
    const numero = $(element).find(".TextoRegular").first().text().trim();
    const assuntoLink = $(element).find('a[id*="hplAssunto"]');
    const assunto = assuntoLink.text().trim();
    const assuntoUrl = assuntoLink.attr("href");
    const entidades = $(element).find('span[id*="lblEntidades"]').text().trim();
    const estado = $(element).find(".TextoRegular").eq(4).text().trim();
    const data = $(element).find(".TextoRegular").last().text().trim();

    if (assunto) {
      audiencias.push({
        tipo_conteudo: "audiencia",
        categoria: comissaoId,
        titulo: assunto,
        numero: numero || null,
        data_publicacao: data || new Date().toISOString().split("T")[0],
        entidades: entidades || null,
        estado: estado || null,
        url: limparUrl("https://www.parlamento.pt", assuntoUrl),
        fonte: "parlamento",
      });
    }
  });

  return audiencias;
}

// Extrair INICIATIVAS
function extrairIniciativas($, comissaoId) {
  const iniciativas = [];

  $("#Iniciativas .row.margin_h0.margin-Top-15").each((index, element) => {
    const cols = $(element).find(".TextoRegular");
    const tipo = cols.eq(0).text().trim();
    const numero = cols.eq(1).text().trim();

    const tituloLink = $(element).find('a[id*="hplIniciativa"]');
    const titulo = tituloLink.text().trim();
    const tituloUrl = tituloLink.attr("href");

    let estado = "";
    let data = "";
    let autores = "";

    $(element)
      .find(".col-xs-12")
      .each((i, col) => {
        const label = $(col).find(".TextoRegular-Titulo").text().trim();
        const value = $(col)
          .find('.TextoRegular, span[id*="lblAutores"]')
          .text()
          .trim();

        if (label === "Estado") estado = value;
        if (label === "D.Estado") data = value;
        if (label === "Autores") autores = value;
      });

    if (titulo) {
      iniciativas.push({
        tipo_conteudo: "iniciativa",
        categoria: comissaoId,
        titulo: `${tipo} ${numero}: ${titulo}`,
        numero: numero || null,
        data_publicacao: data || new Date().toISOString().split("T")[0],
        estado: estado || null,
        autores: autores || null,
        url: limparUrl("https://www.parlamento.pt", tituloUrl),
        fonte: "parlamento",
      });
    }
  });

  return iniciativas;
}

// Extrair PETIÇÕES
function extrairPeticoes($, comissaoId) {
  const peticoes = [];

  $("#Peticoes .row.margin_h0.margin-Top-15").each((index, element) => {
    const numero = $(element).find(".TextoRegular").first().text().trim();
    const data = $(element).find(".TextoRegular").eq(3).text().trim();
    const tituloLink = $(element).find('a[id*="hplTitulo"]');
    const titulo = tituloLink.text().trim();
    const tituloUrl = tituloLink.attr("href");

    if (titulo) {
      peticoes.push({
        tipo_conteudo: "peticao",
        categoria: comissaoId,
        titulo: titulo,
        numero: numero || null,
        data_publicacao: data || new Date().toISOString().split("T")[0],
        url: limparUrl("https://www.parlamento.pt", tituloUrl),
        fonte: "parlamento",
      });
    }
  });

  return peticoes;
}

// Scraper principal de uma comissão
async function scrapeComissao(comissaoId, comissaoInfo) {
  console.log(`\n🔍 Scraping ${comissaoInfo.nome}...`);

  try {
    const response = await axios.get(comissaoInfo.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Extrair todos os tipos de conteúdo
    const agendas = extrairAgendas($, comissaoId);
    const audicoes = extrairAudicoes($, comissaoId);
    const audiencias = extrairAudiencias($, comissaoId);
    const iniciativas = extrairIniciativas($, comissaoId);
    const peticoes = extrairPeticoes($, comissaoId);

    const todosDocumentos = [
      ...agendas,
      ...audicoes,
      ...audiencias,
      ...iniciativas,
      ...peticoes,
    ];

    console.log(
      `  📊 Encontrados: ${agendas.length} agendas, ${audicoes.length} audições, ${audiencias.length} audiências, ${iniciativas.length} iniciativas, ${peticoes.length} petições`
    );

    // Guardar na base de dados
    let novosGuardados = 0;
    let duplicadosIgnorados = 0;

    for (const doc of todosDocumentos) {
      try {
        if (!doc.url || !doc.titulo) {
          console.log(`    ⏭️  Documento inválido (sem URL ou título)`);
          continue;
        }

        // Tentar criar diretamente
        // Se for duplicado, o UNIQUE INDEX vai rejeitar
        await Document.create({
          ...doc,
          resumo: doc.resumo || doc.titulo.substring(0, 200),
        });

        novosGuardados++;
        console.log(`    ✅ Novo: ${doc.titulo}`);
      } catch (error) {
        // Erro 23505 = violação de UNIQUE constraint (duplicado)
        if (
          error.code === "23505" ||
          error.message?.includes("duplicate key")
        ) {
          duplicadosIgnorados++;
          // NÃO loggar cada duplicado (muito spam)
        } else {
          console.error(
            `    ❌ Erro ao guardar "${doc.titulo}": ${error.message}`
          );
        }
      }
    }

    console.log(
      `  ✅ ${comissaoInfo.nome}: ${novosGuardados} novos, ${duplicadosIgnorados} duplicados ignorados`
    );

    console.log(
      `  ✅ ${comissaoInfo.nome}: ${novosGuardados} novos documentos guardados`
    );
    return novosGuardados;
  } catch (error) {
    console.error(
      `  ❌ Erro no scraping de ${comissaoInfo.nome}:`,
      error.message
    );
    return 0;
  }
}

// Scraper de TODAS as comissões
export async function scrapeTodasComissoes() {
  console.log("\n🚀 ========== SCRAPING DAS 15 COMISSÕES ==========");
  const inicio = Date.now();

  let totalNovos = 0;

  for (const [comissaoId, comissaoInfo] of Object.entries(COMISSOES)) {
    const novos = await scrapeComissao(comissaoId, comissaoInfo);
    totalNovos += novos;

    // Pausa entre requests para não sobrecarregar o servidor
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const duracao = ((Date.now() - inicio) / 1000).toFixed(2);

  console.log("\n📊 ========== RESUMO GERAL ==========");
  console.log(`Total de comissões: 15`);
  console.log(`Total de novos documentos: ${totalNovos}`);
  console.log(`Tempo total: ${duracao}s`);
  console.log("✅ Scraping concluído!\n");

  return totalNovos;
}
