// Script de teste para scrapers de stakeholders
import 'dotenv/config';
import { testConnection } from './src/config/supabase.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Configuração simplificada dos 5 stakeholders de Concertação Social
const STAKEHOLDERS_CONCERTACAO = {
  cgtp: {
    url: "https://www.cgtp.pt/accao-e-luta",
    nome: "CGTP-IN",
    seletores: [
      ".entry-title a",
      "article h2 a",
      ".post-title a",
      "h2 a[href*='/accao-e-luta/']",
      ".content-item a"
    ],
  },
  ugt: {
    url: "https://www.ugt.pt/noticias",
    nome: "UGT",
    seletores: [
      ".col-4 a[href*='/noticias/artigo/']",
      "article a[href*='/noticias/']",
      ".news-item a",
      ".noticia-titulo a",
      "h3 a, h2 a"
    ],
  },
  cap: {
    url: "https://www.cap.pt/noticias-cap",
    nome: "CAP",
    seletores: [
      ".noticia-titulo a",
      "article h2 a",
      ".news-title a",
      "h3 a[href*='/noticias-']",
      ".content-item a"
    ],
  },
  ccp: {
    url: "https://ccp.pt/noticias/",
    nome: "CCP",
    seletores: [
      ".post-title a",
      "article h2 a",
      ".entry-title a",
      "h2 a[href*='/noticias/']",
      ".news-item a"
    ],
  },
  ctp: {
    url: "https://ctp.org.pt/noticias",
    nome: "CTP",
    seletores: [
      "article h2 a",
      ".entry-title a",
      ".post-title a",
      "h3 a[href*='/noticias']",
      ".news-item a"
    ],
  },
};

async function testarScraper(id, config) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔍 TESTANDO: ${config.nome} (${id})`);
  console.log(`   URL: ${config.url}`);
  console.log(`${'='.repeat(70)}`);

  try {
    console.log('   → Fazendo request...');
    const response = await axios.get(config.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    console.log(`   ✓ Status: ${response.status}`);
    console.log(`   ✓ Tamanho da resposta: ${(response.data.length / 1024).toFixed(2)} KB`);

    const $ = cheerio.load(response.data);

    console.log('\n   🔍 Testando seletores:\n');

    let encontrouResultados = false;

    for (const seletor of config.seletores) {
      const elementos = $(seletor);
      const count = elementos.length;

      if (count > 0) {
        console.log(`   ✅ "${seletor}": ${count} elementos`);

        if (!encontrouResultados) {
          encontrouResultados = true;
          console.log('\n   📄 Primeiros 3 resultados:\n');

          elementos.slice(0, 3).each((i, el) => {
            const titulo = $(el).text().trim();
            const url = $(el).attr('href');
            console.log(`      ${i + 1}. ${titulo.substring(0, 60)}...`);
            console.log(`         URL: ${url}`);
          });
        }
      } else {
        console.log(`   ❌ "${seletor}": 0 elementos`);
      }
    }

    if (!encontrouResultados) {
      console.log('\n   ⚠️  NENHUM SELETOR FUNCIONOU!');
      console.log('   💡 Sugestão: Inspecionar o HTML do site para encontrar seletores corretos');
    }

    return encontrouResultados;

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log(`   ❌ TIMEOUT: Não foi possível conectar ao site`);
    } else if (error.response?.status === 403) {
      console.log(`   ❌ ERRO 403: Site bloqueou o acesso (proteção anti-scraping)`);
    } else if (error.response?.status === 404) {
      console.log(`   ❌ ERRO 404: Página não encontrada`);
    } else if (error.code === 'ENOTFOUND') {
      console.log(`   ❌ ERRO DNS: Não foi possível resolver o domínio`);
    } else {
      console.log(`   ❌ ERRO: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log('\n🚀 ========== TESTE DE SCRAPERS - CONCERTAÇÃO SOCIAL ==========\n');

  // Testar conexão com Supabase
  console.log('🔄 Testando conexão com Supabase...');
  try {
    await testConnection();
    console.log('✅ Conexão com Supabase OK\n');
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error.message);
    console.log('⚠️  Continuando mesmo assim (só para testar scraping)...\n');
  }

  const resultados = {};

  // Testar cada stakeholder
  for (const [id, config] of Object.entries(STAKEHOLDERS_CONCERTACAO)) {
    const sucesso = await testarScraper(id, config);
    resultados[id] = sucesso;

    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Resumo final
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(70));

  let sucessos = 0;
  let falhas = 0;

  for (const [id, sucesso] of Object.entries(resultados)) {
    const config = STAKEHOLDERS_CONCERTACAO[id];
    const status = sucesso ? '✅' : '❌';
    console.log(`   ${status} ${config.nome.padEnd(15)} - ${sucesso ? 'OK' : 'FALHOU'}`);
    if (sucesso) sucessos++;
    else falhas++;
  }

  console.log('='.repeat(70));
  console.log(`   Total: ${sucessos} sucessos, ${falhas} falhas`);
  console.log('='.repeat(70) + '\n');

  if (falhas > 0) {
    console.log('⚠️  Alguns scrapers falharam. Possíveis causas:');
    console.log('   1. Sites com proteção anti-scraping');
    console.log('   2. Seletores CSS desatualizados');
    console.log('   3. Problemas de conexão');
    console.log('   4. Estrutura HTML do site mudou\n');
  }
}

// Executar
main()
  .then(() => {
    console.log('✅ Teste concluído!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
