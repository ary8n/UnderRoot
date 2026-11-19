# Area 01 — Greenhouse and Settlement

Area 01 is a single continuous, overhead map (`1536 × 1024` world pixels). A top-down greenhouse, its lower service passage, and the adjacent settlement courtyard connect through a central stair and an east service gate. The ghost can roam freely across the painted map; movement is bounded only by the map edges.

## Room layout

| Room | World bounds | Connection |
|---|---|---|
| Greenhouse laboratory | x 18–948, y 18–698 | Starting room; south service stair and east gate |
| Service stair | x 468–596, y 688–792 | Open passage between greenhouse and lower corridor |
| Lower service passage | x 18–948, y 770–960 | Pumps, breaker, compost and research notes |
| Settlement courtyard | x 908–1536, y 0–1024 | East gate; winding garden paths, wind pump, tanks and shed |

Room bounds label spaces for the HUD and map debug overlay. They do not constrain movement. The ghost can drift over beds, machinery, walls and gates; gate power still matters to restoration progression.

## Free-roam movement

`src/data/greenhouseWorld.js` and `src/data/undergroundNightWorld.js` define the active areas. The older `src/data/greenhouse.js` describes the retired side-scrolling prototype and is not imported by the game.

Legacy walkable rectangles and object collision footprints remain as map notes, but movement does not consult them. Interactions continue to use their markers and proximity checks.

The **F3 map view** is a developer overlay: yellow outlines room bounds, blue marks interactions, and cyan marks the ghost. It does not show movement blockers.

## Movement and camera

Movement is normalized in four directions for keyboard and touch joystick input. The ghost passes over all map geometry and remains inside the world bounds. The camera follows both axes across the 1536 × 1024 map. The canvas is a 384 × 256 logical viewport with nearest-neighbour scaling.

## Exploration and restoration

The greenhouse contains the field notes, seed cabinet, rain still and restoration console. The service passage contains the compost bin and main breaker. Power opens the east gate; the console responds to the seed, water, compost and power state. The courtyard is directly explorable after the gate is powered and includes additional environmental notes and an optional garden bed. Progress is saved under `underroot-exploration-v1`; earlier saves are left untouched.
