
interface LegendItemProps {
  color: string;
  label: string;
  sublabel?: string;
}

function LegendItem({ color, label, sublabel }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-sm shrink-0" 
        style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}60` }}
      />
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-tactical-200">{label}</span>
        {sublabel && <span className="text-[8px] font-mono text-tactical-500 -mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}

interface MapLegendProps {
  mode: 'TACTICAL' | 'DENSITY' | 'ARCS';
  choroplethStats?: { minCount: number; maxCount: number; mid: number; midLow: number } | null;
  crimeType?: string;
}

export function MapLegend({ mode, choroplethStats, crimeType }: MapLegendProps) {
  if (mode === 'TACTICAL') {
    return (
      <div className="absolute bottom-6 right-12 z-20 bg-tactical-900/90 backdrop-blur rounded border border-tactical-700/60 p-2 shadow-lg">
        <div className="text-[9px] font-mono text-tactical-500 tracking-wider mb-2 uppercase">Incident Threat Level</div>
        <div className="space-y-1.5">
          <LegendItem color="#ff3333" label="CRITICAL" sublabel="Heinous, Active Threat" />
          <LegendItem color="#ffb347" label="HIGH" sublabel="Severe, Warrants Attention" />
          <LegendItem color="#00f0ff" label="MEDIUM" sublabel="Standard Priority" />
          <LegendItem color="#ffffff" label="LOW" sublabel="Routine/Resolved" />
        </div>
      </div>
    );
  }

  if (mode === 'DENSITY') {
    const label = crimeType === 'HEINOUS' ? 'Heinous Crime Density' : 'Total Crime Density';
    return (
      <div className="absolute bottom-6 right-12 z-20 bg-tactical-900/90 backdrop-blur rounded border border-tactical-700/60 p-2 shadow-lg w-44">
        <div className="text-[9px] font-mono text-tactical-500 tracking-wider mb-2 uppercase">{label}</div>
        <div className="h-2.5 w-full rounded mb-1.5" style={{
          background: 'linear-gradient(to right, #10B981, #F59E0B, #EF4444, #7F1D1D)'
        }} />
        {choroplethStats ? (
          <div className="flex justify-between text-[8px] font-mono">
            <span className="text-emerald-400">{choroplethStats.minCount}</span>
            <span className="text-amber-400">{choroplethStats.midLow}</span>
            <span className="text-red-400">{choroplethStats.mid}</span>
            <span style={{color:'#7F1D1D'}}>{choroplethStats.maxCount}</span>
          </div>
        ) : (
          <div className="flex justify-between text-[8px] font-mono text-tactical-400">
            <span>LOW</span>
            <span>HIGH</span>
          </div>
        )}
        <div className="mt-1.5 border-t border-tactical-700/60 pt-1.5 space-y-1">
          <LegendItem color="#10B981" label="Low" sublabel="Fewer incidents" />
          <LegendItem color="#F59E0B" label="Moderate" sublabel="Average activity" />
          <LegendItem color="#EF4444" label="High" sublabel="Elevated crime rate" />
          <LegendItem color="#7F1D1D" label="Critical" sublabel="Hotspot district" />
        </div>
      </div>
    );
  }

  if (mode === 'ARCS') {
    return (
      <div className="absolute bottom-6 right-12 z-20 bg-tactical-900/90 backdrop-blur rounded border border-tactical-700/60 p-2 shadow-lg">
        <div className="text-[9px] font-mono text-tactical-500 tracking-wider mb-2 uppercase">Network Link Severity</div>
        <div className="space-y-1.5">
          <LegendItem color="#EF4444" label="CRITICAL" sublabel="High-profile co-accused" />
          <LegendItem color="#F59E0B" label="HIGH" sublabel="Repeated association" />
          <LegendItem color="#10B981" label="STANDARD" sublabel="Single association" />
        </div>
      </div>
    );
  }

  return null;
}
