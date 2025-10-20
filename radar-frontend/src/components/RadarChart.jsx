import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORIAS } from '../utils/categories';

const RadarChartComponent = ({ stats }) => {
  // Preparar dados para o gráfico
  const data = stats.porCategoria?.map(cat => ({
    categoria: CATEGORIAS[cat._id]?.nome || cat._id,
    total: cat.total
  })) || [];

  // Se não houver dados, mostrar placeholder
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Radar por Categoria</h2>
        <div className="flex items-center justify-center h-64 text-gray-400">
          Sem dados disponíveis
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Radar por Categoria</h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="categoria" />
          <PolarRadiusAxis />
          <Radar
            name="Documentos"
            dataKey="total"
            stroke="#667eea"
            fill="#667eea"
            fillOpacity={0.6}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {Object.entries(CATEGORIAS).slice(0, 5).map(([key, info]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-2xl">{info.emoji}</span>
            <span className="text-sm text-gray-600">{info.nome}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadarChartComponent;