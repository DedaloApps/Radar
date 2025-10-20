import { ExternalLink, Calendar, FileText } from 'lucide-react';
import { getCategoriaInfo, formatDate, getFonteNome } from '../utils/categories';

const DocumentCard = ({ document }) => {
  const categoriaInfo = getCategoriaInfo(document.categoria);

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 ${categoriaInfo.borderCor}`}>
      {/* Header do Card */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex-1">
          {document.titulo}
        </h3>
        <span className={`${categoriaInfo.cor} text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap`}>
          {categoriaInfo.emoji} {categoriaInfo.nome.toUpperCase()}
        </span>
      </div>

      {/* Metadados */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDate(document.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={16} />
          <span>{getFonteNome(document.fonte)}</span>
        </div>
      </div>

      {/* Resumo */}
      {document.resumo && (
        <p className="text-gray-700 mb-4 line-clamp-3">
          {document.resumo}
        </p>
      )}

      {/* Link */}
      
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
      >
        Ver Documento Completo
        <ExternalLink size={16} />
      </a>
    </div>
  );
};

export default DocumentCard;