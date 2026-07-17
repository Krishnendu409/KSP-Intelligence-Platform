import { Filter, Calendar } from 'lucide-react';

export interface MapFilters {
  crimeType: 'ALL' | 'HEINOUS' | 'NON_HEINOUS';
  dateRange: 'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_YEAR';
}

interface MapFilterStripProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
}

export function MapFilterStrip({ filters, onChange }: MapFilterStripProps) {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center bg-tactical-900/90 backdrop-blur rounded-md border border-tactical-700/60 p-1 gap-2 shadow-lg">
      <div className="flex items-center gap-1.5 px-2 text-tactical-400 border-r border-tactical-700/60 pr-3">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-[10px] font-mono tracking-wider">FILTERS</span>
      </div>

      {/* Crime Type Filter */}
      <div className="flex items-center gap-1">
        <select
          value={filters.crimeType}
          onChange={(e) => onChange({ ...filters, crimeType: e.target.value as MapFilters['crimeType'] })}
          className="bg-tactical-800 text-tactical-200 text-xxs font-mono rounded px-2 py-1 outline-none border border-tactical-700 hover:border-accent-cyan/50 focus:border-accent-cyan transition-colors"
        >
          <option value="ALL">ALL CRIME TYPES</option>
          <option value="HEINOUS">HEINOUS ONLY (G1, G2)</option>
          <option value="NON_HEINOUS">NON-HEINOUS</option>
        </select>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-1 pl-2 border-l border-tactical-700/60">
        <Calendar className="w-3.5 h-3.5 text-tactical-400" />
        <select
          value={filters.dateRange}
          onChange={(e) => onChange({ ...filters, dateRange: e.target.value as MapFilters['dateRange'] })}
          className="bg-tactical-800 text-tactical-200 text-xxs font-mono rounded px-2 py-1 outline-none border border-tactical-700 hover:border-accent-cyan/50 focus:border-accent-cyan transition-colors"
        >
          <option value="ALL">ALL TIME</option>
          <option value="LAST_7_DAYS">LAST 7 DAYS</option>
          <option value="LAST_30_DAYS">LAST 30 DAYS</option>
          <option value="THIS_YEAR">THIS YEAR</option>
        </select>
      </div>
    </div>
  );
}
