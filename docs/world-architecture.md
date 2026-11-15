# Top-Down Greenhouse Architecture

- `src/data/greenhouseWorld.js` and `src/data/undergroundNightWorld.js`: room bounds, named path-only walkable zones, rectangle and polygon collision footprints, gates, props, interactions, and ambient zones.
- `src/main.js`: keyboard state, normalized axis-separated movement, rectangle/polygon collision checks, camera, pixel-sprite rendering, map compositing, interactions, save state, debug overlay, and UI.
- `assets/generated/greenhouse-map.png`: authored world art only; mechanics are data-driven separately.
- `index.html` and `style.css`: responsive pixel-crisp canvas and integrated keyboard legend.

To add a room, extend the world data with its walkable bounds, wall/obstacle rectangles or polygon footprints, props and interaction points. Connect it with overlapping walkable bounds and a visible passage; do not simulate a doorway as a teleport between unrelated biome screens. For an authored gate, add a `gates` rectangle and unlock condition. Keep art assets at native pixel scale and keep collision separate from decorative pixels. Use F3 in play mode to inspect active collision data; it shows walkable regions, room bounds, closed gates, blockers, interaction points and the player footprint. The overlay is disabled by default.

The legacy `src/data/greenhouse.js` belongs to the retired side-scrolling prototype. The top-down game imports only `src/data/greenhouseWorld.js`.

Area 01 is the first milestone. The remaining six world areas are not being built as part of this redesign pass.
