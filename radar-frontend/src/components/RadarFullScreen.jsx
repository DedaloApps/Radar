import { useState } from "react";
import { getCategoriaInfo } from "../utils/categories";
import { getCategorias } from "../utils/radars"; // ← NOVO
import { BoltIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useUser } from "../contexts/UserContext";
import { useRadar } from "../contexts/Radarcontext"; // ← NOVO
import DocumentDetailModal from "./DocumentDetailModal";
import CategoryDocumentsModal from "./CategoryDocumentsModal";

const RadarFullScreen = ({ stats, documents }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { categoriasFavoritas, tiposConteudoVisiveis, foiLido, estaArquivado } = useUser();
  const { radarAtivo } = useRadar(); // ← NOVO

  // Obter categorias do radar ativo ← NOVO
  const categoriasDoRadar = getCategorias(radarAtivo);

  // Filtrar apenas categorias favoritas que existem no radar atual
  const categoriasList = categoriasFavoritas.filter(cat => 
    Object.keys(categoriasDoRadar).includes(cat)
  );
  const angleStep = 360 / categoriasList.length;

  // Filtrar documentos por tipo de conteúdo visível
  const documentosFiltrados = documents.filter((doc) =>
    tiposConteudoVisiveis.includes(doc.tipo_conteudo || "geral")
  );

  const getCategoryData = (categoria) => {
    const stat = stats.porCategoria?.find((s) => s._id === categoria);
    const total = stat?.total || 0;
    const categoryDocs = documentosFiltrados.filter(
      (d) => d.categoria === categoria
    );
    // ✅ NOVO: Contar apenas documentos não arquivados
    const activeCount = categoryDocs.filter((doc) => !estaArquivado(doc.id)).length;
    return { total, documents: categoryDocs, activeCount };
  };

  const maxValue = Math.max(
    ...(stats.porCategoria?.map((s) => s.total) || [1]),
    1
  );

  // Função para voltar do documento para a categoria
  const handleBackToCategory = () => {
    setSelectedDocument(null);
    // selectedCategory já está definido, então o modal reaparece
  };

  return (
    <>
      {/* FUNDO COMPLETO - Tech Grid */}
      <div className="absolute inset-0 tech-grid"></div>

      {/* Efeito de varredura do radar - CENTRO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="absolute w-[80vmin] h-[80vmin] rounded-full animate-radar-sweep"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(16, 185, 129, 0.15) 45deg, transparent 90deg)",
          }}
        ></div>
      </div>

      {/* SVG do Radar - CÍRCULOS E LINHAS */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <radialGradient id="radarGradient">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </radialGradient>
        </defs>

        {/* Pulso central */}
        <circle cx="50%" cy="50%" r="10" fill="rgba(16, 185, 129, 0.3)">
          <animate
            attributeName="r"
            from="10"
            to="50"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.6"
            to="0"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Círculos concêntricos */}
        {[15, 25, 35, 45].map((percent, i) => (
          <circle
            key={i}
            cx="50%"
            cy="50%"
            r={`${percent}%`}
            fill="none"
            stroke="rgba(16, 185, 129, 0.15)"
            strokeWidth="2"
            strokeDasharray="10,10"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="20"
              dur="5s"
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Linhas radiais */}
        {categoriasList.map((_, index) => {
          const angle = (angleStep * index - 90) * (Math.PI / 180);
          const x = `${50 + Math.cos(angle) * 35}%`;
          const y = `${50 + Math.sin(angle) * 35}%`;
          return (
            <line
              key={index}
              x1="50%"
              y1="50%"
              x2={x}
              y2={y}
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* CENTRO - Stats Totais */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>

          {/* Card */}
          <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-full p-10 border border-emerald-500/30 shadow-2xl w-40 h-40 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-1">
                {stats.totalGeral || 0}
              </div>
              <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                Total
              </div>
              {/* Documentos de Hoje - Elegante */}
              {stats.documentosHoje > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                      Hoje
                    </span>
                    <span className="text-xs font-bold text-white">
                      {stats.documentosHoje}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIAS - Cards Redesenhados: Ícone + Título */}
      {categoriasList.map((categoria, index) => {
        const angle = (angleStep * index - 90) * (Math.PI / 180);
        const info = categoriasDoRadar[categoria] || getCategoriaInfo(categoria, radarAtivo); // ← ATUALIZADO
        const { total, documents: categoryDocs, activeCount } = getCategoryData(categoria);
        const Icon = info.icon;

        const radius = 35;
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;

        const isHovered = hoveredCategory === categoria;
        const hasNew = categoryDocs.some((doc) => !foiLido(doc.id) && !estaArquivado(doc.id));

        return (
          <div
            key={categoria}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            onMouseEnter={() => setHoveredCategory(categoria)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <button
              onClick={() =>
                setSelectedCategory({ id: categoria, info, docs: categoryDocs })
              }
              className={`relative group transition-all duration-300 ${
                isHovered ? "scale-110" : ""
              }`}
            >
              {/* Glow on hover */}
              <div
                className={`absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl transition-opacity ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              ></div>

              {/* Card - NOVO LAYOUT COM NÚMERO */}
              <div
                className={`relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border transition-all ${
                  isHovered
                    ? "border-emerald-500/50 shadow-2xl shadow-emerald-500/20"
                    : "border-slate-700/50 shadow-xl"
                }`}
                style={{ width: "140px" }}
              >
                {/* Notification Badge */}
                {hasNew && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse shadow-lg shadow-red-500/50"></div>
                )}

                {/* ✅ NOVO: Badge com número de documentos ativos */}
                {activeCount > 0 && (
                  <div className="absolute -top-2 -left-2 min-w-[24px] h-6 px-2 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {activeCount}
                    </span>
                  </div>
                )}

                <div className="p-4 flex flex-col items-center">
                  {/* LINHA 1: Ícone grande ao centro */}
                  <div className={`p-3 rounded-xl mb-3 transition-all ${
                    isHovered ? 'bg-emerald-500/20' : 'bg-slate-800'
                  }`}>
                    <Icon className={`w-8 h-8 transition-colors ${
                      isHovered ? 'text-emerald-400' : 'text-slate-400'
                    }`} />
                  </div>

                  {/* LINHA 2: Título da categoria */}
                  <div className={`text-xs font-semibold text-center line-clamp-2 transition-colors ${
                    isHovered ? 'text-white' : 'text-slate-300'
                  }`}>
                    {info.nome}
                  </div>

                  {/* Ver Mais - Aparece no hover */}
                  {isHovered && categoryDocs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 w-full">
                      <div className="flex items-center justify-center gap-1 text-xs text-emerald-400 font-medium">
                        <span>Ver</span>
                        <ChevronRightIcon className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        );
      })}

      {/* Modal de Documentos da Categoria - NÃO fecha quando abre documento */}
      {selectedCategory && !selectedDocument && (
        <CategoryDocumentsModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          onSelectDocument={(doc) => {
            setSelectedDocument(doc);
            // NÃO fechamos selectedCategory aqui!
          }}
        />
      )}

      {/* Modal de Detalhe do Documento */}
      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          onClose={() => {
            setSelectedDocument(null);
            setSelectedCategory(null);
          }}
          onBack={selectedCategory ? handleBackToCategory : null}
        />
      )}
    </>
  );
};

export default RadarFullScreen;