import React, { useState } from 'react';
import { intelligenceAuthoringEngine } from '../engine/IntelligenceAuthoringEngine';
import type { IntelligenceItemType } from '../engine/IntelligenceAuthoringEngine';

interface IntelligenceAuthoringModalProps {
  investigationId: string;
  officerId: string;
  onClose: () => void;
}

export const IntelligenceAuthoringModal: React.FC<IntelligenceAuthoringModalProps> = ({
  investigationId,
  officerId,
  onClose
}) => {
  const [itemType, setItemType] = useState<IntelligenceItemType>('RECOVERED_WEAPON');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [natoAdmiraltyGrade, setNatoAdmiraltyGrade] = useState('B2');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const handleAuthor = () => {
    if (!title.trim() || !details.trim()) return;

    intelligenceAuthoringEngine.authorIntelligence({
      investigationId,
      itemType,
      title,
      details,
      natoAdmiraltyGrade,
      authoredByOfficerId: officerId
    });

    setPublishedSuccess(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-6 text-slate-100">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-sky-400">Field Intelligence Authoring Workbench</h2>
            <p className="text-xs text-slate-400">
              Capability Increment 4: First-Class Operational Intelligence Objects
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 rounded border border-slate-700"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Intelligence Item Type</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as IntelligenceItemType)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
              >
                <option value="RECOVERED_WEAPON">RECOVERED WEAPON</option>
                <option value="PHONE_INTERCEPTION">PHONE INTERCEPTION</option>
                <option value="OBSERVATION">OBSERVATION</option>
                <option value="LEAD">LEAD</option>
                <option value="TIP">TIP</option>
                <option value="SURVEILLANCE_LOG">SURVEILLANCE LOG</option>
                <option value="INFORMANT_REPORT">INFORMANT REPORT</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">NATO Admiralty Grading</label>
              <select
                value={natoAdmiraltyGrade}
                onChange={(e) => setNatoAdmiraltyGrade(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
              >
                <option value="A1">A1 - Completely Reliable / Confirmed</option>
                <option value="B2">B2 - Usually Reliable / Probably True</option>
                <option value="C3">C3 - Fairly Reliable / Possibly True</option>
                <option value="D4">D4 - Not Usually Reliable / Doubtful</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Title / Headline Summary</label>
            <input
              type="text"
              data-testid="intel-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Recovered Burner SIM Card"
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Evidentiary Field Notes & Context Details</label>
            <textarea
              rows={4}
              data-testid="intel-details-input"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Detailed operational context, seizure location, or transcript excerpt..."
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            />
          </div>

          {publishedSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded p-3 text-xs text-emerald-300">
              Successfully published intelligence item [{itemType}] to operational event stream.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm font-semibold border border-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleAuthor}
            disabled={!title.trim() || !details.trim()}
            className={`px-4 py-2 rounded text-sm font-semibold transition ${
              title.trim() && details.trim()
                ? 'bg-sky-600 hover:bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Author & Publish Intelligence
          </button>
        </div>
      </div>
    </div>
  );
};
