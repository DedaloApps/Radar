import User from '../models/User.js';

// Registar utilizador
export const registarUser = async (req, res) => {
  try {
    const { email, categoriasInteresse } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email obrigatório'
      });
    }
    
    // Verificar se já existe
    let user = await User.findOne({ email });
    
    if (user) {
      // Atualizar categorias
      user = await User.findOneAndUpdate(
        { email },
        { 
          categoriasInteresse: categoriasInteresse || [],
          ativo: true 
        },
        { new: true }
      );
      
      return res.json({
        success: true,
        message: 'Preferências atualizadas',
        data: user
      });
    }
    
    // Criar novo
    user = await User.create({
      email,
      categoriasInteresse: categoriasInteresse || []
    });
    
    res.status(201).json({
      success: true,
      message: 'Utilizador registado com sucesso',
      data: user
    });
    
  } catch (error) {
    console.error('Erro ao registar user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Listar utilizadores
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
    
  } catch (error) {
    console.error('Erro ao listar users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Desativar notificações
export const desativarUser = async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOneAndUpdate(
      { email },
      { ativo: false },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilizador não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Notificações desativadas',
      data: user
    });
    
  } catch (error) {
    console.error('Erro ao desativar user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};