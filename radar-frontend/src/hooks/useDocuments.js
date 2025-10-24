// src/hooks/useDocuments.js (SUBSTITUIR COMPLETAMENTE)
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useDocuments = (tipoRadar = 'legislativo') => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('tipo_radar', tipoRadar)
        .order('data_publicacao', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`📊 Documentos do radar ${tipoRadar}:`, data?.length || 0);
      setDocuments(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar documentos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [tipoRadar]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDocuments();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tipoRadar]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments
  };
};