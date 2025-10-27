import { useState, useEffect } from 'react';
import { getStats, getStakeholdersStats } from '../services/api';

export const useStats = (tipoRadar = 'parlamento') => {
  const [stats, setStats] = useState({
    totalGeral: 0,
    documentosHoje: 0,
    porCategoria: [],
    ultimaAtualizacao: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Selecionar API baseado no tipo de radar
        const data = tipoRadar === 'stakeholders'
          ? await getStakeholdersStats()
          : await getStats();
        setStats(data.data);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Atualizar stats a cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tipoRadar]);

  return { stats, loading };
};