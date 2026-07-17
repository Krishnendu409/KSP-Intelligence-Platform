# ADR 0003: MapLibre GL over Leaflet for WebGL Spatial Intelligence

## Status
Accepted

## Context
Intelligence investigations frequently require visualizing tens of thousands of ANPR sightings, CDR cell tower triangulations, patrol beats, and spatial geofences simultaneously. DOM-based mapping libraries (such as Leaflet) degrade significantly below 15 FPS when rendering >2,000 interactive markers.

## Decision
We standardize on **MapLibre GL JS** (GPU-accelerated vector WebGL rendering) as the canonical GIS rendering engine for INTEL-OS.

## Consequences
* **Positive**: Smooth 60 FPS panning/zooming across 50,000+ spatial data points; native support for vector tiles, dynamic heatmaps, time-aware brushing overlays, and polygon geofence drawing.
* **Negative**: Slightly larger bundle footprint compared to minimal DOM mapping libraries.
