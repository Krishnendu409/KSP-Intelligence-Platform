import { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Users, Camera, Radio } from 'lucide-react';

export function SystemKPIStrip() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/firs/summary')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch KPIs:", err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  if (loading || !stats) {
    return (
      <div className="shrink-0 bg-tactical-950 border-b border-tactical-700/60 px-4 py-2 flex items-center justify-between">
        <div className="text-xs font-mono text-tactical-400">SYSTEM METRICS: Loading...</div>
      </div>
    );
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

  return (
    <div className="shrink-0 bg-tactical-950 border-b border-tactical-700/60 px-4 py-2 flex items-center gap-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-tactical-500" />
        <div className="flex flex-col">
          <span className="text-[9px] text-tactical-500 font-mono tracking-widest">TOTAL CASES</span>
          <span className="text-xs font-mono font-bold text-white">{formatNumber(stats.totalCases)}</span>
        </div>
      </div>
      
      <div className="h-6 w-px bg-tactical-800" />

      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-accent-red" />
        <div className="flex flex-col">
          <span className="text-[9px] text-tactical-500 font-mono tracking-widest">HEINOUS</span>
          <span className="text-xs font-mono font-bold text-accent-red">{formatNumber(stats.heinousCases)}</span>
        </div>
      </div>

      <div className="h-6 w-px bg-tactical-800" />

      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-accent-amber" />
        <div className="flex flex-col">
          <span className="text-[9px] text-tactical-500 font-mono tracking-widest">SUSPECTS</span>
          <span className="text-xs font-mono font-bold text-accent-amber">{formatNumber(stats.suspectsTracked)}</span>
        </div>
      </div>

      <div className="h-6 w-px bg-tactical-800" />

      <div className="flex items-center gap-2">
        <Camera className={`w-4 h-4 ${stats.anprCameras !== undefined ? 'text-accent-cyan' : 'text-tactical-600'}`} />
        <div className="flex flex-col">
          <span className="text-[9px] text-tactical-500 font-mono tracking-widest">ANPR</span>
          <span className={`text-xs font-mono font-bold ${stats.anprCameras !== undefined ? 'text-accent-cyan' : 'text-tactical-600'}`}>
            {stats.anprCameras !== undefined ? formatNumber(stats.anprCameras) : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="h-6 w-px bg-tactical-800" />

      <div className="flex items-center gap-2">
        <Radio className={`w-4 h-4 ${stats.cellTowers !== undefined ? 'text-purple-400' : 'text-tactical-600'}`} />
        <div className="flex flex-col">
          <span className="text-[9px] text-tactical-500 font-mono tracking-widest">CELL TOWERS</span>
          <span className={`text-xs font-mono font-bold ${stats.cellTowers !== undefined ? 'text-purple-400' : 'text-tactical-600'}`}>
            {stats.cellTowers !== undefined ? formatNumber(stats.cellTowers) : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
}
