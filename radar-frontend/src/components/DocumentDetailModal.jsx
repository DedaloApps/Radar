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
        className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0f172a',
          borderColor: 'rgba(100, 116, 139, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - ROXO/AZUL */}
        <div className="relative border-b flex-shrink-0"
             style={{
               backgroundColor: 'rgba(38, 34, 97, 0.5)',
               borderColor: 'rgba(100, 116, 139, 0.5)'
             }}>
          <div className="p-6 pr-16 pl-16">
            <div className="flex items-center gap-4 mb-3">
              {/* Ícone - AZUL */}
              <div className="p-3 rounded-xl"
                   style={{ backgroundColor: 'rgba(38, 34, 97, 0.8)' }}>
                <Icon className="w-6 h-6" style={{ color: '#27aae2' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium uppercase tracking-wider mb-1"
                     style={{ color: '#7dd3fc' }}>
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
          
          {/* Grid de Metadados - AZUL */}
          {metadados.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {metadados.map((meta, index) => {
                const MetaIcon = meta.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      borderColor: 'rgba(100, 116, 139, 0.5)'
                    }}
                  >
                    {/* Ícone dos metadados - AZUL */}
                    <div className="p-2 rounded-lg flex-shrink-0"
                         style={{ backgroundColor: 'rgba(38, 34, 97, 0.5)' }}>
                      <MetaIcon className="w-4 h-4" style={{ color: '#7dd3fc' }} />
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

          {/* Entidades */}
          {document.entidades && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2"
                  style={{ color: '#7dd3fc' }}>
                Entidades
              </h4>
              <div className="p-4 rounded-lg border"
                   style={{
                     backgroundColor: 'rgba(30, 41, 59, 0.5)',
                     borderColor: 'rgba(100, 116, 139, 0.5)'
                   }}>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {document.entidades}
                </p>
              </div>
            </div>
          )}

          {/* Resumo */}
          {document.resumo && document.resumo !== document.titulo && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2"
                  style={{ color: '#7dd3fc' }}>
                Resumo
              </h4>
              <div className="p-4 rounded-lg border"
                   style={{
                     backgroundColor: 'rgba(30, 41, 59, 0.5)',
                     borderColor: 'rgba(100, 116, 139, 0.5)'
                   }}>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {document.resumo}
                </p>
              </div>
            </div>
          )}

          {/* Conteúdo Completo */}
          {document.conteudo && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2"
                  style={{ color: '#7dd3fc' }}>
                Conteúdo Completo
              </h4>
              <div className="p-4 rounded-lg border max-h-80 overflow-y-auto" 
                   style={{ 
                     backgroundColor: 'rgba(30, 41, 59, 0.5)',
                     borderColor: 'rgba(100, 116, 139, 0.5)',
                     scrollbarWidth: 'thin', 
                     scrollbarColor: '#334155 #1e293b' 
                   }}>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {document.conteudo}
                </p>
              </div>
            </div>
          )}

          {/* Info Adicional */}
          <div className="p-3 rounded-lg border"
               style={{
                 backgroundColor: 'rgba(38, 34, 97, 0.3)',
                 borderColor: 'rgba(100, 116, 139, 0.3)'
               }}>
            <p className="text-xs text-slate-500 text-center">
              Fonte: <span className="text-slate-400 font-medium">{document.fonte === 'parlamento' ? 'Parlamento Português' : 'Diário da República'}</span>
            </p>
          </div>
        </div>

        {/* Footer com Ação - AZUL */}
        <div className="border-t p-4 flex-shrink-0"
             style={{
               backgroundColor: 'rgba(38, 34, 97, 0.5)',
               borderColor: 'rgba(100, 116, 139, 0.5)'
             }}>
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 text-white font-semibold rounded-lg transition-all group"
            style={{ backgroundColor: '#27aae2' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e88b5';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(39, 170, 226, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#27aae2';
              e.currentTarget.style.boxShadow = 'none';
            }}
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