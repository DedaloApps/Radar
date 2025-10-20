import { Search } from 'lucide-react';
import { CATEGORIAS } from '../utils/categories';

const Filters = ({ selectedCategoria, onCategoriaChange, searchQuery, onSearchChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🔍 Filtros</h2>
      
      {/* Filtros por Categoria */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => onCategoriaChange('todas')}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            selectedCategoria === 'todas'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        
        {Object.entries(CATEGORIAS).slice(0, 5).map(([key, info]) => (
          <button
            key={key}
            onClick={() => onCategoriaChange(key)}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              selectedCategoria === key
                ? `${info.cor} text-white shadow-lg`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {info.emoji} {info.nome}
          </button>
        ))}
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔎 Pesquisar documentos..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
};

export default Filters;