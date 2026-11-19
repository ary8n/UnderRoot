# Top-Down Greenhouse Architecture

- `src/data/greenhouseWorld.js` and `src/data/undergroundNightWorld.js`: room bounds, map props, interactions, and ambient zones. Legacy walkable and solid geometry is not used for movement.
- `src/main.js`: keyboard and virtual joystick input, normalized free-roam movement bounded by world edges, ghost rendering, camera, map compositing, interactions, save state, map debug overlay, and UI.
- `assets/generated/greenhouse-map.png`: authored world art only; mechanics are data-driven separately.
- `index.html` and `style.css`: responsive pixel-crisp canvas and integrated keyboard legend.

To add a room, extend the world data with room bounds, props, interaction points, and ambient zones. Keep the map edges connected when areas should feel continuous. For a story gate, add an interaction and progression condition; physical collision is not used. Keep art assets at native pixel scale. Use F3 in play mode to inspect room bounds and interaction points.

The legacy `src/data/greenhouse.js` belongs to the retired side-scrolling prototype. The top-down game imports only `src/data/greenhouseWorld.js`.

Area 01 is the first milestone. The remaining six world areas are not being built as part of this redesign pass.
