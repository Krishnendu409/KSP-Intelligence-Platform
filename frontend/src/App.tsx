import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { WorkspaceShell } from './layout/WorkspaceShell';
import { AppSidebar } from './layout/AppSidebar';
import { NetworkAnalysisPage } from './pages/NetworkAnalysisPage';
import { FIRDatabasePage } from './pages/FIRDatabasePage';
import { InvestigatorChatPage } from './pages/InvestigatorChatPage';
import { useEffect } from 'react';
import { useInvestigationStore } from './workspace/store/useInvestigationStore';
import { OpenAPI } from '@shared/client';
import { AICopilotPanel } from './copilot/AICopilotPanel';

// Configure OpenAPI Client — use relative URL; Vite proxy forwards /api/* to localhost:3000 in dev
OpenAPI.BASE = import.meta.env.VITE_API_BASE ?? '';

// Invisible component that syncs URL with Zustand state for deep linking
function RouteSync() {
  const location = useLocation();
  const { setActiveSearch, setFocusedEntity } = useInvestigationStore();

  useEffect(() => {
    // Example deep linking logic:
    // /entity/PERSON-001
    const parts = location.pathname.split('/');
    if (parts[1] === 'entity' && parts[2]) {
      setFocusedEntity(parts[2]);
    }
    
    // /search?q=KA01AB1234
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setActiveSearch(q);
    }
  }, [location, setActiveSearch, setFocusedEntity]);

  return null;
}

function App() {
  const { isCopilotOpen, setIsCopilotOpen } = useInvestigationStore();

  return (
    <Router>
      <RouteSync />
      <div className="flex h-screen w-full bg-tactical-950 overflow-hidden text-tactical-100">
        <AppSidebar />
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
          <Routes>
            <Route path="/" element={<WorkspaceShell />} />
            <Route path="/chat" element={<InvestigatorChatPage />} />
            <Route path="/network" element={<NetworkAnalysisPage />} />
            <Route path="/cases" element={<FIRDatabasePage />} />
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
                 <button onClick={() => setIsCopilotOpen(false)} className="text-tactical-500 hover:text-white px-2 py-1 rounded hover:bg-tactical-800 transition-colors">✕</button>
               </div>
               <div className="flex-1 overflow-hidden">
                 <AICopilotPanel isFullPage={false} />
               </div>
            </div>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
