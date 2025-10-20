import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AdminDashboard = ({ isOpen, onClose }) => {
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    validoDias: 7
  });

  useEffect(() => {
    if (isOpen) {
      carregarConvites();
    }
  }, [isOpen]);

  const carregarConvites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/auth/invites`);
      setConvites(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    }
    setLoading(false);
  };

  const criarConvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/auth/invite/create`, {
        email: formData.email || null,
        validoDias: parseInt(formData.validoDias)
      });
      
      setFormData({ email: '', validoDias: 7 });
      setShowForm(false);
      carregarConvites();
    } catch (error) {
      console.error('Erro ao criar convite:', error);
    }
    
    setLoading(false);
  };

  const copiarCodigo = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="glass-effect rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 p-8 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>

          <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            👑 Admin Dashboard
          </h2>
          <p className="text-emerald-100">
            Gestão de Códigos de Convite
          </p>
        </div>

        {/* Conteúdo */}
        <div className="p-8">
          {/* Botão Criar Convite */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-emerald-400">
                Códigos de Convite
              </h3>
              <p className="text-gray-400 text-sm">
                {convites.length} código(s) gerado(s) | {convites.filter(c => c.usado).length} usado(s)
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              Criar Convite
            </button>
          </div>

          {/* Form de Criar Convite */}
          {showForm && (
            <form onSubmit={criarConvite} className="mb-6 p-6 bg-emerald-500/5 border-2 border-emerald-500/30 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-emerald-300 text-sm font-semibold mb-2">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="deixar vazio para qualquer email"
                    className="w-full px-4 py-3 bg-slate-900/50 border-2 border-emerald-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-emerald-300 text-sm font-semibold mb-2">
                    Válido por (dias)
                  </label>
                  <input
                    type="number"
                    value={formData.validoDias}
                    onChange={(e) => setFormData({ ...formData, validoDias: e.target.value })}
                    min="1"
                    max="365"
                    className="w-full px-4 py-3 bg-slate-900/50 border-2 border-emerald-500/30 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Criando...' : '✨ Gerar Código'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de Convites */}
          {loading && !showForm ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando convites...</p>
            </div>
          ) : convites.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Nenhum convite gerado ainda
            </div>
          ) : (
            <div className="space-y-3">
              {convites.map((convite) => (
                <div
                  key={convite.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    convite.usado
                      ? 'bg-gray-900/30 border-gray-700'
                      : new Date(convite.valido_ate) < new Date()
                      ? 'bg-red-900/10 border-red-700/50'
                      : 'bg-emerald-500/5 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Código */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-xl font-bold text-emerald-400 bg-slate-900/50 px-4 py-2 rounded-lg">
                          {convite.code}
                        </code>
                        <button
                          onClick={() => copiarCodigo(convite.code)}
                          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
                          title="Copiar código"
                        >
                          {copiedCode === convite.code ? (
                            <CheckIcon className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ClipboardDocumentIcon className="w-5 h-5 text-emerald-400" />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        {convite.email && (
                          <span>📧 {convite.email}</span>
                        )}
                        <span>📅 Criado: {formatarData(convite.created_at)}</span>
                        <span>⏰ Válido até: {formatarData(convite.valido_ate)}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="text-right">
                      {convite.usado ? (
                        <div>
                          <div className="text-gray-500 font-bold mb-1">✅ USADO</div>
                          <div className="text-xs text-gray-500">
                            Por: {convite.usado_por}<br />
                            Em: {formatarData(convite.usado_em)}
                          </div>
                        </div>
                      ) : new Date(convite.valido_ate) < new Date() ? (
                        <div className="text-red-400 font-bold">⏰ EXPIRADO</div>
                      ) : (
                        <div className="text-emerald-400 font-bold">🟢 ATIVO</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;