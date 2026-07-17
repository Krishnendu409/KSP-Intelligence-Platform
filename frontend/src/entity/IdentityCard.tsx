import type { EntityDossier } from "@shared/client";
import { User, ShieldAlert, Fingerprint } from "lucide-react";

export function IdentityCard({ dossier }: { dossier: EntityDossier }) {
  const profile = dossier.profile || {};
  const isPerson = dossier.type === "Person";

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-tactical-600 bg-tactical-800/30">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-tactical-700 rounded border border-tactical-600 flex items-center justify-center shadow-inner">
          {isPerson ? (
            <User className="w-8 h-8 text-tactical-400" />
          ) : (
            <Fingerprint className="w-8 h-8 text-tactical-400" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-tactical-100 font-sans tracking-tight">
            {profile.name || profile.plateNumber || profile.number || "Unknown Identity"}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs text-tactical-400">ID: {dossier.entityId}</span>
            <span className="text-tactical-600 px-1">•</span>
            <span className="font-mono text-xs text-accent-cyan uppercase tracking-wider">{dossier.type}</span>
          </div>
        </div>
      </div>
      
      {dossier.aliases && dossier.aliases.length > 0 && (
        <div className="bg-tactical-900/50 p-2 border border-tactical-600/50 rounded">
          <span className="text-xxs font-mono text-tactical-500 uppercase tracking-widest mb-1 block">Known Aliases</span>
          <div className="flex flex-wrap gap-1.5">
            {dossier.aliases.map((alias, idx) => (
              <span key={idx} className="bg-tactical-700/50 text-tactical-300 px-2 py-0.5 rounded font-mono text-xs border border-tactical-600">
                "{alias}"
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.nationalId && (
        <div className="flex items-center gap-2 bg-tactical-900/50 p-2 border border-tactical-600/50 rounded">
          <ShieldAlert className="w-3.5 h-3.5 text-accent-amber" />
          <span className="text-xs font-mono text-tactical-400">NID:</span>
          <span className="text-xs font-mono text-tactical-100">{profile.nationalId}</span>
        </div>
      )}
    </div>
  );
}
