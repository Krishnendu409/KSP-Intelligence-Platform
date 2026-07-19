import { X, Command } from 'lucide-react';
import { useEffect, useState } from 'react';

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + / is '?'
      if (e.key === '?' && e.shiftKey && e.target instanceof HTMLElement && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-tactical-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-tactical-900 border border-tactical-600 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-tactical-700 bg-tactical-900/50">
          <div className="flex items-center gap-2 text-accent-cyan">
            <Command className="w-5 h-5" />
            <span className="font-mono text-sm font-bold tracking-widest uppercase">System Hotkeys</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-tactical-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2">
            
            <div className="flex justify-between items-center py-2 border-b border-tactical-800">
              <span className="text-tactical-200 font-mono text-xs">Open Command Palette</span>
              <kbd className="bg-tactical-800 border border-tactical-600 text-tactical-300 px-2 py-0.5 rounded font-mono text-xs shadow">Ctrl + K</kbd>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-tactical-800">
              <span className="text-tactical-200 font-mono text-xs">Toggle AI Copilot</span>
              <kbd className="bg-tactical-800 border border-tactical-600 text-tactical-300 px-2 py-0.5 rounded font-mono text-xs shadow">Ctrl + J</kbd>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-tactical-800">
              <span className="text-tactical-200 font-mono text-xs">Close active overlays / modals</span>
              <kbd className="bg-tactical-800 border border-tactical-600 text-tactical-300 px-2 py-0.5 rounded font-mono text-xs shadow">Esc</kbd>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-tactical-800">
              <span className="text-tactical-200 font-mono text-xs">Show this shortcuts menu</span>
              <kbd className="bg-tactical-800 border border-tactical-600 text-tactical-300 px-2 py-0.5 rounded font-mono text-xs shadow">Shift + / (?)</kbd>
            </div>
          </div>
        </div>
        
        <div className="bg-tactical-950 p-3 border-t border-tactical-700 text-center font-mono text-[10px] text-tactical-500 uppercase tracking-widest">
          Karnataka State Police • Tactical Intelligence Hub
        </div>
      </div>
    </div>
  );
}
