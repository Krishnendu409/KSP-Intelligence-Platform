// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRelationshipGraphData } from './useRelationshipGraphData';
import { useInvestigationStore } from '../workspace/store/useInvestigationStore';

vi.mock('../workspace/store/useInvestigationStore', () => ({
  useInvestigationStore: vi.fn()
}));

describe('useRelationshipGraphData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useInvestigationStore as any).mockReturnValue({
      focusedEntity: 'target-1',
      activeCase: null,
    });
  });

  it('fetches the real cytoscape graph payload and exposes it as elements', async () => {
    const mockElements = [
      { data: { id: 'target-1', label: 'Target', type: 'Person' } },
      { data: { id: 'other-1', label: 'Other', type: 'Person' } },
      { data: { id: 'rel-1', source: 'target-1', target: 'other-1', label: 'ASSOCIATE_OF' } },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockElements),
    }));

    const { result } = renderHook(() => useRelationshipGraphData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.elements.length).toBe(3);
    });

    expect(result.current.elements).toEqual(mockElements);
    vi.unstubAllGlobals();
  });

  it('leaves elements empty when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    const { result } = renderHook(() => useRelationshipGraphData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.elements).toEqual([]);
    vi.unstubAllGlobals();
  });
});
