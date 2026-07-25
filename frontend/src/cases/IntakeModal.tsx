import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { apiFetch } from '../shared/api/apiFetch';

interface Lookups {
  caseCategories: { CaseCategoryID: number; LookupValue: string }[];
  gravityOffences: { GravityOffenceID: number; LookupValue: string }[];
  crimeHeads: { CrimeHeadID: number; CrimeGroupName: string }[];
  crimeSubHeads: { CrimeSubHeadID: number; CrimeHeadID: number; name: string }[];
  acts: { ActCode: string; ActDescription: string; ShortName: string }[];
  genders: { GenderID: number; label: string }[];
}

interface PersonRow {
  name: string;
  age: string;
  genderId: string;
}

interface SectionRow {
  actCode: string;
  sectionCode: string;
}

const emptyPerson = (): PersonRow => ({ name: '', age: '', genderId: '' });

export function IntakeModal({ onClose, onCreated }: { onClose: () => void; onCreated: (caseId: number) => void }) {
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [sectionsByAct, setSectionsByAct] = useState<Record<string, { SectionCode: string; SectionDescription: string }[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [caseCategoryId, setCaseCategoryId] = useState('');
  const [gravityOffenceId, setGravityOffenceId] = useState('');
  const [crimeMajorHeadId, setCrimeMajorHeadId] = useState('');
  const [crimeMinorHeadId, setCrimeMinorHeadId] = useState('');
  const [briefFacts, setBriefFacts] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [accused, setAccused] = useState<PersonRow[]>([emptyPerson()]);
  const [victims, setVictims] = useState<PersonRow[]>([emptyPerson()]);
  const [sections, setSections] = useState<SectionRow[]>([{ actCode: '', sectionCode: '' }]);
  const [documents, setDocuments] = useState<{name: string, file: File | null}[]>([]);

  useEffect(() => {
    apiFetch('/api/lookups')
      .then((res) => res.json())
      .then(setLookups)
      .catch(() => setError('Failed to load form reference data from the backend.'));
  }, []);

  const loadSectionsForAct = async (actCode: string) => {
    if (!actCode || sectionsByAct[actCode]) return;
    const res = await apiFetch(`/api/lookups/sections/${encodeURIComponent(actCode)}`);
    if (res.ok) {
      const data = await res.json();
      setSectionsByAct((prev) => ({ ...prev, [actCode]: data }));
    }
  };

  const availableMinorHeads = lookups?.crimeSubHeads.filter((s) => String(s.CrimeHeadID) === crimeMajorHeadId) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!caseCategoryId || !gravityOffenceId || !crimeMajorHeadId || !crimeMinorHeadId || !briefFacts.trim()) {
      setError('Case category, gravity, crime head/sub-head, and brief facts are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseCategoryId: Number(caseCategoryId),
          gravityOffenceId: Number(gravityOffenceId),
          crimeMajorHeadId: Number(crimeMajorHeadId),
          crimeMinorHeadId: Number(crimeMinorHeadId),
          briefFacts,
          incidentDate: incidentDate ? new Date(incidentDate).toISOString() : null,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          accused: accused.filter((a) => a.name.trim()).map((a) => ({
            name: a.name, age: a.age ? Number(a.age) : null, genderId: a.genderId ? Number(a.genderId) : null,
          })),
          victims: victims.filter((v) => v.name.trim()).map((v) => ({
            name: v.name, age: v.age ? Number(v.age) : null, genderId: v.genderId ? Number(v.genderId) : null,
          })),
          sections: sections.filter((s) => s.actCode && s.sectionCode),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Intake failed');
      onCreated(data.caseId);
    } catch (err: any) {
      setError(err.message || 'Failed to register case.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePersonRow = (rows: PersonRow[], setRows: (r: PersonRow[]) => void, idx: number, field: keyof PersonRow, value: string) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [field]: value };
    setRows(next);
  };

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-tactical-900 border border-tactical-700 rounded p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-mono font-bold text-lg flex items-center gap-2">
            <PlusCircle className="text-accent-cyan w-5 h-5" />
            REGISTER NEW FIR
          </h2>
          <button onClick={onClose} className="text-tactical-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {!lookups ? (
          <div className="text-tactical-400 font-mono text-sm">Loading reference data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xxs font-mono text-tactical-400 uppercase">Case Category *</label>
                <select value={caseCategoryId} onChange={(e) => setCaseCategoryId(e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1.5 text-xs font-mono text-white">
                  <option value="">Select...</option>
                  {lookups.caseCategories.map((c) => <option key={c.CaseCategoryID} value={c.CaseCategoryID}>{c.LookupValue}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xxs font-mono text-tactical-400 uppercase">Gravity *</label>
                <select value={gravityOffenceId} onChange={(e) => setGravityOffenceId(e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1.5 text-xs font-mono text-white">
                  <option value="">Select...</option>
                  {lookups.gravityOffences.map((g) => <option key={g.GravityOffenceID} value={g.GravityOffenceID}>{g.LookupValue}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xxs font-mono text-tactical-400 uppercase">Crime Major Head *</label>
                <select value={crimeMajorHeadId} onChange={(e) => { setCrimeMajorHeadId(e.target.value); setCrimeMinorHeadId(''); }} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1.5 text-xs font-mono text-white">
                  <option value="">Select...</option>
                  {lookups.crimeHeads.map((c) => <option key={c.CrimeHeadID} value={c.CrimeHeadID}>{c.CrimeGroupName}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xxs font-mono text-tactical-400 uppercase">Crime Minor Head *</label>
                <select value={crimeMinorHeadId} onChange={(e) => setCrimeMinorHeadId(e.target.value)} disabled={!crimeMajorHeadId} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1.5 text-xs font-mono text-white disabled:opacity-40">
                  <option value="">Select...</option>
                  {availableMinorHeads.map((s) => <option key={s.CrimeSubHeadID} value={s.CrimeSubHeadID}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xxs font-mono text-tactical-400 uppercase">Incident Date</label>
                <input type="datetime-local" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1.5 text-xs font-mono text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-mono text-tactical-400 uppercase">Latitude</label>
                  <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1.5 text-xs font-mono text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xxs font-mono text-tactical-400 uppercase">Longitude</label>
                  <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1.5 text-xs font-mono text-white" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xxs font-mono text-tactical-400 uppercase">Brief Facts *</label>
              <textarea value={briefFacts} onChange={(e) => setBriefFacts(e.target.value)} rows={3} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1.5 text-xs font-mono text-white resize-none" placeholder="Case narrative, as reported..." />
            </div>

            {/* Accused */}
            <div className="border-t border-tactical-700 pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xxs font-mono text-accent-amber uppercase font-bold">Accused</label>
                <button type="button" onClick={() => setAccused([...accused, emptyPerson()])} className="text-xxs text-accent-cyan hover:underline">+ Add</button>
              </div>
              {accused.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_100px_28px] gap-2 mb-1.5">
                  <input placeholder="Name" value={row.name} onChange={(e) => updatePersonRow(accused, setAccused, idx, 'name', e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1 text-xs font-mono text-white" />
                  <input placeholder="Age" type="number" value={row.age} onChange={(e) => updatePersonRow(accused, setAccused, idx, 'age', e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1 text-xs font-mono text-white" />
                  <select value={row.genderId} onChange={(e) => updatePersonRow(accused, setAccused, idx, 'genderId', e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-1 py-1 text-xs font-mono text-white">
                    <option value="">Gender</option>
                    {lookups.genders.map((g) => <option key={g.GenderID} value={g.GenderID}>{g.label}</option>)}
                  </select>
                  <button type="button" onClick={() => setAccused(accused.filter((_, i) => i !== idx))} className="text-tactical-500 hover:text-accent-red"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>

            {/* Victims */}
            <div className="border-t border-tactical-700 pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xxs font-mono text-accent-cyan uppercase font-bold">Victims</label>
                <button type="button" onClick={() => setVictims([...victims, emptyPerson()])} className="text-xxs text-accent-cyan hover:underline">+ Add</button>
              </div>
              {victims.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_100px_28px] gap-2 mb-1.5">
                  <input placeholder="Name" value={row.name} onChange={(e) => updatePersonRow(victims, setVictims, idx, 'name', e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1 text-xs font-mono text-white" />
                  <input placeholder="Age" type="number" value={row.age} onChange={(e) => updatePersonRow(victims, setVictims, idx, 'age', e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1 text-xs font-mono text-white" />
                  <select value={row.genderId} onChange={(e) => updatePersonRow(victims, setVictims, idx, 'genderId', e.target.value)} className="bg-tactical-950 border border-tactical-600 rounded px-1 py-1 text-xs font-mono text-white">
                    <option value="">Gender</option>
                    {lookups.genders.map((g) => <option key={g.GenderID} value={g.GenderID}>{g.label}</option>)}
                  </select>
                  <button type="button" onClick={() => setVictims(victims.filter((_, i) => i !== idx))} className="text-tactical-500 hover:text-accent-red"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>

            {/* Act/Section */}
            <div className="border-t border-tactical-700 pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xxs font-mono text-tactical-300 uppercase font-bold">Act / Section</label>
                <button type="button" onClick={() => setSections([...sections, { actCode: '', sectionCode: '' }])} className="text-xxs text-accent-cyan hover:underline">+ Add</button>
              </div>
              {sections.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_28px] gap-2 mb-1.5">
                  <select
                    value={row.actCode}
                    onChange={(e) => {
                      const next = [...sections]; next[idx] = { actCode: e.target.value, sectionCode: '' }; setSections(next);
                      loadSectionsForAct(e.target.value);
                    }}
                    className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1 text-xs font-mono text-white"
                  >
                    <option value="">Act</option>
                    {lookups.acts.map((a) => <option key={a.ActCode} value={a.ActCode}>{a.ShortName || a.ActCode}</option>)}
                  </select>
                  <select
                    value={row.sectionCode}
                    onChange={(e) => { const next = [...sections]; next[idx] = { ...next[idx], sectionCode: e.target.value }; setSections(next); }}
                    disabled={!row.actCode}
                    className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1 text-xs font-mono text-white disabled:opacity-40"
                  >
                    <option value="">Section</option>
                    {(sectionsByAct[row.actCode] || []).map((s) => <option key={s.SectionCode} value={s.SectionCode}>§ {s.SectionCode} — {s.SectionDescription}</option>)}
                  </select>
                  <button type="button" onClick={() => setSections(sections.filter((_, i) => i !== idx))} className="text-tactical-500 hover:text-accent-red"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>

            {/* Supporting Documents */}
            <div className="border-t border-tactical-700 pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xxs font-mono text-tactical-300 uppercase font-bold">Supporting Documents</label>
                <button type="button" onClick={() => setDocuments([...documents, { name: '', file: null }])} className="text-xxs text-accent-cyan hover:underline">+ Add</button>
              </div>
              {documents.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_28px] gap-2 mb-1.5">
                  <input
                    placeholder="Document Title (e.g. Witness Statement)"
                    value={row.name}
                    onChange={(e) => {
                      const next = [...documents];
                      next[idx].name = e.target.value;
                      setDocuments(next);
                    }}
                    className="bg-tactical-950 border border-tactical-600 rounded px-2 py-1 text-xs font-mono text-white"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        const next = [...documents];
                        next[idx].file = file;
                        if (file && !next[idx].name) {
                          next[idx].name = file.name;
                        }
                        setDocuments(next);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="bg-tactical-950 border border-tactical-600 border-dashed hover:border-accent-cyan rounded px-2 py-1 text-xs font-mono text-tactical-400 flex items-center justify-between truncate h-full">
                      {row.file ? <span className="text-white">{row.file.name}</span> : <span>Choose File...</span>}
                    </div>
                  </div>
                  <button type="button" onClick={() => setDocuments(documents.filter((_, i) => i !== idx))} className="text-tactical-500 hover:text-accent-red"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>

            {error && <div className="text-xs font-mono text-accent-red bg-accent-red/10 border border-accent-red/30 rounded px-3 py-2">{error}</div>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-tactical-800 hover:bg-tactical-700 text-white rounded font-mono text-xs">CANCEL</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-accent-cyan hover:bg-cyan-400 text-tactical-950 font-bold rounded font-mono text-xs disabled:opacity-50">
                {isSubmitting ? 'REGISTERING...' : 'REGISTER FIR'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
