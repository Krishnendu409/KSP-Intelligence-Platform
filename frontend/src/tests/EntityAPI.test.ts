// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

describe('Entity Profile API', () => {
  let token: string;
  let originalFetch: any;

  beforeAll(async () => {
    originalFetch = window.fetch;
    vi.spyOn(window, 'fetch').mockImplementation((url: any, options: any) => {
      if (typeof url === 'string' && url.includes('/api/auth/login')) {
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ token: 'mock-jwt-token-scrb' })
        } as Response);
      }
      if (typeof url === 'string' && url.includes('/api/entities/Victim/1')) {
        if (!options?.headers || !('Authorization' in options.headers)) {
          return Promise.resolve({
            status: 401,
            ok: false,
            json: () => Promise.resolve({ error: 'Unauthorized' })
          } as Response);
        }
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({
            id: 'VICTIM-1',
            name: 'Vikram Sharma',
            type: 'VICTIM',
            metadata: { Age: 42, Gender: 'Male' },
            linkedCases: ['CASE-2005'],
            network: [{ id: 'CASE-2005', name: 'Robbery at ATM', category: 'CASE', relation: 'VICTIM IN' }]
          })
        } as Response);
      }
      return Promise.reject(new Error(`Unhandled mock url: ${url}`));
    });

    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'scrb.state', password: 'ksp-scrb-2026' }),
    });
    const body = await loginRes.json();
    token = body.token;
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (originalFetch) window.fetch = originalFetch;
  });

  it('fetches a real entity profile from the backend database (or mock layer)', async () => {
    const response = await fetch('http://localhost:3000/api/entities/Victim/1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.id).toBe('VICTIM-1');
    expect(data.name).toBeDefined();
    expect(data.metadata).toBeDefined();
    expect(data.metadata.Age).toBeDefined();
    expect(data.linkedCases).toBeInstanceOf(Array);
    expect(data.network).toBeInstanceOf(Array);
  });

  it('rejects unauthenticated requests', async () => {
    const response = await fetch('http://localhost:3000/api/entities/Victim/1');
    expect(response.status).toBe(401);
  });
});
