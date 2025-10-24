import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Carregar preferências do localStorage
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem("radar_user_email") || null
  );

  const [categoriasFavoritas, setCategoriasFavoritas] = useState(() => {
    const saved = localStorage.getItem("radar_categorias_favoritas");
    return saved
      ? JSON.parse(saved)
      : [
          "comissao_01",
          "comissao_02",
          "comissao_03",
          "comissao_04",
          "comissao_05",
        ];
  });

  const [tiposConteudoVisiveis, setTiposConteudoVisiveis] = useState(() => {
    const saved = localStorage.getItem("radar_tipos_conteudo");
    return saved
      ? JSON.parse(saved)
      : [
          "agenda",
          "audicao",
          "audiencia",
          "iniciativa",
          "peticao",
          "geral",
          "pergunta",      // ✅ NOVO
          "requerimento",  // ✅ NOVO
          "votacao",       // ✅ NOVO
          "sumula",        // ✅ NOVO
        ];
  });

  // Estado para documentos lidos
  const [documentosLidos, setDocumentosLidos] = useState(() => {
    const saved = localStorage.getItem("radar_documentos_lidos");
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(
      "radar_categorias_favoritas",
      JSON.stringify(categoriasFavoritas)
    );
  }, [categoriasFavoritas]);

  useEffect(() => {
    localStorage.setItem(
      "radar_tipos_conteudo",
      JSON.stringify(tiposConteudoVisiveis)
    );
  }, [tiposConteudoVisiveis]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem("radar_user_email", userEmail);
    } else {
      localStorage.removeItem("radar_user_email");
    }
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem(
      "radar_documentos_lidos",
      JSON.stringify(documentosLidos)
    );
  }, [documentosLidos]);

  // Funções de categorias
  const toggleCategoria = (categoriaId) => {
    setCategoriasFavoritas((prev) => {
      if (prev.includes(categoriaId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((c) => c !== categoriaId);
      } else {
        return [...prev, categoriaId];
      }
    });
  };

  const toggleTipoConteudo = (tipo) => {
    setTiposConteudoVisiveis((prev) => {
      if (prev.includes(tipo)) {
        if (prev.length <= 1) return prev;
        return prev.filter((t) => t !== tipo);
      } else {
        return [...prev, tipo];
      }
    });
  };

  const resetarPreferencias = () => {
    setCategoriasFavoritas([
      "comissao_01",
      "comissao_02",
      "comissao_03",
      "comissao_04",
      "comissao_05",
    ]);
    setTiposConteudoVisiveis([
      "agenda",
      "audicao",
      "audiencia",
      "iniciativa",
      "peticao",
      "geral",
      "pergunta",      // ✅ NOVO
      "requerimento",  // ✅ NOVO
      "votacao",       // ✅ NOVO
      "sumula",        // ✅ NOVO
    ]);
  };

  // Funções de documentos lidos
  const marcarComoLido = (documentoId) => {
    if (!documentosLidos.includes(documentoId)) {
      setDocumentosLidos((prev) => [...prev, documentoId]);
    }
  };

  const foiLido = (documentoId) => {
    return documentosLidos.includes(documentoId);
  };

  const limparLidosAntigos = () => {
    setDocumentosLidos([]);
  };

  // Estado para documentos arquivados
  const [documentosArquivados, setDocumentosArquivados] = useState(() => {
    const saved = localStorage.getItem("radar_documentos_arquivados");
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar documentos arquivados no localStorage
  useEffect(() => {
    localStorage.setItem(
      "radar_documentos_arquivados",
      JSON.stringify(documentosArquivados)
    );
  }, [documentosArquivados]);

  // Arquivar documento
  const arquivarDocumento = (documentoId) => {
    if (!documentosArquivados.includes(documentoId)) {
      setDocumentosArquivados((prev) => [...prev, documentoId]);
      // Também marca como lido
      marcarComoLido(documentoId);
    }
  };

  // Restaurar documento
  const restaurarDocumento = (documentoId) => {
    setDocumentosArquivados((prev) => prev.filter((id) => id !== documentoId));
  };

  // Verificar se documento está arquivado
  const estaArquivado = (documentoId) => {
    return documentosArquivados.includes(documentoId);
  };

  // Limpar arquivados
  const limparArquivados = () => {
    setDocumentosArquivados([]);
  };

  // Estado para documentos favoritos
  const [documentosFavoritos, setDocumentosFavoritos] = useState(() => {
    const saved = localStorage.getItem("radar_documentos_favoritos");
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar documentos favoritos no localStorage
  useEffect(() => {
    localStorage.setItem(
      "radar_documentos_favoritos",
      JSON.stringify(documentosFavoritos)
    );
  }, [documentosFavoritos]);

  // Adicionar aos favoritos
  const adicionarFavorito = (documentoId) => {
    if (!documentosFavoritos.includes(documentoId)) {
      setDocumentosFavoritos((prev) => [...prev, documentoId]);
    }
  };

  // Remover dos favoritos
  const removerFavorito = (documentoId) => {
    setDocumentosFavoritos((prev) => prev.filter((id) => id !== documentoId));
  };

  // Toggle favorito
  const toggleFavorito = (documentoId) => {
    if (documentosFavoritos.includes(documentoId)) {
      removerFavorito(documentoId);
    } else {
      adicionarFavorito(documentoId);
    }
  };

  // Verificar se é favorito
  const eFavorito = (documentoId) => {
    return documentosFavoritos.includes(documentoId);
  };

  // Limpar favoritos
  const limparFavoritos = () => {
    setDocumentosFavoritos([]);
  };

  return (
    <UserContext.Provider
      value={{
        userEmail,
        setUserEmail,
        categoriasFavoritas,
        setCategoriasFavoritas,
        toggleCategoria,
        tiposConteudoVisiveis,
        setTiposConteudoVisiveis,
        toggleTipoConteudo,
        resetarPreferencias,
        documentosLidos,
        marcarComoLido,
        foiLido,
        limparLidosAntigos,
        documentosArquivados,
        arquivarDocumento,
        restaurarDocumento,
        estaArquivado,
        limparArquivados,
        documentosFavoritos,
        adicionarFavorito,
        removerFavorito,
        toggleFavorito,
        eFavorito,
        limparFavoritos,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};