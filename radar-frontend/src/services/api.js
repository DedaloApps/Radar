import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Documentos do Parlamento
export const getDocuments = async (params = {}) => {
  const response = await api.get('/documents', { params });
  return response.data;
};

export const searchDocuments = async (query) => {
  const response = await api.get('/documents/search', {
    params: { q: query }
  });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/documents/stats');
  return response.data;
};

// Documentos de Stakeholders
export const getStakeholders = async (params = {}) => {
  const response = await api.get('/stakeholders/documents', { params });
  return response.data;
};

export const searchStakeholders = async (query) => {
  const response = await api.get('/stakeholders/search', {
    params: { q: query }
  });
  return response.data;
};

export const getStakeholdersStats = async () => {
  const response = await api.get('/stakeholders/stats');
  return response.data;
};

// Users
export const subscribeUser = async (email, categoriasInteresse) => {
  const response = await api.post('/users', { 
    email, 
    categoriasInteresse 
  });
  return response.data;
};

export default api;