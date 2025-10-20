import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import Header from "./components/Header";
import RadarFullScreen from "./components/RadarFullScreen";
import ConfigModal from "./components/ConfigModal";
import AdminDashboard from "./components/AdminDashboard";
import LoginPage from "./components/LoginPage";
import { useDocuments } from "./hooks/useDocuments";
import { useStats } from "./hooks/useStats";
import FavoritosModal from "./components/FavoritosModal";
import { StarIcon } from "@heroicons/react/24/outline";

function AppContent() {
  const { isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const { documentosFavoritos } = useUser();

  const { stats } = useStats();
  const { documents, refetch } = useDocuments();

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationEnabled(Notification.permission === "granted");
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationEnabled(permission === "granted");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-emerald-300 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Se autenticado, mostrar radar
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <Header
          ultimaAtualizacao={stats.ultimaAtualizacao}
          notificationEnabled={notificationEnabled}
          onToggleNotifications={handleToggleNotifications}
          onRefresh={handleRefresh}
          onOpenConfig={() => setIsConfigOpen(true)}
          onOpenAdmin={isAdmin ? () => setIsAdminOpen(true) : null}
          isRefreshing={isRefreshing}
        />
        <button
          onClick={() => setMostrarFavoritos(true)}
          className="relative p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all group"
          title="Favoritos"
        >
          <StarIcon className="w-6 h-6 text-amber-400" />
          {documentosFavoritos.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {documentosFavoritos.length > 99
                ? "99+"
                : documentosFavoritos.length}
            </div>
          )}
        </button>
      </div>

      <div className="absolute inset-0 pt-24">
        <RadarFullScreen stats={stats} documents={documents} />
      </div>

      {/* Modais */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />

      {/* Modal de Favoritos */}
      {mostrarFavoritos && (
        <FavoritosModal
          onClose={() => setMostrarFavoritos(false)}
          onSelectDocument={(doc) => {
            setSelectedDocument(doc);
            setMostrarFavoritos(false);
          }}
          allDocuments={documents}
        />
      )}

      {isAdmin && (
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
