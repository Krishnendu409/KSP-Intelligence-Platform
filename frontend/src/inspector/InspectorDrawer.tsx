import React, { useEffect } from "react";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";
import { X, Shield } from "lucide-react";
import { EventInspector } from "./inspectors/EventInspector";
import { CaseInspector } from "./inspectors/CaseInspector";
import { RelationshipInspector } from "./inspectors/RelationshipInspector";
import { EvidenceInspector } from "./inspectors/EvidenceInspector";

export const InspectorDrawer: React.FC = () => {
  const { inspector, closeInspector } = useInvestigationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && inspector.isOpen) {
        closeInspector();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspector.isOpen, closeInspector]);

  if (!inspector.isOpen || !inspector.type) {
    return null;
  }

  const getHeaderTitle = () => {
    switch (inspector.type) {
      case "EVENT": return "TIMELINE EVENT INSPECTOR";
      case "CASE": return "CASE FIR INSPECTOR";
      case "RELATIONSHIP": return "CONNECTION INSPECTOR";
      case "EVIDENCE": return "EXHIBIT & EVIDENCE INSPECTOR";
      default: return "OBJECT INSPECTOR";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 transition-opacity"
        onClick={closeInspector}
      />

      {/* Slide-In Drawer Panel (400px wide) */}
      <div className="fixed top-0 right-0 h-screen w-[400px] max-w-[90vw] bg-tactical-900 border-l border-tactical-700 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-tactical-800/90 border-b border-tactical-700 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-cyan" />
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              {getHeaderTitle()}
            </span>
          </div>
          <button
            onClick={closeInspector}
            className="p-1 rounded bg-tactical-900 hover:bg-tactical-700 border border-tactical-700 text-tactical-400 hover:text-white transition-colors"
            title="Close Inspector (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {inspector.type === "EVENT" && <EventInspector data={inspector.data || {}} />}
          {inspector.type === "CASE" && <CaseInspector data={inspector.data || {}} />}
          {inspector.type === "RELATIONSHIP" && <RelationshipInspector data={inspector.data || {}} />}
          {inspector.type === "EVIDENCE" && <EvidenceInspector data={inspector.data || {}} />}
        </div>

        {/* Drawer Footer Status */}
        <div className="px-4 py-2.5 bg-tactical-950 border-t border-tactical-800 font-mono text-xxs text-tactical-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            INTELLIGENCE OBJECT INSPECTED
          </span>
          <span>ESC TO CLOSE</span>
        </div>
      </div>
    </>
  );
};
