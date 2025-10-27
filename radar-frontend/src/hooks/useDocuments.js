import { useState, useEffect, useCallback } from 'react';
import { getDocuments, searchDocuments, getStakeholders, searchStakeholders } from '../services/api';

export const useDocuments = (tipoRadar = 'parlamento') => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data;

      // Selecionar API baseado no tipo de radar
      const isStakeholder = tipoRadar === 'stakeholders';

      if (searchQuery) {
        data = isStakeholder
          ? await searchStakeholders(searchQuery)
          : await searchDocuments(searchQuery);
      } else {
        const params = {};
        if (selectedCategoria !== 'todas') {
          params.categoria = selectedCategoria;
        }
        data = isStakeholder
          ? await getStakeholders(params)
          : await getDocuments(params);
      }

      setDocuments(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar documentos:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoria, searchQuery, tipoRadar]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDocuments();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    selectedCategoria,
    setSelectedCategoria,
    searchQuery,
    setSearchQuery,
    refetch: fetchDocuments
  };
};