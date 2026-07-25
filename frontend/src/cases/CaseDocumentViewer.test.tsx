// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { CaseDocumentViewer } from './CaseDocumentViewer';

describe('CaseDocumentViewer UI (TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders uploaded evidence documents and supports uploading new evidence files', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation((url: any, options: any) => {
      if (url.includes('/api/cases/101/documents')) {
        if (options?.method === 'POST') {
          const body = JSON.parse(options.body);
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, document: { id: 1, caseMasterId: '101', ...body, uploadedAt: '2026-07-25T12:00:00Z' } }),
          } as Response);
        }
        // GET request
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 99, caseMasterId: '101', documentTitle: 'Handwritten_FIR_Scan.pdf', documentType: 'HANDWRITTEN_OCR', content: 'Accused ran towards bus stand...', uploadedBy: 'Inspector Suresh', uploadedAt: '2026-07-20T10:00:00Z' }
          ]),
        } as Response);
      }
      return Promise.reject(new Error('Unknown url'));
    });

    render(<CaseDocumentViewer caseId="101" />);

    // Wait for existing documents to load
    await waitFor(() => {
      expect(screen.getByText(/Handwritten_FIR_Scan\.pdf/i)).toBeDefined();
      expect(screen.getByText(/Accused ran towards bus stand/i)).toBeDefined();
    });

    // Test entering a new document title and content
    const titleInput = screen.getByPlaceholderText(/Document Title \(e\.g\. Forensic Report, Scan\)/i);
    fireEvent.change(titleInput, { target: { value: 'Witness_Statement_01.pdf' } });

    const contentInput = screen.getByPlaceholderText(/Paste OCR text or document notes/i);
    fireEvent.change(contentInput, { target: { value: 'Witness observed blue sedan exiting premises.' } });

    const uploadBtn = screen.getByText(/UPLOAD EVIDENCE/i);
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(screen.getByText(/Witness_Statement_01\.pdf/i)).toBeDefined();
    });

    fetchSpy.mockRestore();
  });
});
