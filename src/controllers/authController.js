import * as authService from '../services/authService.js';

export const registar = async (req, res) => {
  try {
    const { email, password, nome, codigoConvite } = req.body;
    
    if (!email || !password || !nome || !codigoConvite) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
    }
    
    const result = await authService.registarUtilizador(email, password, nome, codigoConvite);
    
    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      data: result
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e password são obrigatórios'
      });
    }
    
    const result = await authService.loginUtilizador(email, password);
    
    res.json({
      success: true,
      message: 'Login efetuado com sucesso!',
      data: result
    });
    
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

export const validarConvite = async (req, res) => {
  try {
    const { code } = req.params;
    const validacao = await authService.validarConvite(code);
    
    res.json({
      success: validacao.valido,
      message: validacao.mensagem || 'Código válido',
      data: validacao.convite
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ADMIN: Criar convite
export const criarConvite = async (req, res) => {
  try {
    const { email, validoDias } = req.body;
    const convite = await authService.criarConvite(email, validoDias || 7);
    
    res.status(201).json({
      success: true,
      message: 'Convite criado!',
      data: convite
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ADMIN: Listar convites
export const listarConvites = async (req, res) => {
  try {
    const convites = await authService.listarConvites();
    
    res.json({
      success: true,
      count: convites.length,
      data: convites
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};