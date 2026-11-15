# Area 01 — Greenhouse and Settlement

Area 01 is a single continuous, overhead map (`1536 × 1024` world pixels). A top-down greenhouse, its lower service passage, and the adjacent settlement courtyard connect through a central stair and an east service gate. The map is painted as one coherent backdrop; the game separately defines walkable zones, walls, furnishings, gates, props, and story interactions.

## Room layout

| Room | World bounds | Connection |
|---|---|---|
| Greenhouse laboratory | x 18–948, y 18–698 | Starting room; south service stair and east gate |
| Service stair | x 468–596, y 688–792 | Open passage between greenhouse and lower corridor |
| Lower service passage | x 18–948, y 770–960 | Pumps, breaker, compost and research notes |
| Settlement courtyard | x 908–1536, y 0–1024 | East gate; winding garden paths, wind pump, tanks and shed |

These room bounds label the spaces; the named walkable lanes below control where the player can step. The gate at x=948, y=510–604 stays blocked until the lower breaker is restored. The service stair remains open from the start.

## Walkable routes and collision inventory

`src/data/greenhouseWorld.js` is the active area definition. The older `src/data/greenhouse.js` describes the retired side-scrolling prototype and is not imported by the game.

Walkable zones trace the paved aisles around the planting beds and console, the central stair, the lower utility floor, and the courtyard’s stone routes. The player cannot leave these lanes for greenhouse beds or courtyard grass. The routes connect the notes, seed cabinet, rain still, console, service-room equipment, courtyard wind pump, shed and optional bed.

| Section | Solid objects and boundaries | Geometry choice |
|---|---|---|
| Greenhouse | Glass perimeter, south wall and stair walls | Continuous rectangles with explicit doorway gaps |
| Greenhouse | North water garden; west/east display beds; console side islands; two south beds | Polygon footprints follow the clipped stone rims |
| Greenhouse | Research bench, stool, storage cabinet, console base, seed cabinet, cisterns, rain controls, east service bench and cabinet | Rectangles at the furniture or machinery base; overhead foliage stays passable |
| Service passage | Passage foundation, pump feet, tank base, electrical cabinet bases, compost bin | Wall rectangle and compact grounded footprints |
| Courtyard | Windmill foot, cistern bases, shed foundation, water cart, round/tree bed, vegetable beds, arch supports and north stream | Small base rectangles, planter polygons and one water polygon; arch openings stay open |

The underground night area uses the same route-only rule. Its entry stair connects to the reactor approach, upper waterworks bridge, and fungal-grove paths; mushroom beds, crystals, rocks and water remain blocked.

Flowers, small plants, grass, shadows, roof beams, wall-mounted pipes and floor texture do not add collision. Interactive markers remain independent of the blockers. The console marker is positioned at its reachable south edge; other equipment can be inspected from adjacent floor without entering its footprint.

The temporary collision view toggles with **F3** and is off by default. Green shows walkable zones, red shows current blockers (including a closed gate), yellow outlines room bounds, blue marks interactables, and cyan shows the player AABB. It is rendered after the world so it is visible during route checks.

## Movement and camera

Movement is normalized in four directions. Axis-separated AABB collision lets the player slide along furniture and planter edges. Rectangles represent walls and compact physical bases; polygon-vs-AABB SAT tests follow irregular raised beds and the stream edge. The player footprint is 10 × 8 world pixels, smaller than the sprite so the feet anchor collision. Diagonal speed is unchanged. The camera follows both axes across the 1536 × 1024 map. The canvas is a 384 × 256 logical viewport with nearest-neighbour scaling.

## Exploration and restoration

The greenhouse contains the field notes, seed cabinet, rain still and restoration console. The service passage contains the compost bin and main breaker. Power opens the east gate; the console responds to the seed, water, compost and power state. The courtyard is directly explorable after the gate is powered and includes additional environmental notes and an optional garden bed. Progress is saved under `underroot-exploration-v1`; earlier saves are left untouched.
