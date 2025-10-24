// src/components/RadarNavigation.jsx
import { RADARS_CONFIG } from '../utils/radars';

const RadarNavigation = ({ activeRadar, onChange }) => {
  const radares = Object.values(RADARS_CONFIG);

  return (
    <div className="flex items-center gap-2">
      {radares.map((radar) => {
        const Icon = radar.icon;
        const isActive = activeRadar === radar.id;

        return (
          <button
            key={radar.id}
            onClick={() => onChange(radar.id)}
            className={`relative px-6 py-3 rounded-xl border-2 transition-all duration-300 group ${
              isActive
                ? 'scale-105 shadow-lg'
                : 'hover:scale-105 opacity-70 hover:opacity-100'
            }`}
            style={isActive ? {
              backgroundColor: `${radar.cores.primaria}40`,
              borderColor: radar.cores.secundaria,
              boxShadow: `0 0 30px ${radar.cores.secundaria}40`
            } : {
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              borderColor: 'rgba(100, 116, 139, 0.5)'
            }}
          >
            <div 
              className={`absolute inset-0 rounded-xl blur-xl transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
              }`}
              style={{ backgroundColor: `${radar.cores.secundaria}20` }}
            />

            <div className="relative flex items-center gap-3">
              <div 
                className={`p-2 rounded-lg transition-all ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`}
                style={isActive ? {
                  backgroundColor: `${radar.cores.secundaria}20`
                } : {
                  backgroundColor: 'rgba(51, 65, 85, 0.5)'
                }}
              >
                <Icon 
                  className="w-5 h-5 transition-colors" 
                  style={{ color: isActive ? radar.cores.secundaria : '#94a3b8' }}
                />
              </div>

              <div className="text-left">
                <div 
                  className={`text-sm font-bold transition-colors ${
                    isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {radar.nome}
                </div>
                <div className="text-xs text-slate-500">
                  {radar.nomeCompleto}
                </div>
              </div>

              {isActive && (
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: radar.cores.secundaria }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RadarNavigation;