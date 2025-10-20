import { useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeUser } from '../services/api';
import { CATEGORIAS } from '../utils/categories';

const SubscribeModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const toggleCategoria = (categoria) => {
    setSelectedCategorias(prev =>
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await subscribeUser(email, selectedCategorias);
      setMessage({
        type: 'success',
        text: '✅ Subscrição realizada com sucesso! Vais receber alertas por email.'
      });
      
      setTimeout(() => {
        setEmail('');
        setSelectedCategorias([]);
        onClose();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: '❌ Erro ao subscrever. Tenta novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">📧 Receber Alertas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Email */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="teu@email.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Categorias */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              Categorias de Interesse
            </label>
            <div className="space-y-2">
              {Object.entries(CATEGORIAS).slice(0, 5).map(([key, info]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedCategorias.includes(key)
                      ? `${info.bgLight} border-2 ${info.borderCor}`
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategorias.includes(key)}
                    onChange={() => toggleCategoria(key)}
                    className="w-5 h-5"
                  />
                  <span className="text-2xl">{info.emoji}</span>
                  <span className="font-medium text-gray-700">{info.nome}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mensagem */}
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A subscrever...' : 'Subscrever Alertas'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscribeModal;