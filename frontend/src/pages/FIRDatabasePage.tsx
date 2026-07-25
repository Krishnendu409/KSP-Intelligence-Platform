import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MapPin, Scale, Users, PlusCircle, Map, Upload } from 'lucide-react';
import { apiFetch } from '../shared/api/apiFetch';
import { IntakeModal } from '../cases/IntakeModal';
import { DataIngestionModal } from '../ingestion/DataIngestionModal';
import { CaseDocumentViewer } from '../cases/CaseDocumentViewer';

import { useInvestigationStore } from '../workspace/store/useInvestigationStore';

// GenderID has no dedicated lookup table in the ER schema — fixed convention (1=Male, 2=Female, 3=Transgender)
function genderLabel(genderId: number | null | undefined): string {
  return { 1: 'Male', 2: 'Female', 3: 'Transgender' }[genderId as number] || 'Unspecified';
}

export const FIRDatabasePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeCase, 
    setActiveCase, 
    setFocusedEntity,
    setIsRightPanelCollapsed
  } = useInvestigationStore();
  
  const [searchFilter, setSearchFilter] = useState('');
  
  const [allCases, setAllCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showIngestionModal, setShowIngestionModal] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCasesCount, setTotalCasesCount] = useState<number | null>(null);

  useEffect(() => {
    apiFetch('/api/firs/summary')
      .then(res => res.json())
      .then(data => {
        if (data && data.totalCases) {
          setTotalCasesCount(data.totalCases);
        }
      })
      .catch(console.error);
  }, []);

  const fetchFirs = (pageNum: number, append = false) => {
    apiFetch(`/api/firs?page=${pageNum}&limit=50`)
      .then(res => res.json())
      .then(data => {
        if (data.length < 50) setHasMore(false);
        if (append) {
          setAllCases(prev => [...prev, ...data]);
        } else {
          setAllCases(data);
          if (data.length > 0 && !activeCase) {
              setActiveCase(data[0].CaseMasterID);
          }
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchFirs(1, false);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFirs(nextPage, true);
  };

  useEffect(() => {
    if (activeCase) {
        apiFetch(`/api/cases/CASE-${activeCase}`)
          .then(res => res.json())
          .then(data => setSelectedCase(data))
          .catch(console.error);
    }
  }, [activeCase]);

  const handleCaseCreated = (caseId: number) => {
    fetchFirs(1, false);
    setActiveCase(String(caseId));
    setShowIntakeModal(false);
  };

  const filteredCases = allCases.filter(c =>
    (c.CrimeNo && c.CrimeNo.includes(searchFilter)) ||
    (c.PoliceStationName && c.PoliceStationName.toLowerCase().includes(searchFilter.toLowerCase())) ||
    (c.BriefFacts && c.BriefFacts.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const acts = selectedCase?.acts || [];
  const accused = selectedCase?.accused || [];
  const victims = selectedCase?.victims || [];

  return (
    <div className="flex flex-col h-full w-full bg-tactical-950 text-tactical-100 overflow-hidden relative">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-tactical-900 border-b border-tactical-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-accent-amber/10 border border-accent-amber/30 text-accent-amber">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-wider text-white">
              OFFICIAL POLICE FIR DATABASE
            </h1>
            <p className="text-xxs font-mono text-tactical-400">
              Live Connected Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowIngestionModal(true)}
            className="flex items-center gap-2 bg-tactical-800 hover:bg-tactical-700 text-white border border-tactical-600 px-3 py-1 rounded text-xs font-mono transition-colors"
          >
            <Upload className="w-4 h-4 text-accent-cyan" />
            UPLOAD CSV/PDF
          </button>
          <button 
            onClick={() => setShowIntakeModal(true)}
            className="flex items-center gap-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/40 px-3 py-1 rounded text-xs font-mono transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            INTAKE FIR
          </button>
          <div className="relative ml-2">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by CrimeNo / PS..."
              className="bg-tactical-950 border border-tactical-600 rounded px-3 py-1 text-xs font-mono text-white focus:border-accent-cyan focus:outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: FIR List (5 cols) */}
        <div className="md:col-span-5 flex flex-col border-r border-tactical-800 bg-tactical-900/60 overflow-y-auto">
          <div className="p-3 border-b border-tactical-800 flex items-center justify-between text-xxs font-mono uppercase text-tactical-400">
            <span>
              SHOWING {filteredCases.length} {totalCasesCount ? `OF ${totalCasesCount}` : ''} ER CASE RECORDS
            </span>
            <span>STANDARD: KARNATAKA POLICE ER</span>
          </div>

          <div className="divide-y divide-tactical-800">
            {filteredCases.map((c) => {
              const isSelected = c.CaseMasterID === activeCase;
              return (
                <div
                  key={c.CaseMasterID}
                  onClick={() => setActiveCase(c.CaseMasterID)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-tactical-800/90 border-l-4 border-accent-cyan' : 'hover:bg-tactical-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs text-white">
                      CRIME NO: {c.CrimeNo}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xxs font-mono font-bold ${
                      c.GravityOffenceID === 1
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {c.GravityOffenceID === 1 ? 'HEINOUS' : 'NON-HEINOUS'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xxs font-mono text-tactical-300 mb-1">
                    <MapPin className="w-3 h-3 text-tactical-400" />
                    <span>{c.PoliceStationName || "Unknown Station"}</span>
                    <span>•</span>
                    <span>CASE NO: {c.CaseNo || c.CaseMasterID}</span>
                  </div>

                  <p className="text-xxs font-mono text-tactical-200 line-clamp-2 mt-1 mb-2">
                    {c.BriefFacts}
                  </p>

                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedEntity(`CASE-${c.CaseMasterID}`, `Crime No: ${c.CrimeNo}`);
                        setIsRightPanelCollapsed(true);
                        navigate('/');
                      }}
                      className="mt-1 flex items-center gap-1.5 px-2 py-1 bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan text-xxs font-mono rounded transition-colors"
                    >
                      <Map className="w-3 h-3" />
                      VIEW ON TACTICAL MAP
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="p-3 border-t border-tactical-800 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-4 py-1.5 bg-tactical-800 hover:bg-tactical-700 text-tactical-200 text-xs font-mono rounded transition-colors"
              >
                Load More Cases
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Detailed ER Dossier View (7 cols) */}
        <div className="md:col-span-7 flex flex-col bg-tactical-900/40 p-4 overflow-y-auto space-y-4">
          {selectedCase && (
          <>
          <div className="bg-tactical-900 border border-tactical-700 rounded p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-tactical-800">
              <div>
                <span className="text-xxs font-mono text-accent-cyan uppercase tracking-wider">
                  CASE MASTER DETAILS
                </span>
                <h2 className="font-mono text-base font-bold text-white mt-0.5">
                  CRIME NO: {selectedCase.CrimeNo}
                </h2>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-tactical-400 block text-xxs">CASE STATUS</span>
                <span className="text-emerald-400 font-bold">{selectedCase.Status || 'Registered'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-3">
              <div className="bg-tactical-950/80 p-2.5 rounded border border-tactical-800">
                <span className="text-tactical-400 text-xxs uppercase block">STATION UNIT</span>
                <span className="text-white font-bold">{selectedCase.UnitName || selectedCase.PoliceStationID}</span>
              </div>
              <div className="bg-tactical-950/80 p-2.5 rounded border border-tactical-800">
                <span className="text-tactical-400 text-xxs uppercase block">REGISTRATION DATE</span>
                <span className="text-white font-bold">{selectedCase.CrimeRegisteredDate}</span>
              </div>
              <div className="bg-tactical-950/80 p-2.5 rounded border border-tactical-800">
                <span className="text-tactical-400 text-xxs uppercase block">MAJOR CRIME HEAD</span>
                <span className="text-amber-300 font-bold">{selectedCase.CrimeMajorHead || 'Unknown'}</span>
              </div>
              <div className="bg-tactical-950/80 p-2.5 rounded border border-tactical-800">
                <span className="text-tactical-400 text-xxs uppercase block">EXACT GPS COORDINATES</span>
                <span className="text-accent-cyan font-bold">{selectedCase.latitude}, {selectedCase.longitude}</span>
              </div>
            </div>

            <div className="bg-tactical-950/80 p-3 rounded border border-tactical-800 font-mono text-xs">
              <span className="text-tactical-400 text-xxs uppercase block mb-1">BRIEF FACTS (NARRATIVE):</span>
              <p className="text-tactical-100 leading-relaxed">{selectedCase.BriefFacts}</p>
            </div>

            {/* Evidence & Documents Upload Repository */}
            <CaseDocumentViewer caseId={selectedCase.CaseMasterID} />
          </div>

          {/* Act & Section Associations */}
          {acts.length > 0 && (
          <div className="bg-tactical-900 border border-tactical-700 rounded p-4">
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-tactical-800 text-accent-cyan font-mono text-xs font-bold">
              <Scale className="w-4 h-4" />
              <span>ACT & SECTION ASSOCIATIONS ({acts.length})</span>
            </div>
            <div className="space-y-2">
              {acts.map((a: any) => (
                <div key={a.AssociationID} className="flex items-center justify-between p-2 rounded bg-tactical-950 border border-tactical-800 font-mono text-xs">
                  <div>
                    <span className="font-bold text-white mr-2">{a.ActCode}</span>
                    <span className="text-accent-cyan font-bold">§ {a.SectionCode}</span>
                  </div>
                  <span className="text-tactical-300 text-xxs">{a.Description}</span>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Accused Suspects Table */}
          {accused.length > 0 && (
          <div className="bg-tactical-900 border border-tactical-700 rounded p-4">
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-tactical-800 text-amber-400 font-mono text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>ACCUSED ({accused.length})</span>
            </div>
            <div className="space-y-2">
              {accused.map((acc: any) => (
                <div key={acc.AccusedMasterID} className="flex items-center justify-between p-2.5 rounded bg-tactical-950 border border-tactical-800 font-mono text-xs">
                  <div>
                    <span className="font-bold text-accent-cyan mr-2">[{acc.PersonID}]</span>
                    <span className="text-white font-bold">{acc.AccusedName}</span>
                    <span className="text-tactical-400 block text-xxs mt-0.5">
                      {acc.AgeYear ? `Age ${acc.AgeYear}` : 'Age unknown'} · {genderLabel(acc.GenderID)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Victims & Complainants Table */}
          {victims.length > 0 && (
          <div className="bg-tactical-900 border border-tactical-700 rounded p-4">
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-tactical-800 text-accent-cyan font-mono text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>VICTIMS ({victims.length})</span>
            </div>
            <div className="space-y-2">
              {victims.map((vic: any) => (
                <div key={vic.VictimMasterID} className="flex items-center justify-between p-2.5 rounded bg-tactical-950 border border-tactical-800 font-mono text-xs">
                  <div>
                    <span className="font-bold text-accent-cyan mr-2">[VIC-{vic.VictimMasterID}]</span>
                    <span className="text-white font-bold">{vic.VictimName}</span>
                    <span className="text-tactical-400 block text-xxs mt-0.5">
                      {vic.AgeYear ? `Age ${vic.AgeYear}` : 'Age unknown'} · {genderLabel(vic.GenderID)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
          </>
          )}
        </div>
      </div>

      {showIntakeModal && (
        <IntakeModal onClose={() => setShowIntakeModal(false)} onCreated={handleCaseCreated} />
      )}
      {showIngestionModal && (
        <DataIngestionModal isOpen={showIngestionModal} onClose={() => setShowIngestionModal(false)} onSuccess={() => fetchFirs(1, false)} />
      )}
    </div>
  );
};
