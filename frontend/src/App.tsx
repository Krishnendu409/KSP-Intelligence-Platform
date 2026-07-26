import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { WorkspaceShell } from './layout/WorkspaceShell';
import { AppSidebar } from './layout/AppSidebar';
import { NetworkAnalysisPage } from './pages/NetworkAnalysisPage';
import { FIRDatabasePage } from './pages/FIRDatabasePage';
import { AlertCenterPage } from './pages/AlertCenterPage';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useInvestigationStore } from './workspace/store/useInvestigationStore';
import { OpenAPI } from '@shared/client';
import { AICopilotPanel } from './copilot/AICopilotPanel';
import { LoginPage } from './auth/LoginPage';
import { RequireAuth } from './auth/RequireAuth';
import { useAuthStore } from './auth/useAuthStore';
import { Toaster } from './components/common/Toaster';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';

// Configure OpenAPI Client — use relative URL; Vite proxy forwards /api/* to localhost:3000 in dev
OpenAPI.BASE = import.meta.env.VITE_API_BASE ?? '';
OpenAPI.TOKEN = async () => useAuthStore.getState().token ?? '';

// Invisible component that syncs URL with Zustand state for deep linking
function RouteSync() {
  const location = useLocation();
  const { setActiveSearch, setFocusedEntity, logNavigation } = useInvestigationStore();

  useEffect(() => {
    logNavigation('VIEW', location.pathname, `View: ${location.pathname}`);

    // Example deep linking logic:
    // /entity/PERSON-001
    const parts = location.pathname.split('/');
    if (parts[1] === 'entity' && parts[2]) {
      setFocusedEntity(parts[2]);
      logNavigation('ENTITY', parts[2], `Dossier: ${parts[2]}`);
    }

    // /search?q=KA01AB1234
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setActiveSearch(q);
      logNavigation('SEARCH', q, `Search: ${q}`);
    }
  }, [location.pathname, location.search, setActiveSearch, setFocusedEntity, logNavigation]);

  return null;
}

function AuthenticatedShell() {
  const { isCopilotOpen, setIsCopilotOpen } = useInvestigationStore();

  return (
    <div className="flex h-screen w-full bg-tactical-950 overflow-hidden text-tactical-100">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        <Routes>
          <Route path="/" element={<WorkspaceShell />} />
          <Route path="/network" element={<NetworkAnalysisPage />} />
          <Route path="/cases" element={<FIRDatabasePage />} />
          <Route path="/alerts" element={<AlertCenterPage />} />
          <Route path="/*" element={<WorkspaceShell />} />
        </Routes>

        {/* Slide-over Copilot */}
        {isCopilotOpen && (
          <div className="absolute top-0 right-0 h-full w-[450px] shadow-2xl border-l border-tactical-700 bg-tactical-950 z-[100] flex flex-col">
             <div className="p-3 border-b border-tactical-700 flex justify-between items-center bg-tactical-900">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></div>
                 <span className="font-mono text-xs font-bold text-tactical-300">AI COPILOT</span>
               </div>
               <button onClick={() => setIsCopilotOpen(false)} className="text-tactical-500 hover:text-white px-2 py-1 rounded hover:bg-tactical-800 transition-colors"><X className="w-3.5 h-3.5" /></button>
             </div>
             <div className="flex-1 overflow-hidden">
               <AICopilotPanel isFullPage={false} />
             </div>
          </div>
        )}
      </div>
      <Toaster />
      <KeyboardShortcutsModal />
    </div>
  );
}

function App() {
  return (
    <Router>
      <RouteSync />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AuthenticatedShell />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
