import cron from 'node-cron';

let ultimaAtualizacao = null;
let totalScrapings = 0;

export function iniciarAgendamento() {
  console.log('⏰ ========== AGENDAMENTO HÍBRIDO INTELIGENTE ==========\n');
  
  // 🟢 HORÁRIO DE EXPEDIENTE: a cada 15 min (Seg-Sex, 9h-19h)
  cron.schedule('*/15 9-19 * * 1-5', async () => {
    const agora = new Date();
    console.log(`\n🟢 [ATIVO] ${agora.toLocaleString('pt-PT')} - Scraping no horário de expediente`);
    
    const { executarScraping } = await import('../scrapers/runScraper.js');
    await executarScraping();
    
    ultimaAtualizacao = agora;
    totalScrapings++;
    console.log(`📊 Total de scrapings hoje: ${totalScrapings}\n`);
  });
  
  // 🟡 FORA DE EXPEDIENTE: a cada 2 horas (noites/madrugadas)
  cron.schedule('0 */2 * * *', async () => {
    const hora = new Date().getHours();
    const diaSemana = new Date().getDay();
    
    // Só executar se NÃO for horário de expediente (Seg-Sex 9h-19h)
    const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;
    const isHorarioExpediente = hora >= 9 && hora <= 19;
    
    if (!isDiaUtil || !isHorarioExpediente) {
      const agora = new Date();
      console.log(`\n🟡 [LENTO] ${agora.toLocaleString('pt-PT')} - Scraping fora de expediente`);
      
      const { executarScraping } = await import('../scrapers/runScraper.js');
      await executarScraping();
      
      ultimaAtualizacao = agora;
      totalScrapings++;
      console.log(`📊 Total de scrapings hoje: ${totalScrapings}\n`);
    }
  });
  
  // 🔵 FIM DE SEMANA: 1x por dia às 10h (Sáb-Dom)
  cron.schedule('0 10 * * 0,6', async () => {
    const agora = new Date();
    console.log(`\n🔵 [FDS] ${agora.toLocaleString('pt-PT')} - Scraping de fim de semana`);
    
    const { executarScraping } = await import('../scrapers/runScraper.js');
    await executarScraping();
    
    ultimaAtualizacao = agora;
    totalScrapings++;
    console.log(`📊 Total de scrapings hoje: ${totalScrapings}\n`);
  });
  
  // 🔄 Reset contador à meia-noite
  cron.schedule('0 0 * * *', () => {
    console.log(`\n🌙 Meia-noite - Reset do contador`);
    console.log(`📊 Total de scrapings ontem: ${totalScrapings}`);
    totalScrapings = 0;
  });
  
  console.log('✅ Scraping Híbrido Inteligente configurado:\n');
  console.log('   🟢 Dias úteis (Seg-Sex) 9h-19h: a cada 15 min (~40 scrapings)');
  console.log('   🟡 Noites e madrugadas: a cada 2h (~7 scrapings)');
  console.log('   🔵 Fins de semana (Sáb-Dom): 1x por dia às 10h');
  console.log('   📊 Estimativa: ~50-60 scrapings/dia\n');
  console.log('💡 Para scraping manual: npm run scrape\n');
}

// Função para obter status (útil para dashboard)
export function getSchedulerStatus() {
  return {
    ultimaAtualizacao,
    totalScrapingsHoje: totalScrapings,
    ativo: true
  };
}