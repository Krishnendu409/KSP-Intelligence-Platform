import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useToastStore } from '../../workspace/store/useToastStore';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 w-80 p-4 rounded-lg shadow-2xl border backdrop-blur-md animate-fade-in
            ${toast.type === 'success' ? 'bg-accent-green/10 border-accent-green/50 text-accent-green' : ''}
            ${toast.type === 'warning' ? 'bg-accent-amber/10 border-accent-amber/50 text-accent-amber' : ''}
            ${toast.type === 'error' ? 'bg-accent-red/10 border-accent-red/50 text-accent-red' : ''}
            ${toast.type === 'info' ? 'bg-accent-cyan/10 border-accent-cyan/50 text-accent-cyan' : ''}
          `}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
          </div>
          <div className="flex-1 font-mono text-sm leading-tight text-tactical-100">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity hover:bg-black/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
