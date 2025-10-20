import { Loader2, AlertCircle } from 'lucide-react';
import DocumentCard from './DocumentCard';

const DocumentList = ({ documents, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
        <p className="text-gray-600">Carregando documentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="text-red-600" size={24} />
        <div>
          <h3 className="text-red-800 font-bold">Erro ao carregar documentos</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">📭 Nenhum documento encontrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📄 Documentos Recentes ({documents.length})
      </h2>
      
      <div className="space-y-4">
        {documents.map((doc) => (
          <DocumentCard key={doc._id} document={doc} />
        ))}
      </div>
    </div>
  );
};

export default DocumentList;