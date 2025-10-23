import {
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  ArchiveBoxIcon,
  EyeSlashIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import { useUser } from "../contexts/UserContext";

const CategoryDocumentsModal = ({ category, onClose, onSelectDocument }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mostrarArquivados, setMostrarArquivados] = useState(false);

  const {
    foiLido,
    marcarComoLido,
    estaArquivado,
    arquivarDocumento,
    restaurarDocumento,
    toggleFavorito,
    eFavorito,
  } = useUser();

  const { id, info, docs } = category;
  const Icon = info.icon;

  // Tipos únicos presentes nos documentos desta categoria
  const tiposDisponiveis = useMemo(() => {
    const tipos = [
      ...new Set(docs.map((d) => d.tipo_conteudo).filter(Boolean)),
    ];
    return tipos;
  }, [docs]);

  // Filtrar e ordenar documentos
  const documentosFiltrados = useMemo(() => {
    let resultado = [...docs];

    // Filtrar arquivados
    if (!mostrarArquivados) {
      resultado = resultado.filter((doc) => !estaArquivado(doc.id));
    } else {
      resultado = resultado.filter((doc) => estaArquivado(doc.id));
    }

    if (searchTerm) {
      resultado = resultado.filter((doc) =>
        doc.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tipoFiltro !== "todos") {
      resultado = resultado.filter((doc) => doc.tipo_conteudo === tipoFiltro);
    }

    if (dataInicio) {
      resultado = resultado.filter((doc) => {
        const docDate = new Date(doc.data_publicacao);
        return docDate >= new Date(dataInicio);
      });
    }

    if (dataFim) {
      resultado = resultado.filter((doc) => {
        const docDate = new Date(doc.data_publicacao);
        return docDate <= new Date(dataFim);
      });
    }

    resultado.sort((a, b) => {
      const dateA = new Date(a.data_publicacao || a.created_at);
      const dateB = new Date(b.data_publicacao || b.created_at);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return resultado;
  }, [
    docs,
    searchTerm,
    sortOrder,
    tipoFiltro,
    dataInicio,
    dataFim,
    mostrarArquivados,
    estaArquivado,
  ]);

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Limpar filtros
  const limparFiltros = () => {
    setSearchTerm("");
    setSortOrder("desc");
    setTipoFiltro("todos");
    setDataInicio("");
    setDataFim("");
  };

  // Marcar todos como lidos
  const marcarTudoComoLido = () => {
    documentosFiltrados.forEach((doc) => {
      if (doc.id) {
        marcarComoLido(doc.id);
      }
    });
  };

  // Contar documentos não lidos e arquivados
  const naoLidos = docs.filter(
    (doc) => !foiLido(doc.id) && !estaArquivado(doc.id)
  ).length;
  const totalArquivados = docs.filter((doc) => estaArquivado(doc.id)).length;

  const filtrosAtivos =
    searchTerm || tipoFiltro !== "todos" || dataInicio || dataFim;

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
                <div className="p-2.5 bg-slate-800 rounded-xl">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {info.nomeCompleto || info.nome}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {documentosFiltrados.length} de{" "}
                    {docs.length - totalArquivados}{" "}
                    {documentosFiltrados.length === 1
                      ? "documento"
                      : "documentos"}
                    {naoLidos > 0 && !mostrarArquivados && (
                      <span className="ml-2 text-red-400">
                        • {naoLidos} {naoLidos === 1 ? "novo" : "novos"}
                      </span>
                    )}
                    {totalArquivados > 0 && (
                      <span className="ml-2 text-slate-500">
                        • {totalArquivados} arquivado
                        {totalArquivados !== 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center gap-2">
                {/* Toggle Arquivados */}
                {totalArquivados > 0 && (
                  <button
                    onClick={() => setMostrarArquivados(!mostrarArquivados)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                      mostrarArquivados
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                    }`}
                  >
                    <ArchiveBoxIcon className="w-4 h-4" />
                    {mostrarArquivados
                      ? "Ver Ativos"
                      : `Arquivados (${totalArquivados})`}
                  </button>
                )}

                {/* Marcar tudo lido */}
                {naoLidos > 0 && !mostrarArquivados && (
                  <button
                    onClick={marcarTudoComoLido}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-sm text-emerald-400 font-medium transition-all"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Marcar tudo lido
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros */}
        {!mostrarArquivados && (
          <div className="border-b border-slate-700 bg-slate-900/50 p-4 space-y-3 flex-shrink-0">
            {/* Linha 1: Search + Ordenação */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                title={
                  sortOrder === "desc"
                    ? "Mais recente primeiro"
                    : "Mais antigo primeiro"
                }
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {sortOrder === "desc" ? "Recente" : "Antigo"}
                </span>
              </button>
            </div>

            {/* Linha 2: Filtros Avançados */}
            <div className="flex flex-wrap gap-3">
              {tiposDisponiveis.length > 0 && (
                <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="todos">Todos os tipos</option>
                  {tiposDisponiveis.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </option>
                  ))}
                </select>
              )}

              {/* Data Início */}
              <div className="relative">
                <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-xs text-slate-500">
                  De
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Data Fim */}
              <div className="relative">
                <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-xs text-slate-500">
                  Até
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {filtrosAtivos && (
                <button
                  onClick={limparFiltros}
                  className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lista de Documentos */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 #1e293b" }}
        >
          {documentosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              {mostrarArquivados ? (
                <ArchiveBoxIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              ) : (
                <FunnelIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              )}
              <p className="text-slate-500 text-sm">
                {mostrarArquivados
                  ? "Nenhum documento arquivado"
                  : filtrosAtivos
                  ? "Nenhum documento encontrado com estes filtros"
                  : "Sem documentos"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {documentosFiltrados.map((doc, index) => {
                const isNew = !foiLido(doc.id);
                const isArchived = estaArquivado(doc.id);

                return (
                  <div
                    key={index}
                    className="group relative hover:bg-slate-800/50 transition-colors"
                  >
                    <button
                      onClick={() => onSelectDocument(doc)}
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
                          {isNew && !isArchived && (
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse"></div>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {formatDate(doc.data_publicacao || doc.createdAt)}
                          </span>
                          {doc.tipo_conteudo && (
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                              {doc.tipo_conteudo}
                            </span>
                          )}
                          {doc.numero && (
                            <span className="text-slate-600">
                              Nº {doc.numero}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Botões Favorito + Arquivar/Restaurar */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {/* Botão Favorito */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorito(doc.id);
                        }}
                        className={`p-2 rounded-lg transition-all ${
                          eFavorito(doc.id)
                            ? "bg-amber-500/20 hover:bg-amber-500/30"
                            : "bg-slate-800 hover:bg-slate-700"
                        }`}
                        title={
                          eFavorito(doc.id)
                            ? "Remover dos favoritos"
                            : "Adicionar aos favoritos"
                        }
                      >
                        <StarIcon
                          className={`w-4 h-4 ${
                            eFavorito(doc.id)
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-400"
                          }`}
                        />
                      </button>

                      {/* Botão Arquivar/Restaurar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isArchived) {
                            restaurarDocumento(doc.id);
                          } else {
                            arquivarDocumento(doc.id);
                          }
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                        title={isArchived ? "Restaurar" : "Arquivar"}
                      >
                        {isArchived ? (
                          <EyeSlashIcon className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArchiveBoxIcon className="w-4 h-4 text-slate-400 hover:text-red-400" />
                        )}
                      </button>
                    </div>
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

export default CategoryDocumentsModal;
