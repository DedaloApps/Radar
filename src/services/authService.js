import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production_please_very_secret';
const JWT_EXPIRES_IN = '7d';

// Gerar código de convite único
export function gerarCodigoConvite() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 6; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  
  return `RADAR-${segments.join('-')}`;
}

// Criar convite
export async function criarConvite(email = null, validoDias = 7) {
  const code = gerarCodigoConvite();
  const validoAte = new Date();
  validoAte.setDate(validoAte.getDate() + validoDias);
  
  const { data, error } = await supabase
    .from('invite_codes')
    .insert([{
      code,
      email,
      valido_ate: validoAte.toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Validar código de convite
export async function validarConvite(code) {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  
  if (error) return { valido: false, mensagem: 'Código inválido' };
  if (data.usado) return { valido: false, mensagem: 'Código já utilizado' };
  
  const agora = new Date();
  const validoAte = new Date(data.valido_ate);
  
  if (agora > validoAte) {
    return { valido: false, mensagem: 'Código expirado' };
  }
  
  return { valido: true, convite: data };
}

// Registar utilizador
export async function registarUtilizador(email, password, nome, codigoConvite) {
  // Validar convite
  const validacao = await validarConvite(codigoConvite);
  if (!validacao.valido) {
    throw new Error(validacao.mensagem);
  }
  
  const convite = validacao.convite;
  
  // Se o convite tem email específico, validar
  if (convite.email && convite.email !== email) {
    throw new Error('Este código é para outro email');
  }
  
  // Verificar se email já existe
  const { data: existente } = await supabase
    .from('auth_users')
    .select('id')
    .eq('email', email)
    .single();
  
  if (existente) {
    throw new Error('Email já registado');
  }
  
  // Hash da password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Criar utilizador
  const { data: user, error } = await supabase
    .from('auth_users')
    .insert([{
      email,
      password_hash: passwordHash,
      nome,
      convite_usado: codigoConvite.toUpperCase()
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  // Marcar convite como usado
  await supabase
    .from('invite_codes')
    .update({
      usado: true,
      usado_por: email,
      usado_em: new Date().toISOString()
    })
    .eq('code', codigoConvite.toUpperCase());
  
  // Gerar token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  return {
    user: {
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role
    },
    token
  };
}

// Login
export async function loginUtilizador(email, password) {
  // Buscar utilizador
  const { data: user, error } = await supabase
    .from('auth_users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error || !user) {
    throw new Error('Email ou password incorretos');
  }
  
  if (!user.ativo) {
    throw new Error('Conta desativada');
  }
  
  // Verificar password
  const passwordValida = await bcrypt.compare(password, user.password_hash);
  
  if (!passwordValida) {
    throw new Error('Email ou password incorretos');
  }
  
  // Atualizar último login
  await supabase
    .from('auth_users')
    .update({ ultimo_login: new Date().toISOString() })
    .eq('id', user.id);
  
  // Gerar token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  return {
    user: {
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      categorias_favoritas: user.categorias_favoritas,
      tipos_conteudo_visiveis: user.tipos_conteudo_visiveis
    },
    token
  };
}

// Verificar token
export function verificarToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

// Listar convites (admin)
export async function listarConvites() {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}