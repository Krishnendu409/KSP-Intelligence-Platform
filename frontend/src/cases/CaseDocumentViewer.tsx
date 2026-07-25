import React, { useState, useEffect } from 'react';
import { FileText, Upload, Plus, AlertCircle, Shield } from 'lucide-react';
import { apiFetch } from '../shared/api/apiFetch';

export interface CaseDocumentViewerProps {
  caseId: string | number;
}

export const CaseDocumentViewer: React.FC<CaseDocumentViewerProps> = ({ caseId }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [_loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('HANDWRITTEN_OCR');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cleanedId = String(caseId).replace(/^CASE-/i, '');

  const fetchDocuments = () => {
    setLoading(true);
    apiFetch(`/api/cases/${cleanedId}/documents`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          setDocuments([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch case documents', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, [cleanedId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!title.trim()) {
      setTitle(file.name);
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setContent(String(evt.target.result));
      }
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      setError('Please provide a title and document contents.');
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/cases/${cleanedId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: title || 'Uploaded Document',
          documentType: docType,
          content: content,
          fileSize: content.length
        })
      });
      const data = await res.json();
      if (data && data.success && data.document) {
        setDocuments(prev => [data.document, ...prev]);
        setTitle('');
        setContent('');
      } else {
        throw new Error(data.error || 'Failed to attach document to case.');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-tactical-900 border border-tactical-700 rounded-lg overflow-hidden my-4">
      {/* Header */}
      <div className="px-4 py-2.5 bg-tactical-950 border-b border-tactical-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            CASE EVIDENCE & DOCUMENT REPOSITORY ({documents.length})
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-accent-cyan/10 text-accent-cyan px-2 py-0.5 rounded border border-accent-cyan/20">
          SECURE CASE-{cleanedId} VAULT
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Form */}
        <form onSubmit={handleUploadSubmit} className="space-y-3 bg-tactical-950/60 p-3.5 rounded border border-tactical-800/80">
          <h4 className="font-mono text-xxs font-bold text-tactical-300 uppercase tracking-wider">
            ATTACH EVIDENCE OR HANDWRITTEN FIR SCAN
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Document Title (e.g. Forensic Report, Scan)"
              className="px-2.5 py-1.5 rounded bg-tactical-900 border border-tactical-700 text-xs font-mono text-white focus:border-accent-cyan outline-none w-full"
            />
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="px-2 py-1.5 rounded bg-tactical-900 border border-tactical-700 text-xs font-mono text-white outline-none"
            >
              <option value="HANDWRITTEN_OCR">Handwritten FIR (OCR)</option>
              <option value="FORENSIC_REPORT">Forensic Report (PDF)</option>
              <option value="WITNESS_STATEMENT">Witness Statement</option>
              <option value="SEIZURE_MEMO">Seizure / Panchnama Memo</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 text-xxs font-mono text-tactical-400">
            <span>Select File (.txt, .pdf, .csv) or paste content:</span>
            <label className="cursor-pointer bg-tactical-800 hover:bg-tactical-700 text-accent-cyan px-2 py-1 rounded border border-tactical-600 flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>Browse...</span>
              <input type="file" accept=".txt,.pdf,.csv,.md" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste OCR text or document notes..."
            className="w-full h-24 p-2.5 rounded bg-tactical-900 border border-tactical-700 text-xs font-mono text-tactical-100 outline-none resize-none"
          />

          {error && (
            <div className="flex items-center gap-1.5 text-accent-red font-mono text-xxs bg-accent-red/10 p-2 rounded">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || (!title.trim() && !content.trim())}
            className="w-full py-2 rounded bg-accent-cyan hover:bg-white text-tactical-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{isUploading ? 'UPLOADING...' : 'UPLOAD EVIDENCE'}</span>
          </button>
        </form>

        {/* Documents Ledger */}
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          <h4 className="font-mono text-xxs font-bold text-tactical-400 uppercase tracking-wider">
            ATTACHED CASE FILES
          </h4>
          {documents.length === 0 ? (
            <div className="p-8 border border-dashed border-tactical-800 rounded flex flex-col items-center justify-center text-tactical-500 font-mono text-xs text-center">
              <Shield className="w-8 h-8 mb-2 text-tactical-700" />
              <span>No evidence files or handwritten FIR scans uploaded to Case-{cleanedId} yet.</span>
            </div>
          ) : (
            documents.map((doc: any, idx: number) => (
              <div key={doc.id || idx} className="p-3 bg-tactical-950 rounded border border-tactical-800 space-y-2 hover:border-tactical-600 transition-colors">
                <div className="flex items-start justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-accent-cyan">{doc.documentTitle}</span>
                    <span className="text-xxs px-1.5 py-0.5 rounded bg-tactical-800 text-tactical-300">
                      {doc.documentType}
                    </span>
                  </div>
                  <span className="text-xxs text-tactical-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
                {doc.content && (
                  <p className="font-mono text-xxs text-tactical-300 line-clamp-3 bg-tactical-900/50 p-2 rounded border border-tactical-800">
                    {doc.content}
                  </p>
                )}
                <div className="flex items-center justify-between text-xxs font-mono text-tactical-500 pt-1 border-t border-tactical-900">
                  <span>Uploaded by: <strong className="text-tactical-300">{doc.uploadedBy || 'Field Officer'}</strong></span>
                  <span>Size: {doc.fileSize ? `${doc.fileSize} B` : 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
