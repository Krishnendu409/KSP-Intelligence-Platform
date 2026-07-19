import { useAuthStore } from '../../auth/useAuthStore';

/**
 * Drop-in replacement for `fetch()` that attaches the signed-in officer's
 * bearer token and redirects to /login on a 401 (expired/invalid session).
 * Existing call sites only need to swap `fetch(` for `apiFetch(`.
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let fetchInput = input;
  // If running in Vitest (Node environment) without a window, fetch requires absolute URLs.
  if (typeof window === 'undefined' && typeof fetchInput === 'string' && fetchInput.startsWith('/')) {
    fetchInput = `http://localhost:3000${fetchInput}`;
  }

  const response = await fetch(fetchInput, { ...init, headers });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  }

  return response;
}
