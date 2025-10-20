import { Mail } from 'lucide-react';

const FloatingButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-40"
      title="Subscrever alertas por email"
    >
      <Mail size={24} />
    </button>
  );
};

export default FloatingButton;