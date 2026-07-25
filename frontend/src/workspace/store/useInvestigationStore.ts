import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type EntityId = string;
export type CaseId = string;

export interface SnapshotMeta {
  id: string;
  name: string;
  timestamp: string;
  entityCount: number;
  focusedEntity: string | null;
}


export interface WorkspaceLayout {
  mode: 'default' | 'focus-map' | 'focus-dossier' | 'split';
  panelVisibility: {
    dossier: boolean;
    timeline: boolean;
    relationships: boolean;
    map: boolean;
    graph: boolean;
  };
}

export interface MapState {
  viewport: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  activeLayers: string[];
}

export interface SelectionModel {
  primary: EntityId | null;
  secondary: EntityId | null;
  hovered: EntityId | null;
  multiSelected: EntityId[];
}

export interface NavigationFrame {
  type: 'ENTITY' | 'CASE' | 'EVENT' | 'SEARCH' | 'VIEW' | string;
  id: string;
  label?: string;
  timestamp: string;
}

export interface NavigationModel {
  stack: NavigationFrame[];
  currentIndex: number;
  bookmarks: (NavigationFrame & { name?: string })[];
  recentSearches: string[];
}

export interface InspectorState {
  isOpen: boolean;
  type: 'ENTITY' | 'EVENT' | 'CASE' | 'RELATIONSHIP' | 'EVIDENCE' | null;
  data: any | null;
  activeTab?: string;
  explainability?: {
    confidence: number;
    decision: string;
    factors: Array<{ label: string; points: number }>;
  } | null;
  lineage?: {
    nodes: Array<{ id: string; label: string; type: string }>;
    edges: Array<{ source: string; target: string; label: string }>;
  } | null;
}

export interface InvestigationSession {
  // Global Selection Model (Task 7)
  selection: SelectionModel;
  focusedEntity: EntityId | null; // Backwards-compatible primary selection
  hoveredEntity: EntityId | null;
  selectedEntities: EntityId[];
  selectedCases: CaseId[];
  activeSearch: string | null;

  // Navigation Stack (Task 8)
  navigation: NavigationModel;

  // Task 11: Expanded Session & Layer State
  activeCase: CaseId | null;
  activeTimelineEvent: string | null;
  selectedRelationship: string | null;
  selectedEvidence: string | null;
  layers: {
    persons: boolean;
    vehicles: boolean;
    addresses: boolean;
    crimeLocations: boolean;
    policeStations: boolean;
    hospitals: boolean;
    cctv: boolean;
    timelinePath: boolean;
    relationships: boolean;
  };
  dateFilter: { start: string | null; end: string | null };
  entityTypeFilter: string[];

  // Task 12: Inspector System State
  inspector: InspectorState;

  // Session State
  pinnedEntities: EntityId[];
  pinnedCases: CaseId[];
  bookmarks: string[];
  notes: string;
  recentSearches: string[];

  // Layout & Controls
  layout: WorkspaceLayout;
  mapState: MapState;
  activeSidePanel: 'entity' | 'timeline' | 'network' | 'none';
  isRightPanelCollapsed: boolean;
  isCopilotOpen: boolean;
  setActiveSidePanel: (panel: 'entity' | 'timeline' | 'network' | 'none') => void;
  setIsRightPanelCollapsed: (collapsed: boolean) => void;
  setIsCopilotOpen: (open: boolean) => void;
  
  // Selection Actions
  setFocusedEntity: (id: EntityId | null, label?: string) => void;
  setHoveredEntity: (id: EntityId | null) => void;
  setSelectionPrimary: (id: EntityId | null, label?: string) => void;
  setSelectionSecondary: (id: EntityId | null) => void;
  toggleMultiSelect: (id: EntityId) => void;
  setMultiSelect: (ids: EntityId[]) => void;
  clearMultiSelect: () => void;
  toggleEntitySelection: (id: EntityId) => void;

  // Task 11 Actions
  setActiveCase: (caseId: CaseId | null) => void;
  setActiveTimelineEvent: (eventId: string | null) => void;
  setSelectedRelationship: (relId: string | null) => void;
  setSelectedEvidence: (evidenceId: string | null) => void;
  toggleLayer: (layerName: keyof InvestigationSession['layers']) => void;
  setDateFilter: (filter: { start: string | null; end: string | null }) => void;
  setEntityTypeFilter: (types: string[]) => void;

  // Task 12 Actions & Universal Inspector Helpers
  openInspector: (type: InspectorState['type'], data: any, options?: { explainability?: any; lineage?: any; activeTab?: string }) => void;
  closeInspector: () => void;
  inspectEntity: (entityId: EntityId, data: any, options?: { explainability?: any; lineage?: any; activeTab?: string }) => void;
  inspectEvent: (eventId: string, data: any, options?: { explainability?: any; lineage?: any; activeTab?: string }) => void;
  inspectEvidence: (evidenceId: string, data: any, options?: { explainability?: any; lineage?: any; activeTab?: string }) => void;
  triggerLateralPivot: (sourceId: EntityId, targetId: EntityId, label?: string) => void;

  // Navigation Actions
  navigateTo: (frame: Omit<NavigationFrame, 'timestamp'>) => void;
  logNavigation: (type: NavigationFrame['type'], id: string, label?: string) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  addBookmarkFrame: (frame: Omit<NavigationFrame, 'timestamp'>, name?: string) => void;
  addRecentSearchQuery: (query: string) => void;

  // Other Actions
  setActiveSearch: (query: string | null) => void;
  setLayoutMode: (mode: WorkspaceLayout['mode']) => void;
  togglePanel: (panel: keyof WorkspaceLayout['panelVisibility']) => void;
  setMapViewport: (viewport: MapState['viewport']) => void;
  toggleMapLayer: (layerId: string) => void;
  // Snapshot Actions (Task 17)
  saveSnapshot: (name: string) => SnapshotMeta;
  restoreSnapshot: (idOrName: string) => boolean;
  listSnapshots: () => SnapshotMeta[];
  deleteSnapshot: (id: string) => void;
}

export const useInvestigationStore = create<InvestigationSession>()(
  persist(
    (set, get) => ({
  // Initial Selection
  selection: {
    primary: null,
    secondary: null,
    hovered: null,
    multiSelected: []
  },
  focusedEntity: null,
  hoveredEntity: null,
  selectedEntities: [],
  selectedCases: [],
  activeSearch: null,

  // Initial Navigation Stack
  navigation: {
    stack: [],
    currentIndex: -1,
    bookmarks: [],
    recentSearches: []
  },

  // Task 11 Initial State
  activeCase: null,
  activeTimelineEvent: null,
  selectedRelationship: null,
  selectedEvidence: null,
  layers: {
    persons: true,
    vehicles: true,
    addresses: true,
    crimeLocations: true,
    policeStations: true,
    hospitals: true,
    cctv: true,
    timelinePath: true,
    relationships: true,
  },
  dateFilter: { start: null, end: null },
  entityTypeFilter: [],

  // Task 12 Initial State
  inspector: {
    isOpen: false,
    type: null,
    data: null,
  },

  pinnedEntities: [],
  pinnedCases: [],
  bookmarks: [],
  notes: "",
  recentSearches: [],

  layout: {
    mode: 'default',
    panelVisibility: {
      dossier: true,
      timeline: true,
      relationships: true,
      map: true,
      graph: true,
    }
  },

  mapState: {
    viewport: {
      longitude: 77.5946, // Bengaluru, Karnataka
      latitude: 12.9716,
      zoom: 11
    },
    activeLayers: ['administrative', 'police-stations', 'entity-locations']
  },
  activeSidePanel: 'entity',
  isRightPanelCollapsed: false,
  isCopilotOpen: false,

  // Actions
  setFocusedEntity: (id, label) => {
    set((state) => ({
      focusedEntity: id,
      selection: { ...state.selection, primary: id }
    }));
    if (id) {
      get().navigateTo({ type: 'ENTITY', id, label: label || id });
    }
  },

  setHoveredEntity: (id) => set((state) => ({
    hoveredEntity: id,
    selection: { ...state.selection, hovered: id }
  })),

  setSelectionPrimary: (id, label) => get().setFocusedEntity(id, label),

  setSelectionSecondary: (id) => set((state) => ({
    selection: { ...state.selection, secondary: id }
  })),

  toggleMultiSelect: (id) => set((state) => {
    const current = state.selection.multiSelected;
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    return {
      selection: { ...state.selection, multiSelected: next }
    };
  }),

  setMultiSelect: (ids) => set((state) => ({
    selection: { ...state.selection, multiSelected: ids }
  })),

  clearMultiSelect: () => set((state) => ({
    selection: { ...state.selection, multiSelected: [] }
  })),
  
  toggleEntitySelection: (id) => set((state) => ({
    selectedEntities: state.selectedEntities.includes(id) 
      ? state.selectedEntities.filter(eId => eId !== id)
      : [...state.selectedEntities, id]
  })),

  // Navigation Stack Implementation
  navigateTo: (frame) => set((state) => {
    const currentFrame = state.navigation.stack[state.navigation.currentIndex];
    if (currentFrame && currentFrame.type === frame.type && currentFrame.id === frame.id) {
      return {}; // No duplicate top stack frame
    }

    // Trim any forward history if we navigated from middle of stack
    const trimmedStack = state.navigation.stack.slice(0, state.navigation.currentIndex + 1);
    
    // Cycle Prevention: If the frame already exists in the current stack, jump back to it instead of duplicating
    const existingIndex = trimmedStack.findIndex(f => f.type === frame.type && f.id === frame.id);
    
    if (existingIndex !== -1) {
      return {
        focusedEntity: frame.type === 'ENTITY' ? frame.id : state.focusedEntity,
        activeCase: frame.type === 'CASE' ? frame.id : state.activeCase,
        selection: {
          ...state.selection,
          primary: frame.type === 'ENTITY' ? frame.id : state.selection.primary
        },
        navigation: {
          ...state.navigation,
          stack: trimmedStack.slice(0, existingIndex + 1),
          currentIndex: existingIndex
        }
      };
    }

    const newFrame: NavigationFrame = {
      ...frame,
      timestamp: new Date().toISOString()
    };

    const updatedStack = [...trimmedStack, newFrame];

    return {
      focusedEntity: frame.type === 'ENTITY' ? frame.id : state.focusedEntity,
      activeCase: frame.type === 'CASE' ? frame.id : state.activeCase,
      selection: {
        ...state.selection,
        primary: frame.type === 'ENTITY' ? frame.id : state.selection.primary
      },
      navigation: {
        ...state.navigation,
        stack: updatedStack,
        currentIndex: updatedStack.length - 1
      }
    };
  }),

  logNavigation: (type, id, label) => {
    get().navigateTo({ type, id, label });
  },

  navigateBack: () => {
    const { navigation } = get();
    if (navigation.currentIndex > 0) {
      const nextIndex = navigation.currentIndex - 1;
      const targetFrame = navigation.stack[nextIndex];
      set((state) => ({
        focusedEntity: targetFrame.type === 'ENTITY' ? targetFrame.id : state.focusedEntity,
        activeCase: targetFrame.type === 'CASE' ? targetFrame.id : state.activeCase,
        selection: {
          ...state.selection,
          primary: targetFrame.type === 'ENTITY' ? targetFrame.id : state.selection.primary
        },
        navigation: {
          ...state.navigation,
          currentIndex: nextIndex
        }
      }));
    }
  },

  navigateForward: () => {
    const { navigation } = get();
    if (navigation.currentIndex < navigation.stack.length - 1) {
      const nextIndex = navigation.currentIndex + 1;
      const targetFrame = navigation.stack[nextIndex];
      set((state) => ({
        focusedEntity: targetFrame.type === 'ENTITY' ? targetFrame.id : state.focusedEntity,
        activeCase: targetFrame.type === 'CASE' ? targetFrame.id : state.activeCase,
        selection: {
          ...state.selection,
          primary: targetFrame.type === 'ENTITY' ? targetFrame.id : state.selection.primary
        },
        navigation: {
          ...state.navigation,
          currentIndex: nextIndex
        }
      }));
    }
  },

  addBookmarkFrame: (frame, name) => set((state) => ({
    navigation: {
      ...state.navigation,
      bookmarks: [
        ...state.navigation.bookmarks,
        {
          ...frame,
          timestamp: new Date().toISOString(),
          name: name || frame.label || frame.id
        }
      ]
    }
  })),

  addRecentSearchQuery: (query) => set((state) => {
    const filtered = state.navigation.recentSearches.filter(q => q !== query);
    return {
      navigation: {
        ...state.navigation,
        recentSearches: [query, ...filtered].slice(0, 20)
      }
    };
  }),

  setActiveSearch: (query) => set({ activeSearch: query }),
  
  setLayoutMode: (mode) => set((state) => ({
    layout: { ...state.layout, mode }
  })),

  togglePanel: (panel) => set((state) => ({
    layout: {
      ...state.layout,
      panelVisibility: {
        ...state.layout.panelVisibility,
        [panel]: !state.layout.panelVisibility[panel]
      }
    }
  })),

  setMapViewport: (viewport) => set((state) => ({
    mapState: { ...state.mapState, viewport }
  })),

  toggleMapLayer: (layerId: string) => set((state) => ({
    mapState: {
      ...state.mapState,
      activeLayers: state.mapState.activeLayers.includes(layerId)
        ? state.mapState.activeLayers.filter(l => l !== layerId)
        : [...state.mapState.activeLayers, layerId]
    }
  })),

  // Task 11 Action Implementations
  setActiveCase: (caseId) => set({ activeCase: caseId }),
  setActiveTimelineEvent: (eventId) => set({ activeTimelineEvent: eventId }),
  setSelectedRelationship: (relId) => set({ selectedRelationship: relId }),
  setSelectedEvidence: (evidenceId) => set({ selectedEvidence: evidenceId }),
  toggleLayer: (layerName) => set((state) => ({
    layers: {
      ...state.layers,
      [layerName]: !state.layers[layerName]
    }
  })),
  setDateFilter: (filter) => set({ dateFilter: filter }),
  setEntityTypeFilter: (types) => set({ entityTypeFilter: types }),

  // Task 12 & Universal Inspector Implementations
  openInspector: (type, data, options) => set({
    inspector: {
      isOpen: true,
      type,
      data,
      activeTab: options?.activeTab || 'metadata',
      explainability: options?.explainability || null,
      lineage: options?.lineage || null,
    }
  }),
  closeInspector: () => set({
    inspector: {
      isOpen: false,
      type: null,
      data: null,
      activeTab: 'metadata',
      explainability: null,
      lineage: null,
    }
  }),
  inspectEntity: (entityId, data, options) => {
    get().setFocusedEntity(entityId, data?.name || data?.label || entityId);
    get().openInspector('ENTITY', { id: entityId, ...data }, options);
  },
  inspectEvent: (eventId, data, options) => {
    get().setActiveTimelineEvent(eventId);
    get().openInspector('EVENT', { id: eventId, ...data }, options);
  },
  inspectEvidence: (evidenceId, data, options) => {
    get().setSelectedEvidence(evidenceId);
    get().openInspector('EVIDENCE', { id: evidenceId, ...data }, options);
  },
  triggerLateralPivot: (_sourceId, targetId, label) => {
    get().setFocusedEntity(targetId, label || targetId);
    get().navigateTo({ type: 'ENTITY', id: targetId, label: label || targetId });
  },

  setActiveSidePanel: (panel) => set({ activeSidePanel: panel, isRightPanelCollapsed: false }),
  setIsRightPanelCollapsed: (collapsed) => set({ isRightPanelCollapsed: collapsed }),
  setIsCopilotOpen: (open) => set({ isCopilotOpen: open }),


  // Snapshot Implementation (Task 17)
  saveSnapshot: (name) => {
    const state = get();
    const id = `snap_${Date.now()}`;
    const meta: SnapshotMeta = {
      id,
      name,
      timestamp: new Date().toISOString(),
      entityCount: state.selection.multiSelected.length || (state.focusedEntity ? 1 : 0),
      focusedEntity: state.focusedEntity
    };
    const snapshotData = {
      meta,
      navigation: state.navigation,
      selection: state.selection,
      focusedEntity: state.focusedEntity,
      activeCase: state.activeCase,
      mapState: state.mapState,
      layers: state.layers,
      dateFilter: state.dateFilter
    };
    try {
      localStorage.setItem(`ios-snapshot-${id}`, JSON.stringify(snapshotData));
      const indexRaw = localStorage.getItem('ios-snapshots-index');
      const index: SnapshotMeta[] = indexRaw ? JSON.parse(indexRaw) : [];
      index.unshift(meta);
      localStorage.setItem('ios-snapshots-index', JSON.stringify(index));
    } catch (err) {
      console.error("Failed to save snapshot to localStorage:", err);
    }
    return meta;
  },

  restoreSnapshot: (idOrName) => {
    try {
      const indexRaw = localStorage.getItem('ios-snapshots-index');
      const index: SnapshotMeta[] = indexRaw ? JSON.parse(indexRaw) : [];
      const foundMeta = index.find(m => m.id === idOrName || m.name === idOrName);
      if (!foundMeta) return false;
      const raw = localStorage.getItem(`ios-snapshot-${foundMeta.id}`);
      if (!raw) return false;
      const data = JSON.parse(raw);
      set({
        navigation: data.navigation || get().navigation,
        selection: data.selection || get().selection,
        focusedEntity: data.focusedEntity || null,
        activeCase: data.activeCase || null,
        mapState: data.mapState || get().mapState,
        layers: data.layers || get().layers,
        dateFilter: data.dateFilter || get().dateFilter,
        activeSidePanel: 'entity',
        isRightPanelCollapsed: false
      });
      return true;
    } catch {
      return false;
    }
  },

  listSnapshots: () => {
    try {
      const indexRaw = localStorage.getItem('ios-snapshots-index');
      return indexRaw ? JSON.parse(indexRaw) : [];
    } catch {
      return [];
    }
  },

  deleteSnapshot: (id) => {
    try {
      localStorage.removeItem(`ios-snapshot-${id}`);
      const indexRaw = localStorage.getItem('ios-snapshots-index');
      const index: SnapshotMeta[] = indexRaw ? JSON.parse(indexRaw) : [];
      const next = index.filter(m => m.id !== id);
      localStorage.setItem('ios-snapshots-index', JSON.stringify(next));
    } catch {}
  }
    }),
    {
      name: 'ios-investigation-session',
      storage: createJSONStorage(() => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
          }
        } catch {}
        const store: Record<string, string> = {};
        return {
          getItem: (name: string) => store[name] || null,
          setItem: (name: string, value: string) => { store[name] = value; },
          removeItem: (name: string) => { delete store[name]; }
        };
      }),
      partialize: (state) => ({
        navigation: state.navigation,
        selection: state.selection,
        focusedEntity: state.focusedEntity,
        activeCase: state.activeCase,
        mapState: state.mapState,
        layers: state.layers,
        dateFilter: state.dateFilter
      })
    }
  )
);
