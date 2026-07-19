import { describe, it, expect, beforeAll } from 'vitest';

describe('Entity Profile API', () => {
  let token: string;

  beforeAll(async () => {
    // Integration test: assumes the real backend is running on :3000 with the
    // seeded demo accounts (npm run db:seed-auth in backend/functions/ksp_api).
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'scrb.state', password: 'ksp-scrb-2026' }),
    });
    const body = await loginRes.json();
    token = body.token;
  });

  it('fetches a real entity profile from the backend database', async () => {
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
