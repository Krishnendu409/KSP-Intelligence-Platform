// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TacticalMap } from './TacticalMap';


// Mock zustand store to prevent errors
vi.mock('../workspace/store/useInvestigationStore', () => ({
  useInvestigationStore: () => ({
    focusedEntity: null,
    activeCase: null,
    setFocusedEntity: vi.fn(),
    mapState: {
      viewport: { latitude: 12.9716, longitude: 77.5946, zoom: 11 },
      activeLayers: ['incidents', 'stations']
    },
    setMapViewport: vi.fn(),
    toggleMapLayer: vi.fn(),
    selection: { entities: [] },
    setMultiSelect: vi.fn(),
    clearMultiSelect: vi.fn(),
  })
}));

describe('TacticalMap Modes HUD (TDD)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a top-left mode toggle with TACTICAL, DENSITY, ARCS and removes old overlays', () => {
    render(
      <MemoryRouter>
        <TacticalMap />
      </MemoryRouter>
    );

    // Old buttons should be gone
    expect(screen.queryByText(/Live Feeds/i)).toBeNull();
    expect(screen.queryByText(/ANPR Cameras/i)).toBeNull();
    expect(screen.queryByText(/Cell Towers/i)).toBeNull();
    expect(screen.queryByText(/Map Layers/i)).toBeNull();
    
    // New mode toggles should exist
    expect(screen.getByText('TACTICAL')).toBeDefined();
    expect(screen.getByText('DENSITY')).toBeDefined();
    expect(screen.getByText('ARCS')).toBeDefined();
  });
});
