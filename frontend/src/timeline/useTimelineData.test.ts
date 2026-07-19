// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTimelineData } from './useTimelineData';
import { useInvestigationStore } from '../workspace/store/useInvestigationStore';

vi.mock('../workspace/store/useInvestigationStore', () => ({
  useInvestigationStore: vi.fn()
}));

describe('useTimelineData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the real case timeline for a CASE- focused entity', async () => {
    (useInvestigationStore as any).mockReturnValue({
      focusedEntity: 'CASE-1',
      selection: { multiSelected: [] },
    });

    const mockEvents = [{ id: 'evt-1', title: 'FIR Registered', timestamp: '2026-01-01T00:00:00Z' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEvents),
    }));

    const { result } = renderHook(() => useTimelineData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.events).toEqual(mockEvents);
    vi.unstubAllGlobals();
  });

  it('returns no events when nothing is focused/selected, rather than fabricating placeholder events', async () => {
    (useInvestigationStore as any).mockReturnValue({
      focusedEntity: null,
      selection: { multiSelected: [] },
    });

    const { result } = renderHook(() => useTimelineData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.events).toEqual([]);
  });
});
