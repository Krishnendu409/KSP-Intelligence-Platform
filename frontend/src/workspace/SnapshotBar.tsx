import { useState, useEffect } from "react";
import { useInvestigationStore } from "./store/useInvestigationStore";
import type { SnapshotMeta } from "./store/useInvestigationStore";
import { Save, FolderDown, Trash2, Check, Clock, ShieldCheck, X } from "lucide-react";
import { useToastStore } from "./store/useToastStore";

export function SnapshotBar() {
  const { saveSnapshot, restoreSnapshot, listSnapshots, deleteSnapshot } = useInvestigationStore();
  const { addToast } = useToastStore();
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const refreshSnapshots = () => {
    setSnapshots(listSnapshots());
  };

  useEffect(() => {
    setSnapshots(listSnapshots());
  }, [listSnapshots]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;
    saveSnapshot(snapshotName.trim());
    setSnapshotName("");
    setIsModalOpen(false);
    refreshSnapshots();
    showFeedback(`Saved snapshot: "${snapshotName.trim()}"`);
  };

  const handleRestore = (meta: SnapshotMeta) => {
    const success = restoreSnapshot(meta.id);
    setIsDropdownOpen(false);
    if (success) {
      showFeedback(`Restored snapshot: "${meta.name}"`);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSnapshot(id);
    refreshSnapshots();
  };

  const showFeedback = (msg: string) => {
    addToast({ type: 'success', message: msg, duration: 4000 });
  };

  return (
    <>
      <div className="h-8 px-3 bg-tactical-900 border-t border-tactical-700 flex items-center justify-between font-mono text-xxs select-none shrink-0 z-20">
        {/* Left Indicator */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-tactical-400">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"></span>
            SESSION STORAGE: PERSISTED
          </span>

        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 hover:border-accent-cyan text-tactical-200 transition-colors"
          >
            <Save className="w-3 h-3 text-accent-cyan" />
            <span>Save Investigation Snapshot</span>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                refreshSnapshots();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 hover:border-accent-cyan text-tactical-200 transition-colors"
            >
              <FolderDown className="w-3 h-3 text-accent-amber" />
              <span>Snapshots ({snapshots.length})</span>
            </button>

            {/* Dropdown list */}
            {isDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-72 bg-tactical-950 border border-tactical-700 rounded shadow-2xl p-2 flex flex-col gap-1.5 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-tactical-800 text-tactical-400 font-bold">
                  <span>SAVED INVESTIGATIONS</span>
                  <button onClick={() => setIsDropdownOpen(false)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {snapshots.length === 0 ? (
                  <div className="py-4 text-center text-tactical-500">No saved snapshots yet.</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                    {snapshots.map((meta) => {
                      const timeStr = new Date(meta.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      });
                      return (
                        <div
                          key={meta.id}
                          onClick={() => handleRestore(meta)}
                          className="group p-1.5 rounded border border-tactical-800 hover:border-accent-cyan bg-tactical-900/60 hover:bg-tactical-800 cursor-pointer flex items-center justify-between gap-2 transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-white truncate text-xs">{meta.name}</div>
                            <div className="flex items-center gap-2 text-tactical-400 text-xxs">
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {timeStr}
                              </span>
                              <span>{meta.entityCount} selected</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleDelete(meta.id, e)}
                            title="Delete Snapshot"
                            className="p-1 rounded text-tactical-500 hover:text-red-400 hover:bg-tactical-900 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <form
            onSubmit={handleSave}
            className="w-96 bg-tactical-950 border border-tactical-600 rounded-lg shadow-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-tactical-800 pb-2">
              <span className="font-mono text-xs font-bold text-accent-cyan flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                SAVE INVESTIGATION SNAPSHOT
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-tactical-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-mono text-xxs text-tactical-400">
              Preserves current navigation trail, map viewport, selected entities, and active filters.
            </p>

            <input
              type="text"
              autoFocus
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder="e.g. Operation Midnight Shadow — Warehouse Lead"
              className="w-full bg-tactical-900 border border-tactical-700 focus:border-accent-cyan rounded px-3 py-1.5 text-xs font-mono text-white outline-none"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 rounded border border-tactical-700 text-tactical-300 font-mono text-xs hover:bg-tactical-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!snapshotName.trim()}
                className="px-3 py-1 rounded bg-accent-cyan/20 border border-accent-cyan text-accent-cyan font-mono text-xs font-bold hover:bg-accent-cyan/30 disabled:opacity-40"
              >
                Save Snapshot
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
