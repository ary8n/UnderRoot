# Greenhouse Asset and Perspective Audit

## Asset-pack inspection

The provided `asset dump.zip` includes its `_UNDERROOT_CATALOG` with art direction, catalogue, compatibility, source and environment-mapping notes. The source archives and existing extracted Woods images were preserved.

The Woods backgrounds are 512 × 288 parallax plates and depict a side-view world. The small Woods bushes, grass and fern images are low horizontal silhouettes, not overhead room tiles. The Underground Cave and Crystal sample is explicitly platformer composition; its 16 × 16 tiles and props are mostly front-facing cave-wall, platform, pickup and hazard art. IndustrialPunk and PostApoc Workshop have valuable industrial motifs and 16 × 16 slicing guidance, but their inspected room furniture and machinery are front-facing or side-view. They do not supply a coherent overhead greenhouse map or a four-directional character.

Those packs remain useful for later side-view or carefully selected prop work, but forcing their current images into this overhead map would create conflicting perspective and pixel scale. The provided user confirmed all packs are free to use; licence terms are not an implementation constraint for this project.

## Area 01 art

The new overhead environment is `assets/generated/greenhouse-map.png`, a purpose-made 1536 × 1024 pixel-art backdrop with a cutaway greenhouse, connected utility corridor, and adjoining settlement courtyard. It supplies the major architecture, planters, greenhouse equipment, garden paths, wind pump, water tanks and shed. The map contains no player, interface text or collision logic.

Small bespoke pixel props and the directional player sprite are drawn at runtime to match the scene. Woods parallax art is not used because its camera angle conflicts with the new overhead view. Original pack files in `assets/woods` and `asset dump.zip` remain intact.
