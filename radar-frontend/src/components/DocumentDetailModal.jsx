import { XMarkIcon, CalendarIcon, DocumentTextIcon, ArrowTopRightOnSquareIcon, HashtagIcon, UserIcon, MapPinIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getCategoriaInfo } from '../utils/categories';
import { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

const DocumentDetailModal = ({ document, onClose, onBack }) => {
  const info = getCategoriaInfo(document.categoria);
  const Icon = info.icon;
  const { marcarComoLido } = useUser();

  useEffect(() => {
    if (document?.id) {
      marcarComoLido(document.id);
    }
  }, [document?.id, marcarComoLido]);
  
  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Metadados disponíveis
  const metadados = [
    { label: 'Data', value: formatDate(document.data_publicacao || document.created_at), icon: CalendarIcon, show: true },
    { label: 'Tipo', value: document.tipo_conteudo, icon: DocumentTextIcon, show: document.tipo_conteudo },
    { label: 'Número', value: document.numero, icon: HashtagIcon, show: document.numero },
    { label: 'Autores', value: document.autores, icon: UserIcon, show: document.autores },
    { label: 'Estado', value: document.estado, icon: ClockIcon, show: document.estado },
    { label: 'Hora', value: document.hora, icon: ClockIcon, show: document.hora },
    { label: 'Local', value: document.local_evento, icon: MapPinIcon, show: document.local_evento }
  ].filter(m => m.show);

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Minimalista */}
        <div className="relative border-b border-slate-700 bg-slate-900 flex-shrink-0">
          <div className="p-6 pr-16 pl-16">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-slate-800 rounded-xl">
                <Icon className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  {info.nomeCompleto || info.nome}
                </div>
                <h2 className="text-lg font-bold text-white line-clamp-2">
                  {document.titulo}
                </h2>
              </div>
            </div>
          </div>
          
          {/* Botão Voltar (à esquerda) */}
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-6 left-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 group"
              title="Voltar à categoria"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}

          {/* Botão Fechar (à direita) */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Scrollable */}
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 #1e293b' }}>
          
          {/* Grid de Metadados */}
          {metadados.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {metadados.map((meta, index) => {
                const MetaIcon = meta.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="p-2 bg-slate-700 rounded-lg flex-shrink-0">
                      <MetaIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500 font-medium mb-0.5">
                        {meta.label}
                      </div>
                      <div className="text-sm text-white font-medium line-clamp-2">
                        {meta.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Entidades (se existir) */}
          {document.entidades && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-400 mb-2">
                Entidades
              </h4>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {document.entidades}
                </p>
              </div>
            </div>
          )}

          {/* Resumo */}
          {document.resumo && document.resumo !== document.titulo && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-400 mb-2">
                Resumo
              </h4>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {document.resumo}
                </p>
              </div>
            </div>
          )}

          {/* Conteúdo Completo */}
          {document.conteudo && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-400 mb-2">
                Conteúdo Completo
              </h4>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 #1e293b' }}>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {document.conteudo}
                </p>
              </div>
            </div>
          )}

          {/* Info Adicional */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              Fonte: <span className="text-slate-400 font-medium">{document.fonte === 'parlamento' ? 'Parlamento Português' : 'Diário da República'}</span>
            </p>
          </div>
        </div>

        {/* Footer com Ação */}
        <div className="border-t border-slate-700 bg-slate-900 p-4 flex-shrink-0">
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors group"
          >
            <span>Ver Documento Original</span>
            <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailModal;