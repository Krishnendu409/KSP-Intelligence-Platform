import { useState, useEffect } from "react";
import { useInvestigationStore } from "./store/useInvestigationStore";
import { Activity, ChevronDown, ChevronUp, Database, Zap } from "lucide-react";

export function PerformanceDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const { navigation } = useInvestigationStore();
  const [metrics, setMetrics] = useState({
    searchMs: 14,
    timelineMs: 4,
    relationshipMs: 9,
    mapMs: 18,
    dossierMs: 11,
    entitiesLoaded: 134,
    visibleMarkers: 27,
    graphNodes: 14,
    graphEdges: 31,
    dbQueries: 47,
    cacheHits: 31,
    uptimeSeconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!import.meta.env.DEV) return null;

  const formatUptime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const cacheRate = Math.round((metrics.cacheHits / metrics.dbQueries) * 100);

  return (
    <div className="fixed bottom-2 right-2 z-50 font-mono text-xxs select-none">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-tactical-900/95 border border-tactical-600 hover:border-accent-cyan text-tactical-300 hover:text-white shadow-lg transition-all"
        >
          <Activity className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
          <span>DEV PERF</span>
          <span className="text-accent-cyan font-bold">{metrics.searchMs}ms</span>
          <ChevronUp className="w-3 h-3 text-tactical-400" />
        </button>
      ) : (
        <div className="w-72 rounded bg-tactical-900/95 border border-accent-cyan/80 shadow-[0_0_20px_rgba(0,240,255,0.2)] text-tactical-200 overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-tactical-800/80 border-b border-tactical-700">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="font-bold text-white tracking-wider">INTELLIGENCE OS — PERF</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-tactical-400 hover:text-white p-0.5"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            {/* Latency Section */}
            <div>
              <div className="text-tactical-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Latency (ms)</span>
                <span>P95 Target &lt; 50ms</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between bg-tactical-950/50 px-2 py-1 rounded">
                  <span className="text-tactical-400">Search</span>
                  <span className="text-accent-cyan font-bold">{metrics.searchMs} ms</span>
                </div>
                <div className="flex justify-between bg-tactical-950/50 px-2 py-1 rounded">
                  <span className="text-tactical-400">Timeline</span>
                  <span className="text-white font-bold">{metrics.timelineMs} ms</span>
                </div>
                <div className="flex justify-between bg-tactical-950/50 px-2 py-1 rounded">
                  <span className="text-tactical-400">Relationships</span>
                  <span className="text-white font-bold">{metrics.relationshipMs} ms</span>
                </div>
                <div className="flex justify-between bg-tactical-950/50 px-2 py-1 rounded">
                  <span className="text-tactical-400">Map Overlay</span>
                  <span className="text-accent-amber font-bold">{metrics.mapMs} ms</span>
                </div>
                <div className="flex justify-between bg-tactical-950/50 px-2 py-1 rounded col-span-2">
                  <span className="text-tactical-400">Dossier Hydration</span>
                  <span className="text-white font-bold">{metrics.dossierMs} ms</span>
                </div>
              </div>
            </div>

            {/* DOM / Graph Counts */}
            <div className="border-t border-tactical-800 pt-2">
              <div className="text-tactical-500 uppercase tracking-wider mb-1">Active Memory Footprint</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-tactical-400">Entities Cached:</span>
                  <span className="text-white font-bold">{metrics.entitiesLoaded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tactical-400">Visible Map Markers:</span>
                  <span className="text-white font-bold">{metrics.visibleMarkers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tactical-400">Graph Nodes / Edges:</span>
                  <span className="text-white font-bold">{metrics.graphNodes} / {metrics.graphEdges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tactical-400">Navigation Depth:</span>
                  <span className="text-accent-cyan font-bold">{(navigation?.stack?.length || 0)} stack</span>
                </div>
              </div>
            </div>

            {/* Backend & DB Section */}
            <div className="border-t border-tactical-800 pt-2">
              <div className="text-tactical-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Database className="w-3 h-3 text-tactical-400" />
                <span>Backend Telemetry</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-tactical-400">Session Uptime:</span>
                  <span className="text-white font-bold">{formatUptime(metrics.uptimeSeconds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tactical-400">Queries / Cache Hits:</span>
                  <span className="text-white font-bold">{metrics.dbQueries} / {metrics.cacheHits} ({cacheRate}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
