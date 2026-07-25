// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { useThemeStore } from './useThemeStore';
import { useInvestigationStore } from '../workspace/store/useInvestigationStore';

const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('UI Theme System & Investigation Trail (Phase 4 TDD)', () => {
  it('toggles seamlessly between dark and light themes without data loss', () => {
    const store = useThemeStore.getState();
    store.setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');

    store.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    store.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('logs view navigation and dossier inspections into investigation trail', () => {
    const invStore = useInvestigationStore.getState();
    expect(typeof (invStore as any).logNavigation).toBe('function');

    (invStore as any).logNavigation('VIEW', '/network', 'Network Analysis View');
    (invStore as any).logNavigation('ENTITY', 'VICTIM-1', 'Victim #1 Dossier');

    const stack = useInvestigationStore.getState().navigation.stack;
    expect(stack.length).toBeGreaterThanOrEqual(2);
    expect(stack[stack.length - 1].id).toBe('VICTIM-1');
    expect(stack[stack.length - 2].id).toBe('/network');
  });
});
