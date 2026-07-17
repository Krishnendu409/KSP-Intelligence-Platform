import { useInvestigationStore } from "./store/useInvestigationStore";
import { History, X, Download, Compass, Clock } from "lucide-react";

interface WorkflowRecorderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowRecorder({ isOpen, onClose }: WorkflowRecorderProps) {
  const { navigation, setFocusedEntity } = useInvestigationStore();
  const { stack, currentIndex } = navigation;

  if (!isOpen) return null;

  const exportAuditTrail = () => {
    const report = {
      title: "INVESTIGATION WORKFLOW TRAIL AUDIT",
      generatedAt: new Date().toISOString(),
      stepCount: stack.length,
      trail: stack.map((frame, i) => ({
        step: i + 1,
        isCurrent: i === currentIndex,
        timestamp: frame.timestamp,
        type: frame.type,
        id: frame.id,
        label: frame.label || frame.id
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investigation-trail-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-tactical-950/95 border-l border-tactical-700 shadow-2xl z-50 flex flex-col backdrop-blur animate-fade-in">
      {/* Header */}
      <div className="h-12 px-4 border-b border-tactical-700 flex items-center justify-between shrink-0 bg-tactical-900/80">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent-cyan">
          <History className="w-4 h-4" />
          <span>INVESTIGATION TRAIL ({stack.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportAuditTrail}
            disabled={stack.length === 0}
            title="Export Investigation Record as JSON"
            className="p-1.5 rounded bg-tactical-800 hover:bg-tactical-700 text-tactical-300 hover:text-accent-cyan transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-tactical-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="p-3 bg-tactical-900/40 border-b border-tactical-800 text-xxs font-mono text-tactical-400">
        Trace of every navigation frame. Click any entry to restore that point in the investigation.
      </div>

      {/* Stack List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {stack.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-tactical-500 font-mono text-xs text-center">
            <Compass className="w-8 h-8 mb-2 opacity-40" />
            No navigation steps recorded yet. Search or inspect entities to start logging.
          </div>
        ) : (
          stack.map((frame, idx) => {
            const isCurrent = idx === currentIndex;
            const timeStr = frame.timestamp
              ? new Date(frame.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "--:--:--";

            return (
              <div
                key={`${frame.id}-${idx}`}
                onClick={() => setFocusedEntity(frame.id, frame.label)}
                className={`group p-2.5 rounded border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                  isCurrent
                    ? "bg-tactical-900 border-accent-cyan shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                    : "bg-tactical-900/50 border-tactical-800 hover:border-tactical-600 hover:bg-tactical-900"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xxs font-mono font-bold uppercase ${
                        frame.type === "CASE"
                          ? "bg-accent-amber/20 text-accent-amber"
                          : frame.type === "EVENT"
                          ? "bg-accent-purple/20 text-accent-purple"
                          : "bg-accent-cyan/20 text-accent-cyan"
                      }`}
                    >
                      {frame.type}
                    </span>
                    <span className="flex items-center gap-1 text-xxs font-mono text-tactical-400">
                      <Clock className="w-2.5 h-2.5" />
                      {timeStr}
                    </span>
                  </div>
                  <div
                    className={`font-mono text-xs truncate ${
                      isCurrent ? "text-white font-bold" : "text-tactical-200 group-hover:text-white"
                    }`}
                  >
                    {frame.label || frame.id}
                  </div>
                </div>

                {isCurrent && (
                  <span className="shrink-0 text-xxs font-mono text-accent-cyan border border-accent-cyan/50 px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Audit Stamp */}
      <div className="p-3 border-t border-tactical-800 bg-tactical-900/60 font-mono text-xxs text-tactical-400 flex items-center justify-between">
        <span>CHAIN OF CUSTODY LOGGING: ON</span>
        <span className="text-accent-cyan">VERIFIED</span>
      </div>
    </div>
  );
}
