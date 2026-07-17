import React from 'react';
import { operationalEventBus } from '../events/OperationalEventBus';

interface OperationalJournalDrawerProps {
  investigationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OperationalJournalDrawer: React.FC<OperationalJournalDrawerProps> = ({
  investigationId,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const events = operationalEventBus.getEventHistory(investigationId);

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col text-slate-100">
      <div className="flex justify-between items-center border-b border-slate-800 p-4">
        <div>
          <h3 className="text-base font-bold text-sky-400">Operational Event Stream Journal</h3>
          <p className="text-xs text-slate-400">Immutable chronological record of investigation actions</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white px-2 py-1 text-xs border border-slate-700 rounded"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {events.length === 0 ? (
          <div className="text-sm text-slate-500 italic text-center py-8">
            No operational events logged for this investigation yet.
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 flex flex-col gap-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  {event.eventType}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-slate-200 font-medium">{event.summary}</p>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-700/50">
                <span>Officer: {event.officerId}</span>
                <span>ID: {event.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
