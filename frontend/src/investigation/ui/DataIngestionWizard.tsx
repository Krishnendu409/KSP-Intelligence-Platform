import React, { useState } from 'react';
import { dataIngestionEngine } from '../engine/DataIngestionEngine';
import type { RowValidationError, IngestionResult } from '../engine/DataIngestionEngine';

interface DataIngestionWizardProps {
  investigationId: string;
  officerId: string;
  onClose: () => void;
}

export const DataIngestionWizard: React.FC<DataIngestionWizardProps> = ({
  investigationId,
  officerId,
  onClose
}) => {
  const [sourceFileName, setSourceFileName] = useState('CDR_Export_July.csv');
  const [rawDatasetInput, setRawDatasetInput] = useState('[]');
  const [validationErrors, setValidationErrors] = useState<RowValidationError[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null);

  const handleValidate = () => {
    try {
      const rows = JSON.parse(rawDatasetInput);
      if (!Array.isArray(rows)) {
        setValidationErrors([{ rowNumber: 0, field: 'dataset', message: 'Input must be a JSON array of rows' }]);
        setIsValidated(false);
        return;
      }

      const errors: RowValidationError[] = [];
      rows.forEach((row, idx) => {
        const val = dataIngestionEngine.validateRow(row, idx + 1);
        if (!val.isValid) {
          errors.push(...val.errors);
        }
      });

      setValidationErrors(errors);
      setParsedRows(rows);
      setIsValidated(errors.length === 0);
    } catch (e: any) {
      setValidationErrors([{ rowNumber: 0, field: 'syntax', message: e.message || 'Invalid JSON format' }]);
      setIsValidated(false);
    }
  };

  const handleIngest = () => {
    if (!isValidated || parsedRows.length === 0) return;

    const result = dataIngestionEngine.ingestDataset({
      investigationId,
      sourceFileName,
      officerId,
      rows: parsedRows
    });

    setIngestionResult(result);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full p-6 flex flex-col gap-6 text-slate-100">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-sky-400">Enterprise Data Ingestion Wizard</h2>
            <p className="text-xs text-slate-400">
              Capability Increment 3: Evidence Intelligence & Provenance Stamping
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Domain Data Source (File Name or Stream ID)</label>
            <input
              type="text"
              value={sourceFileName}
              onChange={(e) => setSourceFileName(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Raw Dataset Rows (Tabular JSON Array)</label>
            <textarea
              data-testid="raw-dataset-input"
              rows={6}
              value={rawDatasetInput}
              onChange={(e) => {
                setRawDatasetInput(e.target.value);
                setIsValidated(false);
              }}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 font-mono text-xs text-white"
            />
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded p-3 text-xs text-rose-300">
              <p className="font-bold">Validation Errors Found:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>
                    Row {err.rowNumber} [{err.field}]: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isValidated && (
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded p-3 text-xs text-emerald-300">
              Validation Passed: {parsedRows.length} records ready for provenance stamping & ingestion.
            </div>
          )}

          {ingestionResult && (
            <div className="bg-sky-950/40 border border-sky-800/60 rounded p-3 text-xs text-sky-200">
              <p className="font-bold">
                Successfully Ingested {ingestionResult.successfulCount} Entities
              </p>
              <p className="text-slate-300 mt-1">
                Duplicates Detected: {ingestionResult.duplicateCount} | Officer Attribution: {officerId}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={handleValidate}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm font-semibold border border-slate-600"
          >
            Validate & Preview Schema
          </button>
          <button
            onClick={handleIngest}
            disabled={!isValidated}
            className={`px-4 py-2 rounded text-sm font-semibold transition ${
              isValidated
                ? 'bg-sky-600 hover:bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Stamp Provenance & Ingest
          </button>
        </div>
      </div>
    </div>
  );
};
