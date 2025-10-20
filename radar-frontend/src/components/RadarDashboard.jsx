import { useState, useEffect } from 'react';
import { Bell, TrendingUp, AlertCircle } from 'lucide-react';
import { CATEGORIAS } from '../utils/categories';

const RadarDashboard = ({ stats, documents }) => {
  const [pulsingCategories, setPulsingCategories] = useState(new Set());

  // Detectar novas atualizações
  useEffect(() => {
    const recent = documents.filter(doc => {
      const diff = Date.now() - new Date(doc.createdAt).getTime();
      return diff < 5 * 60 * 1000; // Últimos 5 minutos
    });

    const newCategories = new Set(recent.map(d => d.categoria));
    setPulsingCategories(newCategories);
  }, [documents]);

  // Calcular dados para cada categoria
  const getCategoryData = (categoria) => {
    const stat = stats.porCategoria?.find(s => s._id === categoria);
    return stat?.total || 0;
  };

  // Calcular ângulo para cada categoria (360° / 5 categorias = 72° cada)
  const categoriasList = ['saude', 'ambiente', 'economia', 'trabalho', 'financas'];
  const angleStep = 360 / categoriasList.length;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <span className="animate-pulse">📡</span>
            Radar Legislativo
            <span className="animate-pulse">📡</span>
          </h2>
          <p className="text-purple-200">Monitorização em Tempo Real</p>
        </div>

        {/* Radar Circular */}
        <div className="relative mx-auto" style={{ width: '600px', height: '600px' }}>
          {/* Círculos concêntricos */}
          <svg className="absolute inset-0" width="600" height="600">
            {/* Grid circular */}
            {[150, 200, 250].map((radius, i) => (
              <circle
                key={i}
                cx="300"
                cy="300"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            ))}

            {/* Linhas radiais */}
            {categoriasList.map((_, index) => {
              const angle = (angleStep * index - 90) * (Math.PI / 180);
              const x = 300 + Math.cos(angle) * 250;
              const y = 300 + Math.sin(angle) * 250;
              return (
                <line
                  key={index}
                  x1="300"
                  y1="300"
                  x2={x}
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Área do radar - preenchimento */}
            <polygon
              points={categoriasList.map((cat, index) => {
                const angle = (angleStep * index - 90) * (Math.PI / 180);
                const value = getCategoryData(cat);
                const maxValue = Math.max(...stats.porCategoria?.map(s => s.total) || [1]);
                const normalizedValue = (value / maxValue) * 200 + 50;
                const x = 300 + Math.cos(angle) * normalizedValue;
                const y = 300 + Math.sin(angle) * normalizedValue;
                return `${x},${y}`;
              }).join(' ')}
              fill="rgba(139, 92, 246, 0.3)"
              stroke="rgba(139, 92, 246, 0.8)"
              strokeWidth="3"
            />
          </svg>

          {/* Categorias nos cantos */}
          {categoriasList.map((categoria, index) => {
            const angle = (angleStep * index - 90) * (Math.PI / 180);
            const radius = 280;
            const x = 300 + Math.cos(angle) * radius;
            const y = 300 + Math.sin(angle) * radius;
            const info = CATEGORIAS[categoria];
            const total = getCategoryData(categoria);
            const isPulsing = pulsingCategories.has(categoria);

            return (
              <div
                key={categoria}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                }}
              >
                <div
                  className={`relative bg-white rounded-2xl shadow-2xl p-4 min-w-[140px] transition-all duration-300 hover:scale-110 ${
                    isPulsing ? 'animate-pulse ring-4 ring-yellow-400' : ''
                  }`}
                >
                  {/* Indicador de novidade */}
                  {isPulsing && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                      NOVO!
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-4xl mb-2">{info.emoji}</div>
                    <div className="font-bold text-gray-800 text-sm mb-1">
                      {info.nome}
                    </div>
                    <div className={`text-2xl font-bold ${info.textCor}`}>
                      {total}
                    </div>
                    <div className="text-xs text-gray-500">documentos</div>
                  </div>

                  {/* Barra de atividade */}
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${info.cor} transition-all duration-500`}
                      style={{
                        width: `${Math.min((total / (stats.totalGeral || 1)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Centro - Stats Gerais */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl p-8"
            style={{ left: '300px', top: '300px', width: '120px', height: '120px' }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-3xl font-bold">{stats.totalGeral}</div>
              <div className="text-xs text-purple-200">Total</div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <TrendingUp size={12} />
                <span>{stats.documentosHoje} hoje</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas Ativos */}
        {pulsingCategories.size > 0 && (
          <div className="mt-8 bg-yellow-500 bg-opacity-20 border-2 border-yellow-500 rounded-xl p-4">
            <div className="flex items-center gap-3 text-yellow-100">
              <Bell size={24} className="animate-bounce" />
              <div>
                <div className="font-bold">Novas atualizações detetadas!</div>
                <div className="text-sm">
                  {Array.from(pulsingCategories).map(cat => CATEGORIAS[cat].nome).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadarDashboard;