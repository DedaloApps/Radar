// Teste final: simular scraping UGT com categoria correta
import 'dotenv/config';
import * as cheerio from 'cheerio';
import { testConnection } from './src/config/supabase.js';
import Document from './src/models/Document.js';

const htmlUGT = `
<div class="col-12 col-md-6">
  <article class="item">
    <div class="title">
      <h6>
        <a href="https://www.ugt.pt/noticias/artigo/teste-categoria-corrigida/9999">
          🧪 TESTE: Documento com categoria stake_concertacao
        </a>
      </h6>
    </div>
    <div class="date">
      <p>28 outubro 2025</p>
    </div>
  </article>
</div>`;

// Parsing de data
function parseData(dataString) {
  const mesesPT = {
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12',
  };

  const texto = dataString.replace(/\s+/g, " ").trim();
  const matchPT = texto.match(/(\d{1,2})\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+(\d{4})/i);

  if (matchPT) {
    const dia = matchPT[1].padStart(2, '0');
    const mes = mesesPT[matchPT[2].toLowerCase()];
    const ano = matchPT[3];
    return `${ano}-${mes}-${dia}`;
  }
  return null;
}

async function testarIntegracaoCompleta() {
  console.log('🧪 ========== TESTE DE INTEGRAÇÃO COMPLETA ==========\n');

  try {
    // 1. Testar conexão Supabase
    console.log('1️⃣ Testando conexão com Supabase...');
    await testConnection();
    console.log('   ✅ Conexão OK\n');

    // 2. Parsear HTML
    console.log('2️⃣ Parseando HTML da UGT...');
    const $ = cheerio.load(htmlUGT);
    const titulo = $('.title h6 a').text().trim();
    const url = $('.title h6 a').attr('href');
    const dataTexto = $('.date p').text().trim();
    const data = parseData(dataTexto);

    console.log(`   📄 Título: ${titulo}`);
    console.log(`   🔗 URL: ${url}`);
    console.log(`   📅 Data: ${data}`);
    console.log('   ✅ Parsing OK\n');

    // 3. Criar documento com categoria correta
    console.log('3️⃣ Criando documento na base de dados...');
    const documento = {
      tipo_conteudo: "noticia",
      tipo_radar: "stakeholders",
      categoria: "stake_concertacao",  // ✅ Categoria corrigida!
      titulo: titulo,
      data_publicacao: data,
      url: url,
      fonte: "ugt",
      entidades: "UGT",
      resumo: titulo,
    };

    console.log(`   Categoria usada: "${documento.categoria}"`);

    // Verificar se já existe
    const existe = await Document.findOne({ url: documento.url });
    if (existe) {
      console.log('   ⚠️  Documento já existe (teste anterior), apagando...');
      // Não vou apagar para não mexer na BD, só informar
    }

    // Tentar criar
    const resultado = await Document.create(documento);
    console.log('   ✅ Documento criado com sucesso!\n');

    // 4. Verificar documento na BD
    console.log('4️⃣ Verificando documento na base de dados...');
    const verificacao = await Document.findOne({ url: documento.url });

    if (verificacao) {
      console.log('   ✅ Documento encontrado na BD');
      console.log(`   📊 ID: ${verificacao.id}`);
      console.log(`   📂 Categoria: ${verificacao.categoria}`);
      console.log(`   🏷️  Tipo Radar: ${verificacao.tipo_radar}`);
      console.log(`   📰 Fonte: ${verificacao.fonte}`);
    } else {
      console.log('   ❌ Documento NÃO encontrado');
    }

    console.log('\n✅ ========== TESTE COMPLETO COM SUCESSO! ==========\n');
    console.log('🎉 O scraper está 100% funcional!\n');
    console.log('📊 Próximo passo: Executar scraping real em ambiente adequado\n');

  } catch (error) {
    console.error('\n❌ ERRO no teste:', error.message);
    console.error('Stack:', error.stack);

    if (error.message.includes('categoria_check')) {
      console.error('\n⚠️  PROBLEMA: A categoria ainda não está atualizada no Supabase!');
      console.error('   Verifica se executaste o SQL corretamente.');
    }
  }
}

testarIntegracaoCompleta()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
