// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { UniversalIntelligenceInspector } from './UniversalIntelligenceInspector';
import { useInvestigationStore } from '../workspace/store/useInvestigationStore';

vi.mock('../workspace/store/useInvestigationStore', () => ({
  useInvestigationStore: vi.fn(),
}));

describe('UniversalIntelligenceInspector', () => {
  const mockCloseInspector = vi.fn();
  const mockInspectEntity = vi.fn();
  const mockSetFocusedEntity = vi.fn();
  const mockBookmarkItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders null when inspector is closed', () => {
    (useInvestigationStore as any).mockReturnValue({
      inspector: { isOpen: false, type: null, id: null, activeTab: 'metadata' },
      closeInspector: mockCloseInspector,
      inspectEntity: mockInspectEntity,
      setFocusedEntity: mockSetFocusedEntity,
      bookmarkItem: mockBookmarkItem,
    });

    const { container } = render(<UniversalIntelligenceInspector />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all 8 intelligence tabs when inspector is open', () => {
    (useInvestigationStore as any).mockReturnValue({
      inspector: {
        isOpen: true,
        type: 'ENTITY',
        id: 'ent-person-1',
        title: 'Test Entity',
        activeTab: 'metadata',
        explainability: {
          score: 0.94,
          confidenceInterval: '91% - 97%',
          factors: [{ label: 'Telecom Co-location', weight: 0.45, evidenceCount: 14 }],
          reasoning: ['Observed co-location during Operation Nightfall'],
        },
        lineage: {
          rootId: 'ent-person-1',
          nodes: [{ id: 'ent-person-1', label: 'Test Entity', type: 'Person', depth: 0 }],
          edges: [],
        },
      },
      closeInspector: mockCloseInspector,
      inspectEntity: mockInspectEntity,
      setFocusedEntity: mockSetFocusedEntity,
      bookmarkItem: mockBookmarkItem,
    });

    render(<UniversalIntelligenceInspector docked={true} />);

    // Check all 8 tabs exist
    expect(screen.getByText('Metadata')).toBeDefined();
    expect(screen.getByText('Custody')).toBeDefined();
    expect(screen.getByText('Network')).toBeDefined();
    expect(screen.getByText('Timeline')).toBeDefined();
    expect(screen.getByText('Pivots')).toBeDefined();
    expect(screen.getByText('Explain')).toBeDefined();
    expect(screen.getByText('Lineage')).toBeDefined();
    expect(screen.getByText('Notes')).toBeDefined();
  });

  it('navigates through tabs and displays intelligence explainability and lineage DAG details', () => {
    (useInvestigationStore as any).mockReturnValue({
      inspector: {
        isOpen: true,
        type: 'ENTITY',
        id: 'ent-person-1',
        title: 'Test Entity',
        activeTab: 'metadata',
      },
      closeInspector: mockCloseInspector,
      inspectEntity: mockInspectEntity,
      setFocusedEntity: mockSetFocusedEntity,
      bookmarkItem: mockBookmarkItem,
    });

    render(<UniversalIntelligenceInspector docked={true} />);

    // Click Custody tab
    fireEvent.click(screen.getByText('Custody'));
    expect(screen.getByText(/CHAIN-OF-CUSTODY & PROVENANCE/i)).toBeDefined();

    // Click Explain tab — the explainability/lineage engines aren't implemented yet,
    // so these must honestly say so rather than fabricate a score or graph.
    fireEvent.click(screen.getByText('Explain'));
    expect(screen.getByText(/Explainability data not available/i)).toBeDefined();

    // Click Lineage tab
    fireEvent.click(screen.getByText('Lineage'));
    expect(screen.getByText(/Lineage graph not available/i)).toBeDefined();

    // Click Notes tab
    fireEvent.click(screen.getByText('Notes'));
    expect(screen.getByText(/APPEND ANALYST OBSERVATION \/ TASK/i)).toBeDefined();
  });

  it('fetches real entity profiles and persistent notes for Case and all entity types from the backend database', async () => {
    (useInvestigationStore as any).mockReturnValue({
      inspector: {
        isOpen: true,
        type: 'Case',
        data: { id: 'CASE-101', name: 'TEST FIR 101' },
        activeTab: 'notes',
      },
      closeInspector: mockCloseInspector,
      inspectEntity: mockInspectEntity,
      setFocusedEntity: mockSetFocusedEntity,
      bookmarkItem: mockBookmarkItem,
    });

    const fakeNotes = [
      { id: '1', timestamp: '2026-07-25', author: 'SHO', text: 'Persistent DB surveillance note', noteType: 'SURVEILLANCE' }
    ];

    const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation((url: any) => {
      if (url.includes('/api/entities/Case/101/notes')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fakeNotes),
        } as Response);
      }
      if (url.includes('/api/entities/Case/101')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'CASE-101', name: 'TEST FIR 101', status: 'ACTIVE' }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown url'));
    });

    render(<UniversalIntelligenceInspector docked={true} />);

    // Verify it fetches notes and displays persistent note headline instead of session-only warning
    const noteText = await screen.findByText('Persistent DB surveillance note');
    expect(noteText).toBeDefined();
    expect(screen.getByText(/PERSISTENT EVIDENCE NOTES/i)).toBeDefined();

    fetchSpy.mockRestore();
  });
});

