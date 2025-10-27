import Document from '../models/Document.js';

// Obter documentos recentes
export const getRecentDocuments = async (req, res) => {
  try {
    const { categoria, fonte, limit = 500 } = req.query; // ← AUMENTADO PARA 500

    const filtro = {
      tipo_radar: 'parlamento' // ← FILTRAR APENAS PARLAMENTO
    };
    if (categoria) filtro.categoria = categoria;
    if (fonte) filtro.fonte = fonte;
    if (limit) filtro.limit = parseInt(limit);

    const documentos = await Document.find(filtro);

    res.json({
      success: true,
      count: documentos.length,
      data: documentos
    });

  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Estatísticas por categoria
export const getStats = async (req, res) => {
  try {
    // Buscar todos documentos do parlamento
    const todos = await Document.find({
      tipo_radar: 'parlamento', // ← FILTRAR APENAS PARLAMENTO
      limit: 10000
    });

    // Agrupar por categoria
    const porCategoria = todos.reduce((acc, doc) => {
      const cat = doc.categoria || 'outros';
      if (!acc[cat]) {
        acc[cat] = { _id: cat, total: 0 };
      }
      acc[cat].total++;
      return acc;
    }, {});

    const porCategoriaArray = Object.values(porCategoria);

    // Total geral
    const totalGeral = todos.length;

    // Documentos de hoje (últimas 24h)
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    const documentosHoje = todos.filter(doc =>
      new Date(doc.created_at) >= ontem
    ).length;

    res.json({
      success: true,
      data: {
        porCategoria: porCategoriaArray,
        totalGeral,
        documentosHoje,
        ultimaAtualizacao: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Pesquisar documentos
export const searchDocuments = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro de pesquisa (q) obrigatório'
      });
    }

    // Buscar todos documentos do parlamento
    const todos = await Document.find({
      tipo_radar: 'parlamento', // ← FILTRAR APENAS PARLAMENTO
      limit: 1000
    });

    // Filtrar por query
    const documentos = todos.filter(doc =>
      doc.titulo.toLowerCase().includes(q.toLowerCase()) ||
      (doc.resumo && doc.resumo.toLowerCase().includes(q.toLowerCase())) ||
      (doc.fonte && doc.fonte.toLowerCase().includes(q.toLowerCase()))
    );

    res.json({
      success: true,
      count: documentos.length,
      data: documentos.slice(0, 50) // ← Retornar top 50 resultados
    });

  } catch (error) {
    console.error('Erro ao pesquisar:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};