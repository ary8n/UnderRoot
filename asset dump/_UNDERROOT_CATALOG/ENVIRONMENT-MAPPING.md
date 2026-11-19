# UNDERROOT Environment Mapping

## Greenhouse

**Recommended:** Woods `Backgrounds/` layers as distant exterior/parallax, Woods `Decorations/GRASS*` and `BUSH*` as foreground vegetation, and Woods `Tiles/Tilesheet - WOODS.png` for the structural ground. Add PostApoc Workshop room tiles or IndustrialPunk tiles only for reclaimed frames, vents, and machinery after scale/licence confirmation.

**Composition:** use Woods backgrounds behind a greenhouse silhouette; place grass/bush decorations in front of the floor; reserve industrial props for readable focal points. The 512x288 layer dimensions make the Woods backgrounds a natural scene-resolution match.

## Overgrowth

**Recommended:** Woods `WOODS - First/Second/Third/Fourth.png`, `VINES - Second.png`, `BUSH - BACKGROUND.png`, and all grass/bush/mushroom decorations. Use Underground plant files and `moss_bg.png` as a transition layer into a contaminated or subterranean overgrowth zone.

**Composition:** keep the Woods palette dominant, then introduce Underground cyan/magenta crystals or acid as rare high-saturation accents. Avoid placing 16x16 cave tiles directly against 32x32 Woods tiles without a 2x logical-scale bridge.

## Undergrowth

**Recommended:** Underground native `terrain/` and `mine_*` tiles, `background/moss_bg.png`, `plants/`, `crystals/`, and animated `water_surface.gif` / `acid_surface.gif`. PostApoc Workshop gadgets, platforms, and room tiles can establish buried infrastructure.

**Composition:** build the playable layer from 16x16 Underground terrain, use cave/deep backgrounds behind it, then add plants/crystals and restrained industrial props. Keep animated liquids as effects and avoid mixing the Underground x4 exports with native files in the same pipeline.

## Asset selection matrix

| Environment | Base | Vegetation | Structure / props | Effects |
|---|---|---|---|---|
| Greenhouse | Woods tilesheet | Woods grass, bushes, mushrooms | PostApoc/IndustrialPunk sparingly | Woods parallax |
| Overgrowth | Woods backgrounds + decorations | Woods vines/bushes + Underground plants | Reclaimed IndustrialPunk | Fireflies, water, crystals |
| Undergrowth | Underground mine/cave terrain | Underground plants, crystals | PostApoc Workshop room tiles/gadgets | Acid, lava, water, glow animations |
