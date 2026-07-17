// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

describe('AppSidebar Navigation Links (TDD)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correct top-level navigation buttons and removes right-panel tabs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppSidebar />
      </MemoryRouter>
    );

    // Should be present
    expect(screen.getByTitle('Tactical GIS Map')).toBeDefined();
    expect(screen.getByTitle('Network Analysis')).toBeDefined();
    expect(screen.getByTitle('FIR Database')).toBeDefined();

    // Should be removed (merged into MAP or moved to right panel tabs)
    expect(screen.queryByTitle('Choropleth Density Map')).toBeNull();
    expect(screen.queryByTitle('Entity Dossier')).toBeNull();
    expect(screen.queryByTitle('Events Timeline')).toBeNull();
    expect(screen.queryByTitle('Network Analysis Links')).toBeNull(); // This was the right panel tab
  });
});
