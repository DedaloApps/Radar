import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar do localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('radar_token');
    const savedUser = localStorage.getItem('radar_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Configurar axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      
      localStorage.setItem('radar_token', token);
      localStorage.setItem('radar_user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login'
      };
    }
  };

  const register = async (email, password, nome, codigoConvite) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        nome,
        codigoConvite
      });

      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      
      localStorage.setItem('radar_token', token);
      localStorage.setItem('radar_user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registar'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    localStorage.removeItem('radar_token');
    localStorage.removeItem('radar_user');
    
    delete axios.defaults.headers.common['Authorization'];
  };

  const validateInvite = async (code) => {
    try {
      const response = await axios.get(`${API_URL}/auth/invite/validate/${code}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao validar convite'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        validateInvite,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};