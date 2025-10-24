// src/contexts/RadarContext.jsx
import { createContext, useContext, useState } from 'react';

const RadarContext = createContext();

export const RadarProvider = ({ children }) => {
  const [radarAtivo, setRadarAtivo] = useState('legislativo');

  const mudarRadar = (novoRadar) => {
    console.log(`🔄 Mudando para radar: ${novoRadar}`);
    setRadarAtivo(novoRadar);
  };

  return (
    <RadarContext.Provider value={{ radarAtivo, mudarRadar }}>
      {children}
    </RadarContext.Provider>
  );
};

export const useRadar = () => {
  const context = useContext(RadarContext);
  if (!context) {
    throw new Error('useRadar must be used within RadarProvider');
  }
  return context;
};