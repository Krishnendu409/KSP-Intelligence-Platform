import React from 'react';
import type { DataProvenanceStamp } from '../engine/DataIngestionEngine';

interface LineageProvenanceExplorerProps {
  entity: {
    id: string;
    type: string;
    name?: string;
    phoneNumber?: string;
    provenance?: DataProvenanceStamp;
  };
  onClose: () => void;
}

export const LineageProvenanceExplorer: React.FC<LineageProvenanceExplorerProps> = ({
  entity,
  onClose
}) => {
  const prov = entity.provenance;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-6 text-slate-100">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-sky-400">Data Lineage & Cryptographic Provenance</h2>
            <p className="text-xs text-slate-400">
              Entity: {entity.name || entity.phoneNumber || entity.id} ({entity.type})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 rounded border border-slate-700"
          >
            Close
          </button>
        </div>

        {prov ? (
          <div className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-slate-800/60 border border-slate-700/60 p-4 rounded-lg">
              <div>
                <span className="text-xs text-slate-400 block">Source File</span>
                <span className="font-semibold text-white">{prov.sourceFileName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Imported By Officer</span>
                <span className="font-semibold text-sky-300">{prov.importedByOfficerId}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Import Timestamp</span>
                <span className="text-slate-200">{new Date(prov.importTimestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Raw Record Reference</span>
                <span className="text-slate-200">{prov.rawRecordRef}</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
              <span className="text-xs text-slate-400 block mb-1">SHA-256 Cryptographic Evidence Hash</span>
              <code className="text-xs font-mono text-emerald-400 break-all">
                {prov.sourceFileHash}
              </code>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 py-6 text-center">
            No formal Data Provenance Stamp recorded for this entity.
          </div>
        )}

        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm font-semibold border border-slate-600"
          >
            Close Lineage Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
