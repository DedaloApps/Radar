import {
  BellIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  StarIcon,
  BuildingLibraryIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';

const Header = ({
  ultimaAtualizacao,
  notificationEnabled,
  onToggleNotifications,
  onRefresh,
  onOpenConfig,
  onOpenAdmin,
  onOpenFavorites,
  isRefreshing,
  favoritesEnabled,
  tipoRadar,
  onToggleTipoRadar
}) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* Glow effect - AZUL */}
            <div className="absolute inset-0 rounded-xl blur-xl opacity-60 animate-pulse"
                 style={{ background: 'linear-gradient(to bottom right, #27aae2, #1e88b5)' }}></div>
            <div className="relative">
              <img 
                src="/dedalo.png" 
                alt="Dédalo Logo" 
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>
          
          <div>
            {/* Título com gradiente AZUL/CYAN */}
            <h1 className="text-3xl font-black bg-clip-text text-transparent drop-shadow-lg"
                style={{ 
                  backgroundImage: 'linear-gradient(to right, #7dd3fc, #27aae2, #06b6d4)'
                }}>
              RADAR LEGISLATIVO
            </h1>
            <p className="text-sm font-semibold tracking-wide"
               style={{ color: '#27aae2' }}>
              Olá, {user?.nome || 'Utilizador'} 👋
            </p>
          </div>
        </div>

        {/* Controles à direita */}
        <div className="flex items-center gap-3">
          {/* Status - AZUL */}
          {ultimaAtualizacao && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm"
                 style={{ 
                   backgroundColor: 'rgba(39, 170, 226, 0.1)',
                   borderColor: 'rgba(39, 170, 226, 0.3)'
                 }}>
              <div className="w-2 h-2 rounded-full animate-pulse shadow-lg"
                   style={{ 
                     backgroundColor: '#27aae2',
                     boxShadow: '0 0 10px #27aae2'
                   }}></div>
              <span className="text-xs font-semibold"
                    style={{ color: '#7dd3fc' }}>
                Atualizado {new Date(ultimaAtualizacao).toLocaleTimeString('pt-PT')}
              </span>
            </div>
          )}

          {/* Botão Admin (só para admins) - AMARELO (mantém) */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-3 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl border border-yellow-500/30 transition-all backdrop-blur-sm hover:shadow-lg hover:shadow-yellow-500/20"
              title="Admin Dashboard"
            >
              <ShieldCheckIcon className="w-5 h-5 text-yellow-400" />
            </button>
          )}

          {/* Toggle Parlamento/Stakeholders - AZUL */}
          {onToggleTipoRadar && (
            <div className="hidden md:flex items-center gap-1 rounded-xl border backdrop-blur-sm p-1"
                 style={{
                   backgroundColor: 'rgba(39, 170, 226, 0.1)',
                   borderColor: 'rgba(39, 170, 226, 0.3)'
                 }}>
              <button
                onClick={() => onToggleTipoRadar('parlamento')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  tipoRadar === 'parlamento'
                    ? 'shadow-lg'
                    : 'hover:bg-white/5'
                }`}
                style={tipoRadar === 'parlamento' ? {
                  backgroundColor: '#27aae2',
                  color: '#ffffff'
                } : {
                  color: '#7dd3fc'
                }}
                title="Parlamento"
              >
                <BuildingLibraryIcon className="w-4 h-4" />
                <span className="text-xs font-semibold">Parlamento</span>
              </button>
              <button
                onClick={() => onToggleTipoRadar('stakeholders')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  tipoRadar === 'stakeholders'
                    ? 'shadow-lg'
                    : 'hover:bg-white/5'
                }`}
                style={tipoRadar === 'stakeholders' ? {
                  backgroundColor: '#27aae2',
                  color: '#ffffff'
                } : {
                  color: '#7dd3fc'
                }}
                title="Stakeholders"
              >
                <UserGroupIcon className="w-4 h-4" />
                <span className="text-xs font-semibold">Stakeholders</span>
              </button>
            </div>
          )}

          {/* Botão Refresh - AZUL */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-3 rounded-xl border transition-all group backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(39, 170, 226, 0.1)',
              borderColor: 'rgba(39, 170, 226, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(39, 170, 226, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(39, 170, 226, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(39, 170, 226, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Atualizar dados"
          >
            <ArrowPathIcon 
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
              style={{ color: '#7dd3fc' }}
            />
          </button>

          {/* Botão Pesquisa - AZUL */}
          

          {/* Botão Notificações - AZUL */}
          <button
            onClick={onToggleNotifications}
            className={`p-3 rounded-xl border transition-all backdrop-blur-sm`}
            style={notificationEnabled ? {
              backgroundColor: 'rgba(39, 170, 226, 0.2)',
              borderColor: 'rgba(39, 170, 226, 0.5)',
              boxShadow: '0 0 30px rgba(39, 170, 226, 0.3)'
            } : {
              backgroundColor: 'rgba(39, 170, 226, 0.1)',
              borderColor: 'rgba(39, 170, 226, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!notificationEnabled) {
                e.currentTarget.style.backgroundColor = 'rgba(39, 170, 226, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(39, 170, 226, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!notificationEnabled) {
                e.currentTarget.style.backgroundColor = 'rgba(39, 170, 226, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            title={notificationEnabled ? 'Notificações ativadas' : 'Ativar notificações'}
          >
            {notificationEnabled ? (
              <BellSolidIcon className="w-5 h-5 animate-pulse" style={{ color: '#7dd3fc' }} />
            ) : (
              <BellIcon className="w-5 h-5" style={{ color: '#7dd3fc' }} />
            )}
          </button>

          {/* Botão Favoritos - AMARELO (mantém) */}
          <button
            onClick={onOpenFavorites}
            className={`p-3 rounded-xl border transition-all backdrop-blur-sm ${
              favoritesEnabled
                ? 'bg-amber-500/20 border-amber-400/50 shadow-xl shadow-amber-500/30'
                : 'hover:shadow-lg hover:shadow-amber-500/20'
            }`}
            style={!favoritesEnabled ? {
              backgroundColor: 'rgba(39, 170, 226, 0.1)',
              borderColor: 'rgba(39, 170, 226, 0.3)'
            } : undefined}
            onMouseEnter={(e) => {
              if (!favoritesEnabled) {
                e.currentTarget.style.backgroundColor = 'rgba(39, 170, 226, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!favoritesEnabled) {
                e.currentTarget.style.backgroundColor = 'rgba(39, 170, 226, 0.1)';
              }
            }}
            title="Favoritos"
          >
            {favoritesEnabled ? (
              <StarSolidIcon className="w-5 h-5 text-amber-400" />
            ) : (
              <StarIcon className="w-5 h-5" style={{ color: '#7dd3fc' }} />
            )}
          </button>

          {/* Botão Configurações - AZUL */}
          <button 
            onClick={onOpenConfig}
            className="p-3 rounded-xl border transition-all backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(39, 170, 226, 0.1)',
              borderColor: 'rgba(39, 170, 226, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(39, 170, 226, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(39, 170, 226, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(39, 170, 226, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Cog6ToothIcon className="w-5 h-5" style={{ color: '#7dd3fc' }} />
          </button>

          {/* Botão Logout - VERMELHO (mantém) */}
          <button
            onClick={logout}
            className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/30 transition-all backdrop-blur-sm hover:shadow-lg hover:shadow-red-500/20"
            title="Sair"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;