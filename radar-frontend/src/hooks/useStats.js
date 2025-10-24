// src/hooks/useStats.js (SUBSTITUIR COMPLETAMENTE)
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useStats = (tipoRadar = 'legislativo') => {
  const [stats, setStats] = useState({
    totalGeral: 0,
    documentosHoje: 0,
    porCategoria: [],
    ultimaAtualizacao: null
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { count: totalGeral } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_radar', tipoRadar);

      const hoje = new Date().toISOString().split('T')[0];
      const { count: documentosHoje } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_radar', tipoRadar)
        .gte('created_at', hoje);

      const { data: porCategoriaData } = await supabase
        .from('documents')
        .select('categoria')
        .eq('tipo_radar', tipoRadar);

      const categoriaCount = {};
      porCategoriaData?.forEach(doc => {
        categoriaCount[doc.categoria] = (categoriaCount[doc.categoria] || 0) + 1;
      });

      const porCategoria = Object.entries(categoriaCount).map(([cat, total]) => ({
        _id: cat,
        total
      }));

      const { data: ultimoDoc } = await supabase
        .from('documents')
        .select('created_at')
        .eq('tipo_radar', tipoRadar)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalGeral: totalGeral || 0,
        documentosHoje: documentosHoje || 0,
        porCategoria,
        ultimaAtualizacao: ultimoDoc?.created_at || new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro ao buscar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [tipoRadar]);

  useEffect(() => {
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tipoRadar]);

  return { stats, loading, refetch: fetchStats };
};