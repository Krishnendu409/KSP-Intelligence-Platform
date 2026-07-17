# Tactical Map Movement & Performance Optimization Design Spec

## 1. Goal & Context
The Tactical GIS Map (`src/map/TacticalMap.tsx`) currently suffers from severe stuttering, rubber-banding, and movement lag when users pan or zoom. This occurs because `onMoveEnd` updates the Zustand `viewport` state, which immediately triggers a reactive `useEffect` calling `mapRef.current.flyTo({ duration: 1500 })`. This creates a state-to-animation loop that fights user interaction and degrades performance on standard/low-end police hardware.

## 2. Architecture & Design Principles
We decouple **User-Initiated Viewport Interaction** from **Programmatic Entity Targeting**:

```
+-----------------------------------------------------------------------+
| User Mouse / Trackpad Drag & Zoom                                     |
|  -> Native MapLibre GL 60FPS Hardware Acceleration (No flyTo loop)    |
|  -> Silent update onMoveEnd to useInvestigationStore (coordinates only)|
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| Explicit Programmatic Focus (Click Entity / Search Result / Dossier)  |
|  -> Calls flyToEntityTarget(lng, lat, zoom)                           |
|  -> Smooth lightweight flight (duration: 700ms, essential: true)      |
+-----------------------------------------------------------------------+
```

## 3. Component & State Changes

### 3.1 `src/map/TacticalMap.tsx`
- **Remove Reactive Viewport Animation Loop**:
  - Delete `useEffect(() => mapRef.current.flyTo(...), [viewport.longitude, viewport.latitude, ...])`.
- **Add Programmatic Entity Focus Handler**:
  - Keep `useEffect` solely for `focusedEntity`: when `focusedEntity` changes, calculate the entity coordinates and invoke a lightweight `mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 700, essential: true })`.
- **Optimize MapLibre Navigation & Inertia Settings**:
  - Enable `dragRotate={false}` and `pitchWithRotate={false}` by default to keep 2D tactical maps snappy and avoid accidental 3D tilting on low-end hardware.
  - Set `maxZoom={18}` and `minZoom={9}` for Bengaluru tactical operations.

## 4. Test-Driven Development (TDD) Verification Plan
Following the `test-driven-development` skill:
1. **Unit Test (`src/map/__tests__/TacticalMapMovement.test.tsx`)**:
   - Write a failing test verifying that viewport state updates do not trigger cyclical `flyTo` calls when panning.
   - Verify that setting a `focusedEntity` properly triggers `flyTo` exactly once with optimal duration (`700ms`) and `essential: true`.
2. **Implementation**:
   - Apply minimal changes to pass the TDD tests.
3. **Verification**:
   - Run `npm run build`.
