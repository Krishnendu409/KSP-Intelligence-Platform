import React, { useState } from 'react';
import { RelationshipGraph } from '../relationship/RelationshipGraph';
import { Network, Search } from 'lucide-react';
import { useInvestigationStore } from '../workspace/store/useInvestigationStore';

export const NetworkAnalysisPage: React.FC = () => {
  const { setFocusedEntity } = useInvestigationStore();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const formatted = searchInput.trim().toUpperCase().startsWith('CASE-') 
        ? searchInput.trim().toUpperCase() 
        : `CASE-${searchInput.trim()}`;
      setFocusedEntity(formatted);
      setSearchInput('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-tactical-950 text-tactical-100 overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-tactical-900 border-b border-tactical-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-wider text-white">
              EVIDENTIARY LINK ANALYSIS & KINGPIN DETECTION WORKSPACE
            </h1>
            <p className="text-xxs font-mono text-tactical-400">
              BFS Chain of Custody Tracer • Automated Hawala Node Detection • Operational Layout Engine
            </p>
          </div>
        </div>

        {/* Case Search */}
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="w-4 h-4 text-tactical-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search Case ID (e.g. 101)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-tactical-800 border border-tactical-600 rounded-md text-xs font-mono text-white pl-9 pr-3 py-1.5 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/50 w-64"
          />
        </form>
      </div>

      {/* Main Full-Screen Link Analysis Area */}
      <div className="flex-1 relative overflow-hidden">
        <RelationshipGraph />
      </div>
    </div>
  );
};
