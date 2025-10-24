// backend/scrapers/runScraper.js (SUBSTITUIR - só mudou o import)
import 'dotenv/config';
import { testConnection } from '../config/supabase.js';
import { scrapeTodasComissoes } from './comissoes.js';
import { scrapeTodasPaginasGerais } from './paginasGerais.js';
import { scrapeTodosStakeholders } from './stakeholders.js'; // ← Lowercase 's'
import { enviarNotificacoes } from '../services/emailService.js';

export async function executarScraping() {
  console.log('\n🚀 ========== INICIANDO SCRAPING COMPLETO ==========\n');
  const inicio = Date.now();
  
  try {
    console.log('🔄 Conectando ao Supabase...');
    await testConnection();
    
    console.log('\n📡 ===== RADAR LEGISLATIVO =====');
    console.log('📡 Scraping das comissões...');
    const novosComissoes = await scrapeTodasComissoes();
    
    console.log('\n📡 Scraping das páginas gerais...');
    const novosPaginasGerais = await scrapeTodasPaginasGerais();
    
    const totalLegislativo = novosComissoes + novosPaginasGerais;
    
    console.log('\n📡 ===== RADAR STAKEHOLDERS =====');
    const totalStakeholders = await scrapeTodosStakeholders();
    
    const totalGeral = totalLegislativo + totalStakeholders;
    
    console.log('\n\n📊 ========== RESUMO FINAL ==========');
    console.log(`Radar Legislativo: ${totalLegislativo} novos (${novosComissoes} comissões + ${novosPaginasGerais} páginas gerais)`);
    console.log(`Radar Stakeholders: ${totalStakeholders} novos`);
    console.log(`─────────────────────────────────────`);
    console.log(`TOTAL GERAL: ${totalGeral} novos documentos`);
    
    if (totalGeral > 0) {
      console.log('\n📧 Enviando notificações por email...');
      await enviarNotificacoes();
    } else {
      console.log('\n✅ Nenhum documento novo - sem notificações para enviar');
    }
    
    const duracao = ((Date.now() - inicio) / 1000 / 60).toFixed(2);
    console.log(`\n⏱️  Tempo total: ${duracao} minutos`);
    console.log('✅ Scraping completo concluído com sucesso!\n');
    
    return totalGeral;
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  executarScraping()
    .then((total) => {
      console.log(`🎉 Finalizado! Total: ${total} documentos novos`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}