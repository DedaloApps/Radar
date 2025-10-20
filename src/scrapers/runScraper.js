import 'dotenv/config';
import { testConnection } from '../config/supabase.js';
import { scrapeTodasComissoes } from './comissoes.js';
import { enviarNotificacoes } from '../services/emailService.js';

export async function executarScraping() {
  console.log('\n🚀 ========== INICIANDO SCRAPING ==========\n');
  const inicio = Date.now();
  
  try {
    console.log('🔄 Conectando ao Supabase...');
    await testConnection();
    
    console.log('📡 Iniciando scraping das comissões...');
    const totalNovos = await scrapeTodasComissoes();
    
    console.log(`\n✅ Scraping concluído: ${totalNovos} novos documentos`);
    
    // Enviar notificações se houver novos documentos
    if (totalNovos > 0) {
      console.log('\n📧 Enviando notificações por email...');
      await enviarNotificacoes();
    } else {
      console.log('\n✅ Nenhum documento novo - sem notificações para enviar');
    }
    
    const duracao = ((Date.now() - inicio) / 1000).toFixed(2);
    console.log(`\n⏱️  Tempo total: ${duracao}s`);
    console.log('✅ Scraping concluído com sucesso!\n');
    
    return totalNovos;
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// Executar se chamado diretamente
executarScraping()
  .then((total) => {
    console.log(`🎉 Finalizado! Total: ${total} documentos novos`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });