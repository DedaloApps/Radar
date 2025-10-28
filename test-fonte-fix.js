// Teste para validar fix da constraint documents_fonte_check
import Document from './src/models/Document.js';

console.log('🧪 ========== TESTE FIX FONTE ==========\n');

const testDoc = {
  tipo_conteudo: "noticia",
  tipo_radar: "stakeholders",
  categoria: "stake_concertacao",
  titulo: "TESTE: Documento de teste para validar fonte",
  data_publicacao: "2025-10-28",
  url: `https://teste.example.com/test-${Date.now()}`,
  fonte: "stakeholders",  // ✅ Valor genérico
  entidades: "CGTP-IN",   // ✅ Nome específico
  resumo: "Este é um documento de teste para validar a correção da constraint fonte.",
};

try {
  console.log('📝 Tentando criar documento com fonte="stakeholders"...\n');
  console.log('Dados do documento:');
  console.log(JSON.stringify(testDoc, null, 2));
  console.log('');

  const result = await Document.create(testDoc);

  console.log('✅ SUCESSO! Documento criado:\n');
  console.log(`   ID: ${result.id}`);
  console.log(`   Título: ${result.titulo}`);
  console.log(`   Fonte: ${result.fonte}`);
  console.log(`   Entidades: ${result.entidades}`);
  console.log(`   Categoria: ${result.categoria}`);
  console.log('');
  console.log('🎉 Fix funcionou! A constraint aceita "stakeholders".\n');
  console.log('Agora podes executar: node test-stakeholders.js');

} catch (error) {
  console.error('❌ ERRO ao criar documento:\n');
  console.error(`   Mensagem: ${error.message}`);
  console.error('');

  if (error.message.includes('documents_fonte_check')) {
    console.log('⚠️  A constraint ainda não foi atualizada no Supabase!');
    console.log('');
    console.log('Execute este SQL no Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TABLE documents');
    console.log('DROP CONSTRAINT IF EXISTS documents_fonte_check;');
    console.log('');
    console.log('ALTER TABLE documents');
    console.log('ADD CONSTRAINT documents_fonte_check');
    console.log("CHECK (fonte IN ('parlamento', 'stakeholders'));");
    console.log('');
  } else {
    console.error('Erro inesperado:', error);
  }
}

process.exit(0);
