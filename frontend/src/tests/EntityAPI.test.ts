import { describe, it, expect } from 'vitest';

describe('Entity Profile API', () => {
  it('fetches a real entity profile from the backend database', async () => {
    // Assuming backend is running on 3000 during test, or we mock it.
    // For TDD we just test the fetch logic in the frontend that interacts with it
    const response = await fetch('http://localhost:3000/api/entities/Victim/1');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.id).toBe('VICTIM-1');
    expect(data.name).toBeDefined();
    expect(data.metadata).toBeDefined();
    expect(data.metadata.Age).toBeDefined();
    expect(data.linkedCases).toBeInstanceOf(Array);
    expect(data.network).toBeInstanceOf(Array);
  });
});
