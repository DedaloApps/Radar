import { FileText, TrendingUp, Layers } from 'lucide-react';

const Stats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Documentos</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {stats.totalGeral || 0}
            </p>
          </div>
          <FileText size={48} className="text-indigo-600 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Hoje</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              {stats.documentosHoje || 0}
            </p>
          </div>
          <TrendingUp size={48} className="text-green-500 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Categorias</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              {stats.porCategoria?.length || 5}
            </p>
          </div>
          <Layers size={48} className="text-orange-500 opacity-20" />
        </div>
      </div>
    </div>
  );
};

export default Stats;