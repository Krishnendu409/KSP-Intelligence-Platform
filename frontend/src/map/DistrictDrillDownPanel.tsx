import { useEffect, useState } from 'react';
import { apiFetch } from '../shared/api/apiFetch';
import { X, Map, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

interface DistrictDrillDownPanelProps {
  district: { id: string; name: string; count: number; lat: number; lng: number } | null;
  onClose: () => void;
}

export function DistrictDrillDownPanel({ district, onClose }: DistrictDrillDownPanelProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!district) return;
    setLoading(true);
    apiFetch(`/api/districts/${encodeURIComponent(district.name)}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch district stats:", err);
        setLoading(false);
      });
  }, [district]);

  if (!district) return null;

  return (
    <div className="absolute top-16 right-4 w-80 bg-tactical-900/95 border border-tactical-600 rounded shadow-2xl z-50 backdrop-blur-md animate-slide-in-right flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between p-3 border-b border-tactical-700">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-accent-cyan" />
          <h3 className="text-white font-mono font-bold text-sm">{district.name}</h3>
        </div>
        <button onClick={onClose} className="text-tactical-400 hover:text-white p-1 rounded hover:bg-tactical-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-tactical-950 border border-tactical-800 p-2 rounded">
            <div className="text-[9px] text-tactical-500 font-mono tracking-wider mb-1">TOTAL FIRS</div>
            <div className="text-lg font-mono font-bold text-white">{district.count}</div>
          </div>
          <div className="bg-tactical-950 border border-tactical-800 p-2 rounded">
            <div className="text-[9px] text-tactical-500 font-mono tracking-wider mb-1">TREND (30D)</div>
            <div className="text-lg font-mono font-bold text-accent-red flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> {stats?.trend || '...'}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-6 text-tactical-500 font-mono text-xs animate-pulse">
            Loading district intel...
          </div>
        ) : stats ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-tactical-400 font-mono tracking-wider mb-2 uppercase border-b border-tactical-800 pb-1">
                <AlertTriangle className="w-3 h-3 text-accent-amber" /> Severity Breakdown
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-mono text-tactical-200 mb-1">
                    <span>Heinous</span>
                    <span className="text-accent-red font-bold">{stats.heinousCount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-tactical-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-red" style={{ width: `${(stats.heinousCount / district.count) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono text-tactical-200 mb-1">
                    <span>Non-Heinous</span>
                    <span className="text-accent-amber font-bold">{stats.nonHeinousCount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-tactical-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-amber" style={{ width: `${(stats.nonHeinousCount / district.count) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-tactical-400 font-mono tracking-wider mb-2 uppercase border-b border-tactical-800 pb-1">
                <BarChart3 className="w-3 h-3 text-accent-cyan" /> Top Crime Types
              </div>
              <div className="space-y-1.5">
                {stats.topCrimes.map((crime: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-tactical-950 p-2 rounded border border-tactical-800">
                    <span className="text-xs font-mono text-tactical-200">{crime.type}</span>
                    <span className="text-xs font-mono font-bold text-accent-cyan">{crime.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
