# Potteries Music App: Build Plan

## Phase 1: Structure & Sanitation (COMPLETE)
- [x] **Route Consolidation:** Routes restricted to `/`, `/bands`, `/venues`.
- [x] **Timeline Layout:** Horizontal grid with sticky, single-row filters.
- [x] **Bands Layout:** Vertical A-Z list with Rolodex navigation.
- [x] **Venues Layout:** Map + History vertical stack.

## Phase 2: The Interaction Layer (CURRENT FOCUS)
*Goal: Make the archive feel "tactile" and physical.*

### Tactical Objective 2.1: The Sidecar (Detail View)
- [ ] **Create Component:** `src/lib/components/Sidecar.svelte`.
  - **Specs:** Fixed position (right: 0), width: 33vw (min 320px), `border-l` styling.
  - **Content:** Dynamic slot (accepts Band Data, Gig Info, or "Classics" YouTube embeds).
  - **Trigger:** Clicking a Gig Card on Timeline or a Name in Bands List opens this overlay. It does NOT navigate away.

### Tactical Objective 2.2: The Crossfade System
- [ ] **Global Store:** Create `src/lib/stores/navigation.js` to track `activeBand` or `activeGig`.
- [ ] **The "Travel" Animation:**
  - Implement Svelte `crossfade` so clicking a band in the Timeline "sends" the card to the Sidecar or the Bands list.
  - Ensure object permanence (the user sees the data move).

### Tactical Objective 2.3: The Map Polish
- [ ] **Leaflet Config:**
  - Force Grayscale tiles (CSS filter: `grayscale(100%) invert(100%)` for dark mode).
  - Add Custom Markers (Simple circle/div icons, no default blue pins).
  - **Interactivity:** Clicking a marker scrolls the page to that Venue's history section.

## Phase 3: Data Injection (Next)
- [ ] Connect DuckDB/JSON loader to populate the Timeline.