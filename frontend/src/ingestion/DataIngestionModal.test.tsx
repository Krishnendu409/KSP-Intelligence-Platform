// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { DataIngestionModal } from './DataIngestionModal';

describe('DataIngestionModal UI (TDD)', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<DataIngestionModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders CSV and PDF ingestion mode tabs and submits CSV payload to /api/ingestion/csv', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation((url: any, _options: any) => {
      if (url.includes('/api/ingestion/csv')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, processedCount: 3, message: 'Successfully ingested 3 FIR records.' }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<DataIngestionModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByText(/AUTOMATED DATA INGESTION PIPELINE/i)).toBeDefined();
    expect(screen.getByText(/CSV BATCH/i)).toBeDefined();
    expect(screen.getByText(/PDF FIR/i)).toBeDefined();

    // Type sample CSV content
    const textarea = screen.getByPlaceholderText(/Paste raw CSV data or select file/i);
    fireEvent.change(textarea, { target: { value: 'District,PoliceStation,Year,FIRNumber,Section,VictimName,AccusedName\nBengaluru,Cubbon Park,2026,105,IPC 379,Amit Kumar,Raju' } });

    // Click ingest button
    const submitBtn = screen.getByText(/START AUTOMATED INGESTION/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Successfully ingested 3 FIR records/i)).toBeDefined();
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
