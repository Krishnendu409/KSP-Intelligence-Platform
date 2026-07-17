import { describe, it, expect } from 'vitest';
import { 
  executeOfflineCopilotQuery, 
  generateOfflineCaseBriefing,
  suggestActSectionsFromFacts
} from '../lib/offlineAICopilotEngine';

describe('Offline Deterministic AI Copilot Engine (Zero LLM / 100% Deterministic)', () => {
  it('parses natural language queries and returns matching FIRs deterministically offline', () => {
    const result = executeOfflineCopilotQuery('Show Heinous FIRs in Koramangala under IPC 302');
    expect(result.summary).toContain('Heinous');
    expect(result.matchedCases.length).toBeGreaterThanOrEqual(1);
    expect(result.matchedCases[0].CrimeNo).toBeDefined();
  });

  it('generates structured intelligence briefings from CaseMaster records offline', () => {
    const briefing = generateOfflineCaseBriefing(1);
    expect(briefing.title).toContain('INTELLIGENCE DOSSIER');
    expect(briefing.keySuspects.length).toBeGreaterThanOrEqual(1);
    expect(briefing.narrativeSummary).toBeDefined();
  });

  it('suggests applicable Acts and Sections based on BriefFacts text', () => {
    const suggestions = suggestActSectionsFromFacts('Suspect arrested with 1.5kg MDMA contraband and illegal firearms at hawala drop point');
    expect(suggestions.some(s => s.ActCode === 'NDPS')).toBe(true);
  });
});
