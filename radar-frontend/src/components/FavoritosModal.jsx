import {
  XMarkIcon,
  CalendarIcon,
  DocumentTextIcon,
  StarIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { useUser } from "../contexts/UserContext";
import { getCategoriaInfo } from "../utils/categories";

const FavoritosModal = ({ onClose, onSelectDocument, allDocuments }) => {
  const { documentosFavoritos, removerFavorito, limparFavoritos } = useUser();

  // Filtrar apenas documentos favoritos
  const documentosFavoritosList = useMemo(() => {
    return allDocuments.filter(doc => documentosFavoritos.includes(doc.id));
  }, [allDocuments, documentosFavoritos]);

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-slate-700 bg-slate-900 flex-shrink-0">
          <div className="p-6 pr-16">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-amber-500/20 rounded-xl">
                  <StarIcon className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Documentos Favoritos
                  </h2>
                  <p className="text-sm text-slate-400">
                    {documentosFavoritosList.length}{" "}
                    {documentosFavoritosList.length === 1 ? "documento" : "documentos"}
                  </p>
                </div>
              </div>

              {/* Botão Limpar Favoritos */}
              {documentosFavoritosList.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Remover todos os documentos dos favoritos?')) {
                      limparFavoritos();
                    }
                  }}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
                >
                  Limpar tudo
                </button>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Documentos */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 #1e293b" }}
        >
          {documentosFavoritosList.length === 0 ? (
            <div className="text-center py-12">
              <StarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                Nenhum documento nos favoritos
              </p>
              <p className="text-slate-600 text-xs mt-2">
                Clica na estrela ao lado dos documentos para adicionar aos favoritos
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {documentosFavoritosList.map((doc, index) => {
                const categoryInfo = getCategoriaInfo(doc.categoria);
                const CategoryIcon = categoryInfo.icon;

                return (
                  <div
                    key={index}
                    className="group relative hover:bg-slate-800/50 transition-colors"
                  >
                    <button
                      onClick={() => {
                        onSelectDocument(doc);
                        onClose();
                      }}
                      className="w-full p-4 text-left flex items-start gap-3"
                    >
                      {/* Icon */}
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors flex-shrink-0">
                        <DocumentTextIcon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-medium text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-2 flex-1">
                            {doc.titulo}
                          </h3>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CategoryIcon className="w-3.5 h-3.5" />
                            {categoryInfo.nome}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {formatDate(doc.data_publicacao || doc.createdAt)}
                          </span>
                          {doc.tipo_conteudo && (
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                              {doc.tipo_conteudo}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Botão Remover Favorito */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removerFavorito(doc.id);
                      }}
                      className="absolute top-4 right-4 p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Remover dos favoritos"
                    >
                      <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritosModal;