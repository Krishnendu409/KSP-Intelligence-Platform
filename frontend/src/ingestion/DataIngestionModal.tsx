import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, X, FileSpreadsheet } from 'lucide-react';
import { apiFetch } from '../shared/api/apiFetch';

export interface DataIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DataIngestionModal: React.FC<DataIngestionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'CSV' | 'PDF'>('CSV');
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setInputContent(String(evt.target.result));
        setErrorMsg(null);
      }
    };
    if (mode === 'PDF') {
      // For basic PDF text demo or base64 representation
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleIngest = async () => {
    if (!inputContent.trim()) {
      setErrorMsg(`Please paste raw ${mode} content or upload a file first.`);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setResultMsg(null);

    try {
      const endpoint = mode === 'CSV' ? '/api/ingestion/csv' : '/api/ingestion/pdf';
      const payload = mode === 'CSV' 
        ? { csvText: inputContent } 
        : { pdfText: inputContent, metadata: { source: 'WEB_UPLOAD', uploadedAt: new Date().toISOString() } };

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ingestion failed on server.');
      }

      setResultMsg(data.message || `Successfully ingested ${data.processedCount || 'all'} records into SQLite graph.`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Network communication error during ingestion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-tactical-900 border border-tactical-600 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3 bg-tactical-950 border-b border-tactical-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-white tracking-wider">
                AUTOMATED DATA INGESTION PIPELINE
              </h2>
              <p className="text-xxs font-mono text-tactical-400">
                Direct SQLite Graph & CCTNS Structured Evidence Extraction
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded bg-tactical-900 hover:bg-tactical-800 text-tactical-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-tactical-800 bg-tactical-900 px-5 pt-3 gap-2">
          <button
            onClick={() => { setMode('CSV'); setInputContent(''); setErrorMsg(null); setResultMsg(null); }}
            className={`px-4 py-2 font-mono text-xs rounded-t flex items-center gap-2 border-t border-x ${
              mode === 'CSV' 
                ? 'bg-tactical-800 text-accent-cyan border-tactical-600 font-bold' 
                : 'bg-tactical-950 text-tactical-400 border-transparent hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV BATCH UPLOAD</span>
          </button>
          <button
            onClick={() => { setMode('PDF'); setInputContent(''); setErrorMsg(null); setResultMsg(null); }}
            className={`px-4 py-2 font-mono text-xs rounded-t flex items-center gap-2 border-t border-x ${
              mode === 'PDF' 
                ? 'bg-tactical-800 text-accent-cyan border-tactical-600 font-bold' 
                : 'bg-tactical-950 text-tactical-400 border-transparent hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF FIR EXTRACTION</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-3 bg-tactical-950/80 rounded border border-tactical-800 text-xxs font-mono text-tactical-300">
            {mode === 'CSV' 
              ? 'Paste standard CCTNS CSV export or click below to select a .csv file. Columns should include: District, PoliceStation, Year, FIRNumber, Section, VictimName, AccusedName.' 
              : 'Paste OCR/Text extracted from an official PDF FIR document or select a text file. Our offline regex pattern matching engine will deterministically isolate Accused, Victim, sections, and locations without LLM hallucinations.'
            }
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 text-white font-mono text-xs flex items-center gap-2 transition-all">
              <Upload className="w-4 h-4 text-accent-cyan" />
              <span>Select {mode} File...</span>
              <input type="file" accept={mode === 'CSV' ? '.csv,.txt' : '.pdf,.txt'} onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="font-mono text-xs text-tactical-400">or paste content directly below:</span>
          </div>

          <textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={mode === 'CSV' ? 'Paste raw CSV data or select file...' : 'Paste PDF extracted text here...'}
            className="w-full h-44 p-3 rounded bg-tactical-950 border border-tactical-700 focus:border-accent-cyan text-tactical-100 font-mono text-xs outline-none resize-none custom-scrollbar"
          />

          {errorMsg && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/40 rounded flex items-center gap-2.5 text-accent-red font-mono text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resultMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded flex items-center gap-2.5 text-emerald-400 font-mono text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{resultMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-tactical-950 border-t border-tactical-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-tactical-900 hover:bg-tactical-800 border border-tactical-700 text-tactical-400 hover:text-white font-mono text-xs transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleIngest}
            disabled={loading || !inputContent.trim()}
            className="px-5 py-1.5 rounded bg-accent-cyan text-tactical-950 hover:bg-white font-mono text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-tactical-950" /> : <Upload className="w-4 h-4 text-tactical-950" />}
            <span>START AUTOMATED INGESTION</span>
          </button>
        </div>

      </div>
    </div>
  );
};
