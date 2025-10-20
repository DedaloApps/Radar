import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Carregar preferências do localStorage
  const [userEmail, setUserEmail] = useState(() => 
    localStorage.getItem('radar_user_email') || null
  );
  
  const [categoriasFavoritas, setCategoriasFavoritas] = useState(() => {
    const saved = localStorage.getItem('radar_categorias_favoritas');
    return saved ? JSON.parse(saved) : [
      'comissao_01', 
      'comissao_02', 
      'comissao_03', 
      'comissao_04', 
      'comissao_05'
    ];
  });

  const [tiposConteudoVisiveis, setTiposConteudoVisiveis] = useState(() => {
    const saved = localStorage.getItem('radar_tipos_conteudo');
    return saved ? JSON.parse(saved) : ['agenda', 'audicao', 'audiencia', 'iniciativa', 'peticao', 'geral'];
  });

  // Estado para documentos lidos
  const [documentosLidos, setDocumentosLidos] = useState(() => {
    const saved = localStorage.getItem('radar_documentos_lidos');
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('radar_categorias_favoritas', JSON.stringify(categoriasFavoritas));
  }, [categoriasFavoritas]);

  useEffect(() => {
    localStorage.setItem('radar_tipos_conteudo', JSON.stringify(tiposConteudoVisiveis));
  }, [tiposConteudoVisiveis]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('radar_user_email', userEmail);
    } else {
      localStorage.removeItem('radar_user_email');
    }
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem('radar_documentos_lidos', JSON.stringify(documentosLidos));
  }, [documentosLidos]);

  // Funções de categorias
  const toggleCategoria = (categoriaId) => {
    setCategoriasFavoritas(prev => {
      if (prev.includes(categoriaId)) {
        if (prev.length <= 1) return prev;
        return prev.filter(c => c !== categoriaId);
      } else {
        return [...prev, categoriaId];
      }
    });
  };

  const toggleTipoConteudo = (tipo) => {
    setTiposConteudoVisiveis(prev => {
      if (prev.includes(tipo)) {
        if (prev.length <= 1) return prev;
        return prev.filter(t => t !== tipo);
      } else {
        return [...prev, tipo];
      }
    });
  };

  const resetarPreferencias = () => {
    setCategoriasFavoritas(['comissao_01', 'comissao_02', 'comissao_03', 'comissao_04', 'comissao_05']);
    setTiposConteudoVisiveis(['agenda', 'audicao', 'audiencia', 'iniciativa', 'peticao', 'geral']);
  };

  // Funções de documentos lidos
  const marcarComoLido = (documentoId) => {
    if (!documentosLidos.includes(documentoId)) {
      setDocumentosLidos(prev => [...prev, documentoId]);
    }
  };

  const foiLido = (documentoId) => {
    return documentosLidos.includes(documentoId);
  };

  const limparLidosAntigos = () => {
    setDocumentosLidos([]);
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
        limparLidosAntigos
      }}
    >
      {children}
    </UserContext.Provider>
  );
};