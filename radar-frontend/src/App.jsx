// src/App.jsx (SUBSTITUIR)
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import { RadarProvider, useRadar } from "./contexts/Radarcontext";
import Header from "./components/Header";
import RadarNavigation from "./components/RadarNavigation";
import RadarFullScreen from "./components/RadarFullScreen";
import ConfigModal from "./components/ConfigModal";
import AdminDashboard from "./components/AdminDashboard";
import LoginPage from "./components/LoginPage";
import { useDocuments } from "./hooks/useDocuments";
import { useStats } from "./hooks/useStats";
import FavoritosModal from "./components/FavoritosModal";
import DocumentDetailModal from "./components/DocumentDetailModal";

function AppContent() {
  const { isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  const { radarAtivo, mudarRadar } = useRadar();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { documentosFavoritos } = useUser();

  const { stats } = useStats(radarAtivo);
  const { documents, refetch } = useDocuments(radarAtivo);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4"
               style={{ borderColor: '#27aae2', borderTopColor: 'transparent' }}></div>
          <p className="text-lg" style={{ color: '#7dd3fc' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

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
          onOpenFavorites={() => setMostrarFavoritos(true)}
          favoritesEnabled={mostrarFavoritos}
          favoritesCount={documentosFavoritos.length}
          isRefreshing={isRefreshing}
        />

        <div className="mt-4 flex justify-center">
          <RadarNavigation 
            activeRadar={radarAtivo} 
            onChange={mudarRadar} 
          />
        </div>
      </div>

      <div className="absolute inset-0 pt-40">
        <RadarFullScreen 
          stats={stats} 
          documents={documents}
          radarAtivo={radarAtivo}
        />
      </div>

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        radarAtivo={radarAtivo}
      />

      {mostrarFavoritos && (
        <FavoritosModal
          onClose={() => setMostrarFavoritos(false)}
          onSelectDocument={(doc) => {
            setSelectedDocument(doc);
            setMostrarFavoritos(false);
          }}
          allDocuments={documents}
          radarAtivo={radarAtivo}
        />
      )}

      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          radarAtivo={radarAtivo}
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
      <RadarProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </RadarProvider>
    </AuthProvider>
  );
}

export default App;