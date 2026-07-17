// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SystemKPIStrip } from './SystemKPIStrip';


// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SystemKPIStrip (TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<SystemKPIStrip />);
    expect(screen.queryByText(/SYSTEM METRICS/i)).toBeTruthy();
    expect(screen.queryByText(/Loading.../i)).toBeTruthy();
  });

  it('renders stats when fetch succeeds', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalCases: 5000,
        heinousCases: 2500,
        suspectsTracked: 12000,
        victimsRegistered: 8000,
        anprCameras: 284,
        cellTowers: 145
      })
    });

    render(<SystemKPIStrip />);
    
    await waitFor(() => {
      expect(screen.queryByText('5,000')).toBeTruthy(); // total cases
      expect(screen.queryByText('2,500')).toBeTruthy(); // heinous
      expect(screen.queryByText('12,000')).toBeTruthy(); // suspects
    });

    expect(screen.queryByText(/TOTAL CASES/i)).toBeTruthy();
    expect(screen.queryByText(/HEINOUS/i)).toBeTruthy();
    expect(screen.queryByText(/SUSPECTS/i)).toBeTruthy();
    expect(screen.queryByText(/ANPR/i)).toBeTruthy();
  });
});
