// src/utils/radars.js
import {
  ScaleIcon,
  UserGroupIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  CurrencyEuroIcon,
  HeartIcon,
  HomeModernIcon,
  TruckIcon,
} from '@heroicons/react/24/solid';

// ============================================
// RADAR LEGISLATIVO (JÁ EXISTE)
// ============================================
export { COMISSOES } from './categories';

// ============================================
// RADAR STAKEHOLDERS (NOVO)
// ============================================
export const STAKEHOLDERS = {
  concertacao_social: {
    numero: '🤝',
    nome: 'Concertação Social',
    nomeCompleto: 'Concertação Social',
    icon: UserGroupIcon,
    cor: 'from-blue-400 to-cyan-500',
    borderCor: 'border-blue-500',
    bgCor: 'bg-blue-500/10',
    shadowCor: 'shadow-blue-500/50',
    textCor: 'text-blue-400',
    entidades: [
      { id: 'cgtp', nome: 'CGTP', url: 'https://www.cgtp.pt/accao-e-luta' },
      { id: 'ugt', nome: 'UGT', url: 'https://www.ugt.pt/noticias' },
      { id: 'cap', nome: 'CAP', url: 'https://www.cap.pt/noticias-cap' },
      { id: 'ccp', nome: 'CCP', url: 'https://ccp.pt/noticias/' },
      { id: 'ctp', nome: 'CTP', url: 'https://ctp.org.pt/noticias' }
    ]
  },
  laboral: {
    numero: '💼',
    nome: 'Laboral',
    nomeCompleto: 'Trabalho e Emprego',
    icon: BriefcaseIcon,
    cor: 'from-purple-400 to-violet-500',
    borderCor: 'border-purple-500',
    bgCor: 'bg-purple-500/10',
    shadowCor: 'shadow-purple-500/50',
    textCor: 'text-purple-400',
    entidades: [
      { id: 'act', nome: 'ACT', url: 'https://portal.act.gov.pt/Pages/TodasNoticias.aspx#1' },
      { id: 'cite', nome: 'CITE', url: 'https://cite.gov.pt/noticias-antigas' },
      { id: 'aima', nome: 'AIMA', url: 'https://aima.gov.pt/pt/noticias' }
    ]
  },
  ambiente: {
    numero: '🌱',
    nome: 'Ambiente',
    nomeCompleto: 'Ambiente e Energia',
    icon: GlobeAltIcon,
    cor: 'from-teal-400 to-green-500',
    borderCor: 'border-teal-500',
    bgCor: 'bg-teal-500/10',
    shadowCor: 'shadow-teal-500/50',
    textCor: 'text-teal-400',
    entidades: [
      { id: 'apambiente', nome: 'APA', url: 'https://apambiente.pt/destaques' },
      { id: 'igamaot', nome: 'IGAMAOT', url: 'https://www.igamaot.gov.pt/pt/espaco-publico/destaques#1' },
      { id: 'dgav', nome: 'DGAV', url: 'https://www.dgav.pt/destaques/noticias/' },
      { id: 'dgeg', nome: 'DGEG', url: 'https://www.dgeg.gov.pt/pt/destaques/' },
      { id: 'adene', nome: 'ADENE', url: 'https://www.adene.pt/comunicacao/noticias/' },
      { id: 'erse', nome: 'ERSE', url: 'https://www.erse.pt/comunicacao/destaques/' }
    ]
  },
  agricultura: {
    numero: '🚜',
    nome: 'Agricultura',
    nomeCompleto: 'Agricultura e Alimentação',
    icon: TruckIcon,
    cor: 'from-lime-400 to-green-500',
    borderCor: 'border-lime-500',
    bgCor: 'bg-lime-500/10',
    shadowCor: 'shadow-lime-500/50',
    textCor: 'text-lime-400',
    entidades: [
      { id: 'dgadr', nome: 'DGADR', url: 'https://www.dgadr.gov.pt/pt/destaques' },
      { id: 'iniav', nome: 'INIAV', url: 'https://www.iniav.pt/divulgacao/noticias-iniav' }
    ]
  },
  economia_financas: {
    numero: '💰',
    nome: 'Economia/Finanças',
    nomeCompleto: 'Economia e Finanças',
    icon: CurrencyEuroIcon,
    cor: 'from-amber-400 to-orange-500',
    borderCor: 'border-amber-500',
    bgCor: 'bg-amber-500/10',
    shadowCor: 'shadow-amber-500/50',
    textCor: 'text-amber-400',
    entidades: [
      { id: 'iapmei', nome: 'IAPMEI', url: 'https://www.iapmei.pt/NOTICIAS.aspx' },
      { id: 'concorrencia', nome: 'AdC', url: 'https://www.concorrencia.pt/pt/noticias-comunicados-e-intervencoes' },
      { id: 'aduaneiro', nome: 'AT Aduaneiro', url: 'https://info-aduaneiro.portaldasfinancas.gov.pt/pt/noticias/Pages/noticias.aspx' },
      { id: 'bportugal', nome: 'Banco de Portugal', url: 'https://www.bportugal.pt/comunicados/media/banco-de-portugal' },
      { id: 'portugalglobal', nome: 'Portugal Global', url: 'https://portugalglobal.pt/noticias/' },
      { id: 'consumidor', nome: 'Portal Consumidor', url: 'https://www.consumidor.gov.pt/comunicacao1/noticias1?page=1' },
      { id: 'dgae', nome: 'DGAE', url: 'https://www.dgae.gov.pt/comunicacao/noticias.aspx' }
    ]
  },
  saude: {
    numero: '🏥',
    nome: 'Saúde',
    nomeCompleto: 'Saúde',
    icon: HeartIcon,
    cor: 'from-rose-400 to-pink-500',
    borderCor: 'border-rose-500',
    bgCor: 'bg-rose-500/10',
    shadowCor: 'shadow-rose-500/50',
    textCor: 'text-rose-400',
    entidades: [
      { id: 'infarmed', nome: 'INFARMED', url: 'https://www.infarmed.pt/web/infarmed/noticias' },
      { id: 'ers', nome: 'ERS', url: 'https://www.ers.pt/pt/comunicacao/noticias/' },
      { id: 'igas', nome: 'IGAS', url: 'https://www.igas.min-saude.pt/category/noticias-e-eventos/noticias/' }
    ]
  },
  imobiliario_habitacao: {
    numero: '🏠',
    nome: 'Imobiliário/Habitação',
    nomeCompleto: 'Imobiliário e Habitação',
    icon: HomeModernIcon,
    cor: 'from-indigo-400 to-purple-500',
    borderCor: 'border-indigo-500',
    bgCor: 'bg-indigo-500/10',
    shadowCor: 'shadow-indigo-500/50',
    textCor: 'text-indigo-400',
    entidades: [
      { id: 'cmvm', nome: 'CMVM', url: 'https://www.cmvm.pt/PInstitucional/Content?Input=E9639BDA21F5F3D13613E5F7C187F1A785B6EE9D48F21D9B121B7E5EC2D6A6F5' },
      { id: 'dgterritorio', nome: 'DGTerritório', url: 'https://www.dgterritorio.gov.pt/todas-noticias' },
      { id: 'ihru', nome: 'IHRU', url: 'https://www.ihru.pt/noticias' }
    ]
  }
};

export const TIPOS_CONTEUDO_LEGISLATIVO = {
  agenda: { nome: 'Agenda', emoji: '📅', cor: 'bg-blue-500' },
  audicao: { nome: 'Audição', emoji: '🎤', cor: 'bg-purple-500' },
  audiencia: { nome: 'Audiência', emoji: '👥', cor: 'bg-indigo-500' },
  iniciativa: { nome: 'Iniciativa', emoji: '📜', cor: 'bg-cyan-500' },
  peticao: { nome: 'Petição', emoji: '✍️', cor: 'bg-violet-500' },
  pergunta: { nome: 'Pergunta', emoji: '❓', cor: 'bg-purple-500' },
  requerimento: { nome: 'Requerimento', emoji: '📝', cor: 'bg-indigo-500' },
  votacao: { nome: 'Votação', emoji: '🗳️', cor: 'bg-blue-500' },
  sumula: { nome: 'Súmula', emoji: '📋', cor: 'bg-cyan-500' },
  geral: { nome: 'Geral', emoji: '📄', cor: 'bg-slate-500' }
};

export const TIPOS_CONTEUDO_STAKEHOLDERS = {
  noticia: { nome: 'Notícia', emoji: '📰', cor: 'bg-blue-500' },
  comunicado: { nome: 'Comunicado', emoji: '📢', cor: 'bg-purple-500' },
  destaque: { nome: 'Destaque', emoji: '⭐', cor: 'bg-amber-500' },
  relatorio: { nome: 'Relatório', emoji: '📊', cor: 'bg-teal-500' },
  posicionamento: { nome: 'Posicionamento', emoji: '💬', cor: 'bg-indigo-500' },
  evento: { nome: 'Evento', emoji: '📅', cor: 'bg-cyan-500' },
};

export const RADARS_CONFIG = {
  legislativo: {
    id: 'legislativo',
    nome: 'Radar Legislativo',
    nomeCompleto: 'Parlamento Português',
    icon: ScaleIcon,
    cores: {
      primaria: '#262261',
      secundaria: '#27aae2'
    },
    categorias: 'COMISSOES',
    tiposConteudo: TIPOS_CONTEUDO_LEGISLATIVO
  },
  stakeholders: {
    id: 'stakeholders',
    nome: 'Radar Stakeholders',
    nomeCompleto: 'Entidades e Organismos',
    icon: UserGroupIcon,
    cores: {
      primaria: '#262261',
      secundaria: '#27aae2'
    },
    categorias: STAKEHOLDERS,
    tiposConteudo: TIPOS_CONTEUDO_STAKEHOLDERS
  }
};

export const getRadarConfig = (radarId) => {
  return RADARS_CONFIG[radarId] || RADARS_CONFIG.legislativo;
};

export const getCategorias = (radarId) => {
  const config = getRadarConfig(radarId);
  if (config.categorias === 'COMISSOES') {
    const { COMISSOES } = require('./categories');
    return COMISSOES;
  }
  return config.categorias;
};

export const getCategoriaInfo = (categoria, radarId = 'legislativo') => {
  const categorias = getCategorias(radarId);
  return categorias[categoria] || {
    nome: 'Outros',
    icon: ScaleIcon,
    cor: 'from-gray-400 to-gray-600',
    borderCor: 'border-gray-500',
    bgCor: 'bg-gray-500/10',
    shadowCor: 'shadow-gray-500/50',
    textCor: 'text-gray-400'
  };
};