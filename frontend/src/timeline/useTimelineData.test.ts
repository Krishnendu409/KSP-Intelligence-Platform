// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTimelineData } from './useTimelineData';
import { useInvestigationStore } from '../workspace/store/useInvestigationStore';
import { DefaultService } from '@shared/client';

vi.mock('../workspace/store/useInvestigationStore', () => ({
  useInvestigationStore: vi.fn()
}));

vi.mock('@shared/client', () => ({
  DefaultService: {
    getApiEvents: vi.fn()
  }
}));

describe('useTimelineData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useInvestigationStore as any).mockReturnValue({
      focusedEntity: 'entity-1',
      selection: { multiSelected: [] },
      openInspector: vi.fn(),
      setFocusedEntity: vi.fn()
    });
  });

  it('fetches timeline data successfully', async () => {
    const mockEvents = [{ id: '1', title: 'Event 1' }];
    (DefaultService.getApiEvents as any).mockResolvedValue(mockEvents);

    const { result } = renderHook(() => useTimelineData());

    // Initially, since it's a stub, it might not be loading or fetching.
    // The test will fail because the stub doesn't fetch.
    await waitFor(() => {
      expect(result.current.events).toEqual(mockEvents);
    });
  });
});
