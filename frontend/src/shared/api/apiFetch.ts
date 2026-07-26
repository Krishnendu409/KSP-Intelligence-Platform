import { useAuthStore } from '../../auth/useAuthStore';

/**
 * Drop-in replacement for `fetch()` that attaches the signed-in officer's
 * bearer token and redirects to /login on a 401 (expired/invalid session).
 * Existing call sites only need to swap `fetch(` for `apiFetch(`.
 */
const PROD_API_BASE = import.meta.env.VITE_API_BASE !== undefined && import.meta.env.VITE_API_BASE !== ''
  ? import.meta.env.VITE_API_BASE
  : (import.meta.env.PROD ? '/server/ksp_api' : '');

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let fetchInput = input;
  if (typeof fetchInput === 'string' && fetchInput.startsWith('/api')) {
    if (typeof window === 'undefined') {
      fetchInput = `http://localhost:3000${fetchInput}`;
    } else {
      fetchInput = `${PROD_API_BASE}${fetchInput}`;
    }
  }

  const response = await fetch(fetchInput, { ...init, headers });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined' && !window.location.hash.startsWith('#/login')) {
      window.location.hash = '#/login';
    }
  }

  return response;
}
