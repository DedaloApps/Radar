import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  KeyIcon, 
  EnvelopeIcon, 
  UserIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    codigoConvite: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteValid, setInviteValid] = useState(null);
  const [inviteChecking, setInviteChecking] = useState(false);

  const { login, register, validateInvite } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleValidateInvite = async () => {
    if (!formData.codigoConvite || formData.codigoConvite.length < 10) return;
    
    setInviteChecking(true);
    const result = await validateInvite(formData.codigoConvite);
    setInviteChecking(false);
    
    if (result.success) {
      setInviteValid(true);
      setError('');
    } else {
      setInviteValid(false);
      setError(result.message || 'Código inválido');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    
    if (mode === 'login') {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(
        formData.email,
        formData.password,
        formData.nome,
        formData.codigoConvite
      );
    }

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Tech Grid */}
        <div className="tech-grid opacity-20"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Animated Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
              <stop offset="50%" stopColor="rgba(16, 185, 129, 0.5)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
            </linearGradient>
          </defs>
          <line x1="0%" y1="30%" x2="100%" y2="30%" stroke="url(#lineGradient)" strokeWidth="2">
            <animate attributeName="y1" from="30%" to="70%" dur="8s" repeatCount="indefinite" />
            <animate attributeName="y2" from="30%" to="70%" dur="8s" repeatCount="indefinite" />
          </line>
          <line x1="30%" y1="0%" x2="30%" y2="100%" stroke="url(#lineGradient)" strokeWidth="2">
            <animate attributeName="x1" from="30%" to="70%" dur="10s" repeatCount="indefinite" />
            <animate attributeName="x2" from="30%" to="70%" dur="10s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-6xl flex gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-1 flex-col justify-center space-y-8">
          <div className="space-y-6">
            {/* Logo */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl shadow-2xl">
                <img 
                  src="/dedalo.png" 
                  alt="Dédalo" 
                  className="w-24 h-24 object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-6xl font-black leading-tight">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  RADAR
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  LEGISLATIVO
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-md leading-relaxed">
                Plataforma inteligente de monitorização parlamentar em tempo real
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-6">
              {[
                { icon: SparklesIcon, text: 'Atualizações em tempo real' },
                { icon: ShieldCheckIcon, text: 'Acesso seguro e exclusivo' },
                { icon: CheckCircleIcon, text: '15 comissões monitorizadas' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-gray-300 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 max-w-md w-full">
          <div className="glass-effect rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden backdrop-blur-xl">
            
            {/* Mode Toggle */}
            <div className="relative flex bg-slate-900/30 p-1.5">
              {/* Sliding Background */}
              <div 
                className={`absolute top-1.5 bottom-1.5 left-1.5 right-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl transition-transform duration-300 ease-out ${
                  mode === 'register' ? 'translate-x-full' : 'translate-x-0'
                }`}
                style={{ width: 'calc(50% - 0.375rem)' }}
              ></div>
              
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`relative flex-1 py-4 font-bold rounded-xl transition-all z-10 ${
                  mode === 'login'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                  setInviteValid(null);
                }}
                className={`relative flex-1 py-4 font-bold rounded-xl transition-all z-10 ${
                  mode === 'register'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Registar
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Logo Mobile */}
              <div className="lg:hidden text-center mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-3 shadow-xl">
                  <img src="/dedalo.png" alt="Dédalo" className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  RADAR LEGISLATIVO
                </h2>
              </div>

              {/* Welcome Message */}
              <div className="text-center pb-2">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {mode === 'login' 
                    ? 'Acede à plataforma com as tuas credenciais' 
                    : 'Usa o teu código de convite para começar'
                  }
                </p>
              </div>

              {/* Invite Code (Register only) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Código de Convite
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center">
                      <KeyIcon className="absolute left-4 w-5 h-5 text-emerald-400 z-10" />
                      <input
                        type="text"
                        name="codigoConvite"
                        value={formData.codigoConvite}
                        onChange={handleChange}
                        onBlur={handleValidateInvite}
                        placeholder="RADAR-XXXXXX-XXXXXX"
                        className={`w-full pl-12 pr-12 py-4 bg-slate-900/50 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-mono ${
                          inviteValid === true
                            ? 'border-emerald-500 focus:border-emerald-400 shadow-lg shadow-emerald-500/20'
                            : inviteValid === false
                            ? 'border-red-500 focus:border-red-400'
                            : 'border-slate-700 focus:border-emerald-500'
                        }`}
                        required
                      />
                      {inviteChecking ? (
                        <div className="absolute right-4 w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : inviteValid === true ? (
                        <CheckCircleIcon className="absolute right-4 w-6 h-6 text-emerald-400" />
                      ) : inviteValid === false ? (
                        <XCircleIcon className="absolute right-4 w-6 h-6 text-red-400" />
                      ) : null}
                    </div>
                  </div>
                  {inviteValid === true && (
                    <p className="text-emerald-400 text-xs flex items-center gap-1.5 pl-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      Código válido e ativo
                    </p>
                  )}
                </div>
              )}

              {/* Name (Register only) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Nome completo
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center">
                      <UserIcon className="absolute left-4 w-5 h-5 text-emerald-400" />
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="O teu nome"
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <EnvelopeIcon className="absolute left-4 w-5 h-5 text-emerald-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <KeyIcon className="absolute left-4 w-5 h-5 text-emerald-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="relative overflow-hidden rounded-xl border border-red-500/50 bg-red-500/10 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent"></div>
                  <div className="relative p-4 flex items-start gap-3">
                    <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm flex-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (mode === 'register' && inviteValid !== true)}
                className="relative w-full group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 rounded-xl transition-all group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                <div className="relative px-6 py-4 flex items-center justify-center gap-3 text-white font-bold">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta'}</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="px-8 pb-8">
              <div className="pt-6 border-t border-slate-700/50 text-center">
                <p className="text-xs text-gray-500">
                  <ShieldCheckIcon className="w-4 h-4 inline mr-1.5" />
                  Sistema seguro com acesso por convite
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <p className="text-center text-gray-600 text-xs mt-6">
            © 2025 Dédalo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;