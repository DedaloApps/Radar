import { useState, useEffect } from 'react';
import { getStats } from '../services/api';

export const useStats = () => {
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
        const data = await getStats();
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
  }, []);

  return { stats, loading };
};