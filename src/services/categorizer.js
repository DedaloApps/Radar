const keywordsPorCategoria = {
  saude: [
    'saúde', 'saude', 'hospital', 'médico', 'medico', 'sns', 'medicamento',
    'vacina', 'epidemia', 'pandemia', 'doença', 'doenca', 'tratamento',
    'enfermagem', 'clínica', 'clinica', 'sanitário', 'sanitario', 'farmácia',
    'cuidados saúde'
  ],
  ambiente: [
    'ambiente', 'ambiental', 'clima', 'climático', 'climatico', 'poluição',
    'poluicao', 'reciclagem', 'sustentável', 'sustentavel', 'energia renovável',
    'carbono', 'emissões', 'emissoes', 'biodiversidade', 'floresta', 'água',
    'agua', 'resíduos', 'residuos', 'ecológico', 'ecologico'
  ],
  economia: [
    'economia', 'económico', 'economico', 'pib', 'crescimento económico',
    'inflação', 'inflacao', 'investimento', 'exportação', 'exportacao',
    'importação', 'importacao', 'mercado', 'comércio', 'comercio', 'empresas',
    'negócios', 'negocios'
  ],
  trabalho: [
    'trabalho', 'emprego', 'desemprego', 'salário', 'salario', 'trabalhador',
    'contrato trabalho', 'código trabalho', 'codigo trabalho', 'sindicato',
    'greve', 'férias', 'ferias', 'despedimento', 'horário', 'horario',
    'segurança social', 'seguranca social', 'laboral'
  ],
  financas: [
    'finanças', 'financas', 'financeiro', 'orçamento', 'orcamento', 'fiscal',
    'imposto', 'iva', 'irs', 'irc', 'taxa', 'tributário', 'tributario',
    'receita', 'despesa', 'défice', 'defice', 'dívida', 'divida', 'tesouro',
    'tributação', 'tributacao'
  ]
};

export function categorizarDocumento(titulo, conteudo = '') {
  const textoCompleto = (titulo + ' ' + conteudo).toLowerCase();
  
  const pontuacoes = {};
  
  for (const [categoria, keywords] of Object.entries(keywordsPorCategoria)) {
    pontuacoes[categoria] = 0;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = textoCompleto.match(regex);
      if (matches) {
        pontuacoes[categoria] += matches.length;
      }
    });
  }
  
  // Encontrar categoria com maior pontuação
  let categoriaFinal = 'outros';
  let maxPontuacao = 0;
  
  for (const [categoria, pontuacao] of Object.entries(pontuacoes)) {
    if (pontuacao > maxPontuacao) {
      maxPontuacao = pontuacao;
      categoriaFinal = categoria;
    }
  }
  
  return categoriaFinal;
}