import { 
  BellIcon, 
  ArrowPathIcon, 
  Cog6ToothIcon,
  ShieldCheckIcon,
  StarIcon 
} from '@heroicons/react/24/outline';

const Header = ({
  ultimaAtualizacao,
  notificationEnabled,
  onToggleNotifications,
  onRefresh,
  onOpenConfig,
  onOpenAdmin,
  isRefreshing,
  documentosFavoritos,
  onOpenFavoritos,
}) => {
  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center justify-between">
      {/* Logo e Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-black text-xl">R</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">
              Radar Legislativo
            </h1>
            <p className="text-slate-400 text-xs">
              Última atualização: {formatTime(ultimaAtualizacao)}
            </p>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-3">
        {/* Notificações */}
        <button
          onClick={onToggleNotifications}
          className={`p-3 rounded-xl transition-all ${
            notificationEnabled
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
          title="Notificações"
        >
          <BellIcon className="w-6 h-6" />
        </button>

        {/* Favoritos */}
        <button
          onClick={onOpenFavoritos}
          className="relative p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all group"
          title="Favoritos"
        >
          <StarIcon className="w-6 h-6 text-amber-400" />
          {documentosFavoritos && documentosFavoritos.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {documentosFavoritos.length > 99 ? '99+' : documentosFavoritos.length}
            </div>
          )}
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
          title="Atualizar"
        >
          <ArrowPathIcon
            className={`w-6 h-6 text-slate-300 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          />
        </button>

        {/* Configurações */}
        <button
          onClick={onOpenConfig}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          title="Configurações"
        >
          <Cog6ToothIcon className="w-6 h-6 text-slate-300" />
        </button>

        {/* Admin (se disponível) */}
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-all"
            title="Admin"
          >
            <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;