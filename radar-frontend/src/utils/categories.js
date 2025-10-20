import {
  ScaleIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  FlagIcon,
  BanknotesIcon,
  ChartBarIcon,
  TruckIcon,
  AcademicCapIcon,
  HeartIcon,
  UserGroupIcon,
  BoltIcon,
  MusicalNoteIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  EyeIcon
} from '@heroicons/react/24/solid';

export const COMISSOES = {
  comissao_01: {
    numero: '1.ª',
    nome: 'Assuntos Constitucionais',
    nomeCompleto: 'Assuntos Constitucionais, Direitos, Liberdades e Garantias',
    icon: ScaleIcon,
    cor: 'from-emerald-400 to-teal-500',
    borderCor: 'border-emerald-500',
    bgCor: 'bg-emerald-500/10',
    shadowCor: 'shadow-emerald-500/50',
    textCor: 'text-emerald-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/1CACDLG/Paginas/default.aspx'
  },
  comissao_02: {
    numero: '2.ª',
    nome: 'Negócios Estrangeiros',
    nomeCompleto: 'Negócios Estrangeiros e Comunidades Portuguesas',
    icon: GlobeAltIcon,
    cor: 'from-blue-400 to-cyan-500',
    borderCor: 'border-blue-500',
    bgCor: 'bg-blue-500/10',
    shadowCor: 'shadow-blue-500/50',
    textCor: 'text-blue-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/2CNECP/Paginas/default.aspx'
  },
  comissao_03: {
    numero: '3.ª',
    nome: 'Defesa Nacional',
    nomeCompleto: 'Defesa Nacional',
    icon: ShieldCheckIcon,
    cor: 'from-red-400 to-orange-500',
    borderCor: 'border-red-500',
    bgCor: 'bg-red-500/10',
    shadowCor: 'shadow-red-500/50',
    textCor: 'text-red-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/3CDN/Paginas/default.aspx'
  },
  comissao_04: {
    numero: '4.ª',
    nome: 'Assuntos Europeus',
    nomeCompleto: 'Assuntos Europeus',
    icon: FlagIcon,
    cor: 'from-indigo-400 to-blue-500',
    borderCor: 'border-indigo-500',
    bgCor: 'bg-indigo-500/10',
    shadowCor: 'shadow-indigo-500/50',
    textCor: 'text-indigo-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/4CAE/Paginas/default.aspx'
  },
  comissao_05: {
    numero: '5.ª',
    nome: 'Orçamento e Finanças',
    nomeCompleto: 'Orçamento, Finanças e Administração Pública',
    icon: BanknotesIcon,
    cor: 'from-yellow-400 to-amber-500',
    borderCor: 'border-yellow-500',
    bgCor: 'bg-yellow-500/10',
    shadowCor: 'shadow-yellow-500/50',
    textCor: 'text-yellow-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/5COFAP/Paginas/default.aspx'
  },
  comissao_06: {
    numero: '6.ª',
    nome: 'Economia e Coesão',
    nomeCompleto: 'Economia e Coesão Territorial',
    icon: ChartBarIcon,
    cor: 'from-purple-400 to-pink-500',
    borderCor: 'border-purple-500',
    bgCor: 'bg-purple-500/10',
    shadowCor: 'shadow-purple-500/50',
    textCor: 'text-purple-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/6CECT/Paginas/default.aspx'
  },
  comissao_07: {
    numero: '7.ª',
    nome: 'Agricultura e Pescas',
    nomeCompleto: 'Agricultura e Pescas',
    icon: TruckIcon,
    cor: 'from-lime-400 to-green-500',
    borderCor: 'border-lime-500',
    bgCor: 'bg-lime-500/10',
    shadowCor: 'shadow-lime-500/50',
    textCor: 'text-lime-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/7CAP/Paginas/default.aspx'
  },
  comissao_08: {
    numero: '8.ª',
    nome: 'Educação e Ciência',
    nomeCompleto: 'Educação e Ciência',
    icon: AcademicCapIcon,
    cor: 'from-sky-400 to-blue-500',
    borderCor: 'border-sky-500',
    bgCor: 'bg-sky-500/10',
    shadowCor: 'shadow-sky-500/50',
    textCor: 'text-sky-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/8CEC/Paginas/default.aspx'
  },
  comissao_09: {
    numero: '9.ª',
    nome: 'Saúde',
    nomeCompleto: 'Saúde',
    icon: HeartIcon,
    cor: 'from-rose-400 to-red-500',
    borderCor: 'border-rose-500',
    bgCor: 'bg-rose-500/10',
    shadowCor: 'shadow-rose-500/50',
    textCor: 'text-rose-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/9CS/Paginas/default.aspx'
  },
  comissao_10: {
    numero: '10.ª',
    nome: 'Trabalho e Seg. Social',
    nomeCompleto: 'Trabalho, Segurança Social e Inclusão',
    icon: UserGroupIcon,
    cor: 'from-orange-400 to-red-500',
    borderCor: 'border-orange-500',
    bgCor: 'bg-orange-500/10',
    shadowCor: 'shadow-orange-500/50',
    textCor: 'text-orange-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/10CTSSI/Paginas/default.aspx'
  },
  comissao_11: {
    numero: '11.ª',
    nome: 'Ambiente e Energia',
    nomeCompleto: 'Ambiente e Energia',
    icon: BoltIcon,
    cor: 'from-green-400 to-emerald-500',
    borderCor: 'border-green-500',
    bgCor: 'bg-green-500/10',
    shadowCor: 'shadow-green-500/50',
    textCor: 'text-green-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/11CAE/Paginas/default.aspx'
  },
  comissao_12: {
    numero: '12.ª',
    nome: 'Cultura e Comunicação',
    nomeCompleto: 'Cultura, Comunicação, Juventude e Desporto',
    icon: MusicalNoteIcon,
    cor: 'from-pink-400 to-rose-500',
    borderCor: 'border-pink-500',
    bgCor: 'bg-pink-500/10',
    shadowCor: 'shadow-pink-500/50',
    textCor: 'text-pink-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/12CCCJD/Paginas/default.aspx'
  },
  comissao_13: {
    numero: '13.ª',
    nome: 'Reforma do Estado',
    nomeCompleto: 'Reforma do Estado e Poder Local',
    icon: BuildingOffice2Icon,
    cor: 'from-violet-400 to-purple-500',
    borderCor: 'border-violet-500',
    bgCor: 'bg-violet-500/10',
    shadowCor: 'shadow-violet-500/50',
    textCor: 'text-violet-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/13CREPL/Paginas/default.aspx'
  },
  comissao_14: {
    numero: '14.ª',
    nome: 'Infraestruturas',
    nomeCompleto: 'Infraestruturas, Mobilidade e Habitação',
    icon: HomeModernIcon,
    cor: 'from-slate-400 to-gray-500',
    borderCor: 'border-slate-500',
    bgCor: 'bg-slate-500/10',
    shadowCor: 'shadow-slate-500/50',
    textCor: 'text-slate-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/14CIMH/Paginas/default.aspx'
  },
  comissao_15: {
    numero: '15.ª',
    nome: 'Transparência',
    nomeCompleto: 'Transparência e Estatuto dos Deputados',
    icon: EyeIcon,
    cor: 'from-teal-400 to-cyan-500',
    borderCor: 'border-teal-500',
    bgCor: 'bg-teal-500/10',
    shadowCor: 'shadow-teal-500/50',
    textCor: 'text-teal-400',
    url: 'https://www.parlamento.pt/sites/com/XVIILeg/15CTED/Paginas/default.aspx'
  }
};

export const TIPOS_CONTEUDO = {
  agenda: { nome: 'Agenda', emoji: '📅', cor: 'bg-blue-500' },
  audicao: { nome: 'Audição', emoji: '🎤', cor: 'bg-purple-500' },
  audiencia: { nome: 'Audiência', emoji: '👥', cor: 'bg-green-500' },
  iniciativa: { nome: 'Iniciativa', emoji: '📜', cor: 'bg-yellow-500' },
  peticao: { nome: 'Petição', emoji: '✍️', cor: 'bg-red-500' },
  geral: { nome: 'Geral', emoji: '📄', cor: 'bg-gray-500' }
};

export const getCategoriaInfo = (categoria) => {
  return COMISSOES[categoria] || {
    nome: 'Outros',
    icon: ScaleIcon,
    cor: 'from-gray-400 to-gray-600',
    borderCor: 'border-gray-500',
    bgCor: 'bg-gray-500/10',
    shadowCor: 'shadow-gray-500/50',
    textCor: 'text-gray-400'
  };
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getFonteNome = (fonte) => {
  return fonte === 'diario_republica' 
    ? 'Diário da República' 
    : 'Parlamento';
};