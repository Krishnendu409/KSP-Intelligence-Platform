// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRelationshipGraphData } from './useRelationshipGraphData';
import { useInvestigationStore } from '../workspace/store/useInvestigationStore';
import { DefaultService } from '@shared/client';

vi.mock('../workspace/store/useInvestigationStore', () => ({
  useInvestigationStore: vi.fn()
}));

vi.mock('@shared/client', () => ({
  DefaultService: {
    getApiEntitiesRelationships: vi.fn()
  }
}));

describe('useRelationshipGraphData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useInvestigationStore as any).mockReturnValue({
      focusedEntity: 'target-1',
      setFocusedEntity: vi.fn()
    });
  });

  it('fetches relationship data and maps to elements successfully', async () => {
    const mockRels = [
      {
        relationshipId: 'rel-1',
        type: 'Knows',
        sourceEntity: { id: 'target-1', name: 'Target', type: 'Person' },
        targetEntity: { id: 'other-1', name: 'Other', type: 'Person' }
      }
    ];
    (DefaultService.getApiEntitiesRelationships as any).mockResolvedValue(mockRels);

    const { result } = renderHook(() => useRelationshipGraphData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.elements.length).toBeGreaterThan(0);
    });

    const elements = result.current.elements;
    expect(elements).toContainEqual(
      expect.objectContaining({ data: expect.objectContaining({ id: 'target-1' }) })
    );
    expect(elements).toContainEqual(
      expect.objectContaining({ data: expect.objectContaining({ id: 'other-1' }) })
    );
    expect(elements).toContainEqual(
      expect.objectContaining({ data: expect.objectContaining({ id: 'rel-1' }) })
    );
  });
});
