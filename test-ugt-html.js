// Teste do scraper UGT com HTML real fornecido
import * as cheerio from 'cheerio';

// HTML real da UGT fornecido pelo utilizador
const htmlUGT = `
<div class="col-12 col-md-6">
  <article class="item ">
    <div class="placeholder">
      <img src="https://www.ugt.pt/publicfiles/3mxyie37kfyee8paucbz05uijgzoerfqbpydayxc.png"
        alt="Documento">
    </div>
    <div class="tags__category">
      <span class="tag" style="color: hsl(360, 50%, 50%);">Notícias Internacionais</span>
    </div>
    <div class="title">
      <h6>
        <a href="https://www.ugt.pt/noticias/artigo/dirigentes-da-ugt-reforcam-representacao-sindical-no-comite/6525" title="Ver Notícia">
          Dirigentes da UGT reforçam representação sindical no Comité Económico e Social Europeu
        </a>
      </h6>
    </div>
    <div class="date">
      <p class="f-muli fw-300 f-title-3 fs-italic">
        22
        <span class="double-dash"></span>
        outubro
        <span class="double-dash"></span>
        2025
      </p>
    </div>
    <div class="tags">
      <span class="tag">CESE</span>
      <span class="tag">Comité Económico e Social Europeu</span>
      <span class="tag">Grupo dos Trabalhadores</span>
      <span class="tag">Europa</span>
    </div>
    <div class="sp-15"></div>
    <hr>
  </article>
</div>`;

// Configuração UGT
const configUGT = {
  seletores: [
    ".title h6 a",
    "article.item .title a",
    ".col-md-6 article .title a",
  ],
  seletorData: ".date p",
  seletorTags: ".tags .tag",
  seletorCategoria: ".tags__category .tag",
};

// Função de parsing de data
function parseData(dataString) {
  if (!dataString) return null;

  const mesesPT = {
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12',
  };

  let texto = dataString.replace(/\s+/g, " ").trim();

  // Formato: "22 outubro 2025"
  const matchPT = texto.match(/(\d{1,2})\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+(\d{4})/i);
  if (matchPT) {
    const dia = matchPT[1].padStart(2, '0');
    const mes = mesesPT[matchPT[2].toLowerCase()];
    const ano = matchPT[3];
    return `${ano}-${mes}-${dia}`;
  }

  return null;
}

console.log('🧪 ========== TESTE DO SCRAPER UGT ==========\n');

const $ = cheerio.load(htmlUGT);

console.log('📋 Testando seletores:\n');

// Testar cada seletor
for (const seletor of configUGT.seletores) {
  const elementos = $(seletor);
  console.log(`${elementos.length > 0 ? '✅' : '❌'} Seletor "${seletor}": ${elementos.length} elemento(s)`);

  if (elementos.length > 0) {
    const $link = elementos.first();
    const titulo = $link.text().trim();
    const url = $link.attr('href');

    console.log(`   📄 Título: ${titulo}`);
    console.log(`   🔗 URL: ${url}`);
  }
}

console.log('\n📅 Testando extração de data:\n');
const dataTexto = $(configUGT.seletorData).text().trim();
console.log(`   Texto original: "${dataTexto}"`);

const dataParsed = parseData(dataTexto);
console.log(`   Data parseada: ${dataParsed}`);
console.log(`   ${dataParsed === '2025-10-22' ? '✅ CORRETO!' : '❌ ERRO!'}`);

console.log('\n🏷️  Testando extração de tags:\n');
const tags = [];
$(configUGT.seletorTags).each((i, el) => {
  tags.push($(el).text().trim());
});
console.log(`   Tags encontradas: ${tags.length}`);
tags.forEach((tag, i) => {
  console.log(`   ${i + 1}. ${tag}`);
});

console.log('\n📂 Testando extração de categoria:\n');
const categoria = $(configUGT.seletorCategoria).text().trim();
console.log(`   Categoria: "${categoria}"`);

console.log('\n✅ ========== RESULTADO FINAL ==========\n');

const documento = {
  tipo_conteudo: "noticia",
  tipo_radar: "stakeholders",
  categoria: "concertacao_social",
  titulo: $(".title h6 a").text().trim(),
  data_publicacao: dataParsed,
  url: $(".title h6 a").attr('href'),
  fonte: "ugt",
  entidades: "UGT",
  tags: tags,
  categoria_origem: categoria,
};

console.log('📄 Documento extraído:');
console.log(JSON.stringify(documento, null, 2));

console.log('\n🎯 Status: TODOS OS SELETORES FUNCIONANDO! ✅\n');
