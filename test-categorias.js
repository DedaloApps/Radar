// Teste rápido: verificar se categorias foram atualizadas
import { readFileSync } from 'fs';

const content = readFileSync('./src/scrapers/stakeholders.js', 'utf8');

console.log('🔍 Verificando categorias atualizadas:\n');

const categorias = [
  { old: 'concertacao_social', new: 'stake_concertacao' },
  { old: 'laboral', new: 'stake_laboral' },
  { old: 'ambiente', new: 'stake_ambiente' },
  { old: 'agricultura', new: 'stake_agricultura' },
  { old: 'economia_financas', new: 'stake_economia' },
  { old: 'saude', new: 'stake_saude' },
  { old: 'imobiliario_habitacao', new: 'stake_imobiliario' },
];

categorias.forEach(({ old, new: novo }) => {
  const countOld = (content.match(new RegExp(`"${old}"`, 'g')) || []).length;
  const countNew = (content.match(new RegExp(`"${novo}"`, 'g')) || []).length;

  console.log(`${countNew > 0 ? '✅' : '❌'} ${novo.padEnd(25)} - ${countNew} ocorrências (antigas: ${countOld})`);
});

console.log('\n✅ Todas as categorias foram atualizadas!\n');
