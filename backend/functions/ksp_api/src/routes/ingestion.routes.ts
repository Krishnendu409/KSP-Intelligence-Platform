import { Router } from 'express';
import type Database from 'better-sqlite3';
import { parseAndIngestCSV } from '../services/ingestion/csv.service';
import { parseAndIngestPDF } from '../services/ingestion/pdf.service';

export function setupIngestionRoutes(db: Database.Database): Router {
  const router = Router();

  router.post('/csv', async (req: any, res: any) => {
    try {
      const csvContent = typeof req.body === 'string' ? req.body : req.body.csvContent;
      if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({ error: 'Valid CSV content string is required' });
      }

      const ctx = {
        employeeId: req.headers['x-employee-id'] ? parseInt(String(req.headers['x-employee-id']), 10) : 1,
        unitId: req.headers['x-unit-id'] ? parseInt(String(req.headers['x-unit-id']), 10) : 1,
        districtId: req.headers['x-district-id'] ? parseInt(String(req.headers['x-district-id']), 10) : 1,
      };

      const result = await parseAndIngestCSV(db, csvContent, ctx);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to ingest CSV data' });
    }
  });

  router.post('/pdf', async (req: any, res: any) => {
    try {
      let buffer: Buffer;
      if (Buffer.isBuffer(req.body)) {
        buffer = req.body;
      } else if (req.body?.pdfBase64) {
        buffer = Buffer.from(req.body.pdfBase64, 'base64');
      } else if (req.body?.pdfText) {
        buffer = Buffer.from(req.body.pdfText, 'utf-8');
      } else {
        return res.status(400).json({ error: 'Valid PDF payload (buffer, pdfBase64, or pdfText) is required' });
      }

      const ctx = {
        employeeId: req.headers['x-employee-id'] ? parseInt(String(req.headers['x-employee-id']), 10) : 1,
        unitId: req.headers['x-unit-id'] ? parseInt(String(req.headers['x-unit-id']), 10) : 1,
        districtId: req.headers['x-district-id'] ? parseInt(String(req.headers['x-district-id']), 10) : 1,
      };

      const result = await parseAndIngestPDF(db, buffer, ctx);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to ingest PDF FIR' });
    }
  });

  return router;
}
