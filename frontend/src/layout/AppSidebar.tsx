import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Map, Network, FileText, Bot, Shield,
  Search, Video, Printer
} from 'lucide-react';
import { useInvestigationStore } from '../workspace/store/useInvestigationStore';
import { CommandPalette } from '../components/common/CommandPalette';
import { WorkflowRecorder } from '../workspace/WorkflowRecorder';

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isRightPanelCollapsed,
    setIsRightPanelCollapsed,
    isCopilotOpen,
    setIsCopilotOpen
  } = useInvestigationStore();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWorkflowRecorderOpen, setIsWorkflowRecorderOpen] = useState(false);

  const handleNavClick = (id: string) => {
    if (id === 'map') {
      if (location.pathname !== '/') {
        navigate('/');
      }
      setIsRightPanelCollapsed(true);
      return;
    }

    if (id === 'network') {
      navigate('/network');
      return;
    }

    if (id === 'fir') {
      navigate('/cases');
      return;
    }

    if (id === 'copilot') {
      navigate('/copilot');
      return;
    }
  };

  const isMapActive = location.pathname === '/' && isRightPanelCollapsed;
  const isNetworkActive = location.pathname.startsWith('/network');
  const isFirActive = location.pathname.startsWith('/cases');

  return (
    <>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

      <aside className="flex flex-col w-14 shrink-0 bg-tactical-900 border-r border-tactical-700/60 z-30 select-none">
        {/* Logo */}
        <button
          onClick={() => { navigate('/'); setIsRightPanelCollapsed(true); }}
          className="flex flex-col items-center py-3 border-b border-tactical-700/60 hover:bg-tactical-800/40 transition-colors"
          title="Tactical Intelligence OS"
        >
          <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-accent-cyan" />
          </div>
          <span className="text-[8px] font-mono text-accent-cyan/70 mt-1 tracking-widest">OS v2.4</span>
        </button>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 px-1.5 py-2 flex-1">
          <button
            onClick={() => handleNavClick('map')}
            className={`nav-item ${isMapActive ? 'active' : ''}`}
            title="Tactical GIS Map"
          >
            <Map className="w-4 h-4" />
            <span className="nav-label">MAP</span>
          </button>

          <button
            onClick={() => handleNavClick('network')}
            className={`nav-item ${isNetworkActive ? 'active' : ''}`}
            title="Network Analysis"
          >
            <Network className="w-4 h-4" />
            <span className="nav-label">NETWORK</span>
          </button>

          <button
            onClick={() => handleNavClick('fir')}
            className={`nav-item ${isFirActive ? 'active' : ''}`}
            title="FIR Database"
          >
            <FileText className="w-4 h-4" />
            <span className="nav-label">FIR</span>
          </button>

          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`nav-item ${isCopilotOpen ? 'active' : ''}`}
            title="AI Intelligence Copilot"
          >
            <Bot className="w-4 h-4" />
            <span className="nav-label">AI</span>
          </button>
        </nav>

        {/* Bottom Sidebar Actions */}
        <div className="flex flex-col items-center gap-2 px-1.5 py-3 border-t border-tactical-700/60">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="nav-item w-full"
            title="Global Search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="nav-label">SEARCH</span>
          </button>
          <button
            onClick={() => setIsWorkflowRecorderOpen(!isWorkflowRecorderOpen)}
            className={`nav-item w-full ${isWorkflowRecorderOpen ? 'active' : ''}`}
            title="Investigation Trail"
          >
            <Video className="w-4 h-4" />
            <span className="nav-label">TRAIL</span>
          </button>
          <button
            onClick={() => window.print()}
            className="nav-item w-full"
            title="Print Briefing / Dossier"
          >
            <Printer className="w-4 h-4" />
            <span className="nav-label">PRINT</span>
          </button>
        </div>
      </aside>

      {/* Investigation Trail Modal/Overlay */}
      <WorkflowRecorder isOpen={isWorkflowRecorderOpen} onClose={() => setIsWorkflowRecorderOpen(false)} />
    </>
  );
};
