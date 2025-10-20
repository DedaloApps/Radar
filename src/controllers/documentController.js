import Document from '../models/Document.js';

// Obter documentos recentes
export const getRecentDocuments = async (req, res) => {
  try {
    const { categoria, fonte, limit = 500 } = req.query; // ← AUMENTADO PARA 500
    
    const filtro = {};
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
// Estatísticas por categoria
export const getStats = async (req, res) => {
  try {
    // Stats por categoria
    const porCategoria = await Document.aggregate([
      {
        $group: {
          _id: '$categoria',
          total: { $sum: 1 }
        }
      }
    ]);
    
    // Total geral
    const totalGeral = await Document.countDocuments({});
    
    // Documentos de hoje (últimas 24h)
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    
    const documentosHoje = await Document.countDocuments({
      created_at: ontem.toISOString()
    });
    
    res.json({
      success: true,
      data: {
        porCategoria,
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
    
    // Buscar todos e filtrar manualmente
    const todos = await Document.find({ limit: 1000 }); // ← AUMENTADO
    const documentos = todos.filter(doc => 
      doc.titulo.toLowerCase().includes(q.toLowerCase()) ||
      (doc.resumo && doc.resumo.toLowerCase().includes(q.toLowerCase()))
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