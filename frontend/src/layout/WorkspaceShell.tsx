import { useEffect, useState } from "react";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import { CommandPalette } from "../components/common/CommandPalette";
import { EntityWorkspace } from "../entity/EntityWorkspace";
import { CaseWorkspace } from "../cases/CaseWorkspace";
import { TimelinePanel } from "../timeline/TimelinePanel";
import { TacticalMap } from "../map/TacticalMap";
import { RelationshipGraph } from "../relationship/RelationshipGraph";
import { UniversalIntelligenceInspector } from "../inspector/UniversalIntelligenceInspector";
import { WorkflowRecorder } from "../workspace/WorkflowRecorder";
import { SnapshotBar } from "../workspace/SnapshotBar";
import { SystemKPIStrip } from "../workspace/SystemKPIStrip";
import {
  Network,
  ChevronRight,
  ChevronLeft,
  FolderOpen,
  Crosshair,
  Activity,
  X,
} from "lucide-react";

type SidePanel = 'entity' | 'timeline' | 'network' | 'none';

export function WorkspaceShell() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWorkflowRecorderOpen, setIsWorkflowRecorderOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'ENTITY' | 'CASE'>('ENTITY');
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [panelWidth, setPanelWidth] = useState(380);

  const {
    activeSidePanel: sidePanel,
    setActiveSidePanel: setSidePanel,
    isRightPanelCollapsed: rightCollapsed,
    setIsRightPanelCollapsed: setRightCollapsed,
    focusedEntity,
    setFocusedEntity,
    inspectEntity,
    navigation,
    navigateBack,
    navigateForward,
    activeCase,
    setActiveCase,
  } = useInvestigationStore();

  const canGoBack = navigation.currentIndex > 0;
  const canGoForward = navigation.currentIndex < navigation.stack.length - 1;

  // Real recently-visited entities/cases, derived from the actual navigation stack (no fabricated data)
  const recentFrames = (() => {
    const seen = new Set<string>();
    const out: { id: string; label?: string; type: string }[] = [];
    for (let i = navigation.stack.length - 1; i >= 0 && out.length < 4; i--) {
      const frame = navigation.stack[i];
      if (frame.type !== 'ENTITY' && frame.type !== 'CASE') continue;
      if (seen.has(frame.id)) continue;
      seen.add(frame.id);
      out.push(frame);
    }
    return out;
  })();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); navigateBack(); }
      if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); navigateForward(); }
      if (e.key === 'Escape') setIsCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigateBack, navigateForward]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    
    const doDrag = (dragEvent: MouseEvent) => {
      // Since panel is on the right, dragging left (negative deltaX) increases width
      const newWidth = startWidth - (dragEvent.clientX - startX);
      if (newWidth >= 250 && newWidth <= 800) {
        setPanelWidth(newWidth);
      }
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
      {/* ─── Command Palette ─── */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

      {/* ─── Top Command Bar ─── */}
        <header className="h-10 shrink-0 flex items-center justify-between px-3 gap-3 bg-tactical-900/80 backdrop-blur border-b border-tactical-700/60 z-20">
          {/* Left: Breadcrumb */}
          <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
            <button
              onClick={navigateBack}
              disabled={!canGoBack}
              className={`p-1.5 md:p-2 rounded transition-all duration-150 shrink-0 ${canGoBack ? 'text-tactical-300 hover:text-accent-cyan hover:bg-tactical-800' : 'text-tactical-600 cursor-not-allowed'}`}
            >
              <ChevronLeft className="w-4 h-4 md:w-3.5 md:h-3.5" />
            </button>
            <button
              onClick={navigateForward}
              disabled={!canGoForward}
              className={`p-1.5 md:p-2 rounded transition-all duration-150 shrink-0 ${canGoForward ? 'text-tactical-300 hover:text-accent-cyan hover:bg-tactical-800' : 'text-tactical-600 cursor-not-allowed'}`}
            >
              <ChevronRight className="w-4 h-4 md:w-3.5 md:h-3.5" />
            </button>

            {/* Trail breadcrumb */}
            <div className="flex items-center gap-1 overflow-x-auto text-xxs font-mono no-scrollbar">
              {navigation.stack.length === 0 ? (
                <span className="text-tactical-500 whitespace-nowrap">
                  Ready — Ctrl+K to search or select an entity below
                </span>
              ) : (
                navigation.stack.map((frame, idx) => {
                  const isCurrent = idx === navigation.currentIndex;
                  return (
                    <span key={`${frame.id}-${idx}`} className="flex items-center gap-1 shrink-0">
                      {idx > 0 && <ChevronRight className="w-2.5 h-2.5 text-tactical-600" />}
                      <button
                        onClick={() => setFocusedEntity(frame.id, frame.label)}
                        className={`px-2.5 py-1 md:px-2 md:py-0.5 rounded transition-all whitespace-nowrap ${
                          isCurrent
                            ? 'bg-accent-cyan/15 text-accent-cyan font-semibold border border-accent-cyan/30'
                            : 'text-tactical-400 hover:text-white hover:bg-tactical-800'
                        }`}
                      >
                        {frame.label || frame.id}
                      </button>
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Mode toggle + Quick suspects */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live status indicator */}
            <div className="flex items-center gap-1.5 text-xxs font-mono text-tactical-400 bg-tactical-800/60 px-2 py-1 rounded border border-tactical-700/60">
              <span className="status-dot live" />
              <span>LIVE</span>
            </div>

            {focusedEntity && (
              <div className="flex items-center gap-1.5 font-mono text-xxs bg-accent-cyan/10 px-2 py-1 rounded border border-accent-cyan/25 text-accent-cyan max-w-[160px] truncate">
                <Crosshair className="w-3 h-3 shrink-0" />
                <span className="truncate">{focusedEntity}</span>
              </div>
            )}

            <button
              onClick={() => setActiveMode(prev => prev === 'ENTITY' ? 'CASE' : 'ENTITY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 md:px-2.5 md:py-1 rounded font-mono text-xs md:text-xxs border transition-all ${
                activeMode === 'CASE'
                  ? 'bg-accent-amber/15 border-accent-amber/40 text-accent-amber'
                  : 'bg-tactical-800 border-tactical-600 hover:border-accent-cyan text-tactical-300 hover:text-white'
              }`}
              title="Toggle Entity / Case Mode"
            >
              <FolderOpen className="w-3 h-3" />
              <span>{activeMode === 'CASE' ? `Case: ${activeCase || 'None Selected'}` : 'Entity Mode'}</span>
            </button>
          </div>
        </header>

        {/* ─── System KPI Strip ─── */}
        <SystemKPIStrip />

        {/* ─── Content Area: Map + Right Panel ─── */}
        <div className="flex flex-1 min-h-0 overflow-hidden relative">

          {/* ─── Tactical Map (always full) ─── */}
          <div className="flex-1 min-w-0 relative overflow-hidden">
            <TacticalMap />

            {/* ─── Floating Quick-Pivot HUD (bottom of map) — real recently-visited entities/cases ─── */}
            {showBottomBar && recentFrames.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
                <div className="hud-card px-3 py-2 flex items-center gap-2">
                  <span className="text-xxs font-mono text-tactical-500 uppercase tracking-wider mr-1">Recently Viewed:</span>
                  {recentFrames.map(frame => (
                    <button
                      key={frame.id}
                      onClick={() => {
                        if (frame.type === 'CASE') {
                          setActiveCase(frame.id.replace('CASE-', ''));
                          setActiveMode('CASE');
                        } else {
                          inspectEntity(frame.id, { name: frame.label });
                          setSidePanel('entity');
                        }
                        setRightCollapsed(false);
                      }}
                      className={`text-xs md:text-xxs font-mono px-3 py-1.5 md:px-2.5 md:py-1 rounded border border-tactical-700/60 hover:border-accent-cyan/40 hover:bg-tactical-700/60 transition-all ${
                        focusedEntity === frame.id ? 'bg-tactical-700 border-accent-cyan/40 text-accent-cyan' : 'text-tactical-300 hover:text-white bg-tactical-800/60'
                      }`}
                    >
                      {frame.label || frame.id}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowBottomBar(false)}
                    className="ml-1 text-tactical-600 hover:text-tactical-300 transition-colors"
                    title="Hide quick pivot"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── Right Glass Panel (collapsible) ─── */}
          <div
            className={`absolute md:relative right-0 top-0 h-full flex flex-col shrink-0 transition-[width,opacity] duration-300 ease-out overflow-hidden z-40 md:z-auto ${
              rightCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            style={{ width: rightCollapsed ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : panelWidth) }}
          >
            {/* Drag Handle */}
            <div 
              className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-accent-cyan/50 z-50 hidden md:block" 
              onMouseDown={startResize} 
            />
            
            <div className="flex flex-col h-full glass-panel-strong border-l border-tactical-700/50 animate-slide-in-right ml-1">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-tactical-700/50 shrink-0">
                <div className="flex items-center gap-2">
                  {/* Panel type tabs */}
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'entity',   label: 'DOSSIER', icon: Crosshair },
                      { id: 'timeline', label: 'EVENTS',  icon: Activity },
                      { id: 'network',  label: 'LINKS',   icon: Network },
                    ].map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSidePanel(t.id as SidePanel)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 md:px-2 md:py-1 rounded text-xs md:text-xxs font-mono transition-all ${
                            sidePanel === t.id
                              ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                              : 'text-tactical-500 hover:text-tactical-200 hover:bg-tactical-800/50'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Case/Entity toggle */}
                  {sidePanel === 'entity' && (
                    <button
                      onClick={() => setActiveMode(prev => prev === 'ENTITY' ? 'CASE' : 'ENTITY')}
                      className={`text-xs md:text-xxs font-mono px-2 py-1 md:px-1.5 md:py-0.5 rounded border transition-all ${
                        activeMode === 'CASE'
                          ? 'bg-accent-amber/10 border-accent-amber/30 text-accent-amber'
                          : 'border-tactical-700 text-tactical-500 hover:text-tactical-200'
                      }`}
                    >
                      {activeMode === 'CASE' ? 'FIR' : 'ENT'}
                    </button>
                  )}
                  <button
                    onClick={() => setRightCollapsed(true)}
                    className="p-1 rounded text-tactical-500 hover:text-tactical-200 hover:bg-tactical-800 transition-all"
                    title="Collapse panel"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden min-h-0">
                {sidePanel === 'entity' && (
                  <div className="h-full overflow-auto">
                    {activeMode === 'CASE' ? (
                      <CaseWorkspace caseId={activeCase || undefined} />
                    ) : (
                      <EntityWorkspace />
                    )}
                  </div>
                )}
                {sidePanel === 'timeline' && (
                  <div className="h-full overflow-auto">
                    <TimelinePanel />
                  </div>
                )}
                {sidePanel === 'network' && (
                  <div className="h-full overflow-hidden">
                    <RelationshipGraph />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Collapsed panel re-open tab ─── */}
          {rightCollapsed && (
            <button
              onClick={() => setRightCollapsed(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 h-16 w-6 glass-panel-strong border-l-0 rounded-l-lg flex items-center justify-center text-tactical-500 hover:text-accent-cyan transition-all hover:w-8"
              title="Open panel"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}
        </div>
        {/* ─── Bottom Status / Snapshot Bar ─── */}
        <SnapshotBar />

      {/* ─── Undocked Universal Intelligence Inspector (Slide-over Modal) ─── */}
      <UniversalIntelligenceInspector docked={false} />

      {/* ─── Modals / Overlays ─── */}
      <WorkflowRecorder
        isOpen={isWorkflowRecorderOpen}
        onClose={() => setIsWorkflowRecorderOpen(false)}
      />
    </div>
  );
}
