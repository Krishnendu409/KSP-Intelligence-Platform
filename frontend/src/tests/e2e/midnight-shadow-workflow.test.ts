import { describe, it, expect, beforeEach } from 'vitest';

import { useInvestigationStore } from '../../workspace/store/useInvestigationStore';

describe('Operation Midnight Shadow — End-to-End Investigation Workflow Validation', () => {
  beforeEach(() => {
    // Reset store state before test execution
    useInvestigationStore.setState({
      focusedEntity: null,
      activeCase: null,
      selection: {
        primary: null,
        secondary: null,
        hovered: null,
        multiSelected: []
      },
      navigation: {
        stack: [],
        currentIndex: -1,
        bookmarks: [],
        recentSearches: []
      },
      inspector: {
        isOpen: false,
        type: null,
        data: null
      }
    });
  });

  it('executes full Operation Midnight Shadow investigation trail without dead ends', () => {
    const store = useInvestigationStore.getState();

    // STEP 1: Search for "Sharma"
    store.addRecentSearchQuery('Sharma');
    store.navigateTo({
      type: 'SEARCH',
      id: 'search-sharma',
      label: 'Search: Sharma'
    });

    let currentNav = useInvestigationStore.getState().navigation;
    expect(currentNav.stack.length).toBe(1);
    expect(currentNav.stack[0].label).toBe('Search: Sharma');

    // STEP 2: Click "Arjun Sharma" search result -> EntityWorkspace overview
    store.setFocusedEntity('ent-person-arjun', 'Arjun Sharma');

    let state = useInvestigationStore.getState();
    expect(state.focusedEntity).toBe('ent-person-arjun');
    expect(state.selection.primary).toBe('ent-person-arjun');
    expect(state.navigation.stack.length).toBe(2);
    expect(state.navigation.stack[state.navigation.currentIndex].id).toBe('ent-person-arjun');
    expect(state.navigation.stack[state.navigation.currentIndex].label).toBe('Arjun Sharma');

    // STEP 3: Click "KA01MF2345" in Vehicles tab -> Pivot to vehicle entity
    store.navigateTo({
      type: 'ENTITY',
      id: 'ent-vehicle-ka01',
      label: 'KA01MF2345'
    });

    state = useInvestigationStore.getState();
    expect(state.focusedEntity).toBe('ent-vehicle-ka01');
    expect(state.navigation.stack.length).toBe(3);
    expect(state.navigation.stack[2].label).toBe('KA01MF2345');

    // STEP 4: Press Back arrow -> Return to Arjun Sharma
    store.navigateBack();

    state = useInvestigationStore.getState();
    expect(state.focusedEntity).toBe('ent-person-arjun');
    expect(state.navigation.currentIndex).toBe(1); // Index 1 is Arjun Sharma
    expect(state.navigation.stack[state.navigation.currentIndex].id).toBe('ent-person-arjun');

    // STEP 5: Click timeline event -> open EventInspector -> Open Case Workspace
    store.openInspector('EVENT', {
      id: 'evt-hsr-001',
      type: 'Sighting — HSR Layout',
      location: 'HSR Layout Warehouse'
    });

    state = useInvestigationStore.getState();
    expect(state.inspector.isOpen).toBe(true);
    expect(state.inspector.type).toBe('EVENT');
    expect(state.inspector.data.location).toBe('HSR Layout Warehouse');

    // Pivot to Case Workspace from drawer
    store.navigateTo({
      type: 'CASE',
      id: 'case-oms-2026',
      label: 'Operation Midnight Shadow'
    });

    state = useInvestigationStore.getState();
    expect(state.activeCase).toBe('case-oms-2026');
    expect(state.navigation.stack[state.navigation.currentIndex].type).toBe('CASE');
    expect(state.navigation.stack[state.navigation.currentIndex].label).toBe('Operation Midnight Shadow');

    // STEP 6: Pivot inside CaseWorkspace ("No Dead Ends" check)
    // Click "Mohammed Irfan" in Entities tab -> Pivot
    store.navigateTo({
      type: 'ENTITY',
      id: 'ent-person-mohammed',
      label: 'Mohammed Irfan'
    });

    state = useInvestigationStore.getState();
    expect(state.focusedEntity).toBe('ent-person-mohammed');

    // Pivot from RelationshipPanel row -> "Vikram Desai"
    store.navigateTo({
      type: 'ENTITY',
      id: 'ent-person-vikram',
      label: 'Vikram Desai'
    });

    state = useInvestigationStore.getState();
    expect(state.focusedEntity).toBe('ent-person-vikram');
    expect(state.navigation.stack.length).toBeGreaterThan(3); // Never reached a dead end

    // STEP 7: Direct search for case ID -> Open CaseWorkspace
    store.navigateTo({
      type: 'CASE',
      id: 'case-oms-2026',
      label: 'Operation Midnight Shadow (Direct)'
    });

    state = useInvestigationStore.getState();
    expect(state.activeCase).toBe('case-oms-2026');

    // STEP 8: Verify Workflow Recorder panel trail
    const fullStack = state.navigation.stack;
    // Due to the new Cycle Prevention logic, navigating to a case already in the stack 
    // will truncate back to that existing frame rather than appending a duplicate.
    // The stack goes from length 5 back to length 3.
    expect(fullStack.length).toBe(3);

    // Verify all frames in the investigation trail have timestamp & valid type
    for (const frame of fullStack) {
      expect(frame.id).toBeDefined();
      expect(frame.timestamp).toBeDefined();
      expect(['ENTITY', 'CASE', 'EVENT', 'SEARCH']).toContain(frame.type);
    }
  });
});
