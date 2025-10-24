// src/contexts/UserContext.jsx (SUBSTITUIR COMPLETAMENTE)
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useRadar } from './Radarcontext';

const UserContext = createContext();

const PREFERENCIAS_DEFAULT = {
  legislativo: {
    categorias: [
      "comissao_01",
      "comissao_02",
      "comissao_03",
      "comissao_04",
      "comissao_05",
    ],
    tipos: [
      "agenda",
      "audicao",
      "audiencia",
      "iniciativa",
      "peticao",
      "geral",
      "pergunta",
      "requerimento",
      "votacao",
      "sumula",
    ]
  },
  stakeholders: {
    categorias: [],
    tipos: ['noticia', 'comunicado', 'destaque', 'relatorio', 'posicionamento', 'evento']
  }
};

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const { radarAtivo } = useRadar();
  
  const [preferencias, setPreferencias] = useState(() => {
    const saved = localStorage.getItem(`radar_preferencias_${user?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : PREFERENCIAS_DEFAULT;
  });

  const [documentosLidos, setDocumentosLidos] = useState(() => {
    const saved = localStorage.getItem(`radar_documentos_lidos_${user?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [documentosArquivados, setDocumentosArquivados] = useState(() => {
    const saved = localStorage.getItem(`radar_documentos_arquivados_${user?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [documentosFavoritos, setDocumentosFavoritos] = useState(() => {
    const saved = localStorage.getItem(`radar_documentos_favoritos_${user?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`radar_preferencias_${user?.id || 'guest'}`, JSON.stringify(preferencias));
  }, [preferencias, user?.id]);

  useEffect(() => {
    localStorage.setItem(`radar_documentos_lidos_${user?.id || 'guest'}`, JSON.stringify(documentosLidos));
  }, [documentosLidos, user?.id]);

  useEffect(() => {
    localStorage.setItem(`radar_documentos_arquivados_${user?.id || 'guest'}`, JSON.stringify(documentosArquivados));
  }, [documentosArquivados, user?.id]);

  useEffect(() => {
    localStorage.setItem(`radar_documentos_favoritos_${user?.id || 'guest'}`, JSON.stringify(documentosFavoritos));
  }, [documentosFavoritos, user?.id]);

  const categoriasFavoritas = preferencias[radarAtivo]?.categorias || [];
  const tiposConteudoVisiveis = preferencias[radarAtivo]?.tipos || [];

  const toggleCategoria = (categoriaId) => {
    setPreferencias(prev => {
      const radarPrefs = prev[radarAtivo] || PREFERENCIAS_DEFAULT[radarAtivo];
      const categorias = radarPrefs.categorias || [];
      
      const novasCategorias = categorias.includes(categoriaId)
        ? categorias.filter(c => c !== categoriaId)
        : [...categorias, categoriaId];

      return {
        ...prev,
        [radarAtivo]: {
          ...radarPrefs,
          categorias: novasCategorias
        }
      };
    });
  };

  const toggleTipoConteudo = (tipo) => {
    setPreferencias(prev => {
      const radarPrefs = prev[radarAtivo] || PREFERENCIAS_DEFAULT[radarAtivo];
      const tipos = radarPrefs.tipos || [];
      
      const novosTipos = tipos.includes(tipo)
        ? tipos.filter(t => t !== tipo)
        : [...tipos, tipo];

      return {
        ...prev,
        [radarAtivo]: {
          ...radarPrefs,
          tipos: novosTipos
        }
      };
    });
  };

  const resetarPreferencias = () => {
    setPreferencias(PREFERENCIAS_DEFAULT);
  };

  const foiLido = (docId) => documentosLidos.includes(docId);
  
  const marcarComoLido = (docId) => {
    if (!foiLido(docId)) {
      setDocumentosLidos(prev => [...prev, docId]);
    }
  };

  const marcarComoNaoLido = (docId) => {
    setDocumentosLidos(prev => prev.filter(id => id !== docId));
  };

  const limparLidosAntigos = () => {
    setDocumentosLidos([]);
  };

  const estaArquivado = (docId) => documentosArquivados.includes(docId);

  const arquivarDocumento = (docId) => {
    if (!estaArquivado(docId)) {
      setDocumentosArquivados(prev => [...prev, docId]);
      marcarComoLido(docId);
    }
  };

  const restaurarDocumento = (docId) => {
    setDocumentosArquivados(prev => prev.filter(id => id !== docId));
  };

  const limparArquivados = () => {
    setDocumentosArquivados([]);
  };

  const eFavorito = (docId) => documentosFavoritos.includes(docId);

  const adicionarFavorito = (docId) => {
    if (!eFavorito(docId)) {
      setDocumentosFavoritos(prev => [...prev, docId]);
    }
  };

  const removerFavorito = (docId) => {
    setDocumentosFavoritos(prev => prev.filter(id => id !== docId));
  };

  const toggleFavorito = (docId) => {
    if (eFavorito(docId)) {
      removerFavorito(docId);
    } else {
      adicionarFavorito(docId);
    }
  };

  const limparFavoritos = () => {
    setDocumentosFavoritos([]);
  };

  return (
    <UserContext.Provider value={{
      categoriasFavoritas,
      tiposConteudoVisiveis,
      toggleCategoria,
      toggleTipoConteudo,
      resetarPreferencias,
      foiLido,
      marcarComoLido,
      marcarComoNaoLido,
      limparLidosAntigos,
      estaArquivado,
      arquivarDocumento,
      restaurarDocumento,
      documentosArquivados,
      limparArquivados,
      documentosFavoritos,
      eFavorito,
      adicionarFavorito,
      removerFavorito,
      toggleFavorito,
      limparFavoritos
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};