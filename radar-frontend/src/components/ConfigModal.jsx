import { XMarkIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { COMISSOES, TIPOS_CONTEUDO } from '../utils/categories';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';
import {
  CalendarIcon,
  MicrophoneIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  DocumentIcon,
  QuestionMarkCircleIcon,
  DocumentMagnifyingGlassIcon,
  HandRaisedIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

const TIPO_ICONS = {
  agenda: CalendarIcon,
  audicao: MicrophoneIcon,
  audiencia: UserGroupIcon,
  iniciativa: DocumentTextIcon,
  peticao: PencilSquareIcon,
  geral: DocumentIcon,
  pergunta: QuestionMarkCircleIcon,
  requerimento: DocumentMagnifyingGlassIcon,
  votacao: HandRaisedIcon,
  sumula: DocumentChartBarIcon,
};

const ConfigModal = ({ isOpen, onClose }) => {
  const { 
    categoriasFavoritas, 
    toggleCategoria, 
    tiposConteudoVisiveis, 
    toggleTipoConteudo,
    resetarPreferencias 
  } = useUser();

  const [activeTab, setActiveTab] = useState('comissoes');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const comissoesFiltradas = Object.entries(COMISSOES).filter(([id, info]) =>
    info.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    info.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl border overflow-hidden"
        style={{
          backgroundColor: '#0f172a',
          borderColor: 'rgba(100, 116, 139, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b"
             style={{
               backgroundColor: 'rgba(38, 34, 97, 0.5)',
               borderColor: 'rgba(100, 116, 139, 0.5)'
             }}>
          <div className="p-6 pr-16">
            <h2 className="text-2xl font-bold text-white mb-1">
              Preferências
            </h2>
            <p className="text-sm" style={{ color: '#7dd3fc' }}>
              Configura o que queres ver no radar
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b"
             style={{
               backgroundColor: 'rgba(38, 34, 97, 0.3)',
               borderColor: 'rgba(100, 116, 139, 0.5)'
             }}>
          <button
            onClick={() => setActiveTab('comissoes')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'comissoes' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Comissões
            {activeTab === 'comissoes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                   style={{ backgroundColor: '#27aae2' }}></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('conteudos')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'conteudos' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Tipos de Conteúdo
            {activeTab === 'conteudos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                   style={{ backgroundColor: '#27aae2' }}></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-220px)]" 
             style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 #1e293b' }}>
          
          {activeTab === 'comissoes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex-1 relative max-w-sm">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    onFocus={(e) => e.target.style.borderColor = '#27aae2'}
                    onBlur={(e) => e.target.style.borderColor = 'rgb(51, 65, 85)'}
                  />
                </div>
                
                <div className="text-sm text-slate-400">
                  <span className="text-white font-medium">{categoriasFavoritas.length}</span> / {Object.keys(COMISSOES).length}
                </div>
              </div>

              <div className="space-y-2">
                {comissoesFiltradas.map(([id, info]) => {
                  const Icon = info.icon;
                  const isSelected = categoriasFavoritas.includes(id);

                  return (
                    <button
                      key={id}
                      onClick={() => toggleCategoria(id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        isSelected ? 'hover:opacity-90' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                      style={isSelected ? {
                        backgroundColor: 'rgba(39, 170, 226, 0.1)',
                        borderColor: 'rgba(39, 170, 226, 0.5)'
                      } : {}}
                    >
                      <div className="p-2 rounded-lg"
                           style={isSelected ? {
                             backgroundColor: 'rgba(39, 170, 226, 0.2)'
                           } : { backgroundColor: 'rgb(51, 65, 85)' }}>
                        <Icon className="w-5 h-5" style={{ color: isSelected ? '#27aae2' : '#94a3b8' }} />
                      </div>

                      <div className="flex-1 text-left">
                        <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {info.numero} {info.nome}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {info.nomeCompleto}
                        </div>
                      </div>

                      <div className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                           style={isSelected ? {
                             backgroundColor: '#27aae2',
                             borderColor: '#27aae2'
                           } : { borderColor: 'rgb(75, 85, 99)' }}>
                        {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {comissoesFiltradas.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Nenhuma comissão encontrada
                </div>
              )}
            </div>
          )}

          {activeTab === 'conteudos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    Tipos de Documentos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Seleciona os conteúdos a visualizar
                  </p>
                </div>
                
                <div className="text-sm text-slate-400">
                  <span className="text-white font-medium">{tiposConteudoVisiveis.length}</span> / {Object.keys(TIPOS_CONTEUDO).length}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(TIPOS_CONTEUDO).map(([tipo, info]) => {
                  const isSelected = tiposConteudoVisiveis.includes(tipo);
                  const IconComponent = TIPO_ICONS[tipo] || DocumentIcon;

                  return (
                    <button
                      key={tipo}
                      onClick={() => toggleTipoConteudo(tipo)}
                      className={`relative p-4 rounded-lg border transition-all ${
                        isSelected ? '' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                      style={isSelected ? {
                        backgroundColor: 'rgba(39, 170, 226, 0.1)',
                        borderColor: 'rgba(39, 170, 226, 0.5)'
                      } : {}}
                    >
                      <div className="absolute top-3 right-3 w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                           style={isSelected ? {
                             backgroundColor: '#27aae2',
                             borderColor: '#27aae2'
                           } : { borderColor: 'rgb(75, 85, 99)' }}>
                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                      </div>

                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                           style={isSelected ? {
                             backgroundColor: 'rgba(39, 170, 226, 0.2)'
                           } : { backgroundColor: 'rgb(51, 65, 85)' }}>
                        <IconComponent className="w-5 h-5" style={{ color: isSelected ? '#27aae2' : '#94a3b8' }} />
                      </div>

                      <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {info.nome}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4"
             style={{
               backgroundColor: 'rgba(38, 34, 97, 0.5)',
               borderColor: 'rgba(100, 116, 139, 0.5)'
             }}>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={resetarPreferencias}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Restaurar
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2 text-white text-sm font-medium rounded-lg transition-all"
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
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;