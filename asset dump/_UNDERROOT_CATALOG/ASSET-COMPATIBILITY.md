# UNDERROOT Asset Compatibility

## Compatibility rules

- **Primary scale:** use the Underground pack as the project pixel-scale anchor: 16x16 native tiles, point/nearest filtering, no smoothing.
- **Woods scale:** Woods tiles are explicitly 32x32, so use at 50% logical scale or upscale the 16x16 family by 2x; do not mix at 1:1. Its 512x288 backgrounds are scene layers, not tiles.
- **PostApoc Workshop:** its readme specifies 16x16 slicing, making it the strongest direct companion for Underground industrial props. Keep shadow/no-shadow variants consistent within a scene.
- **IndustrialPunk:** individual tile dimensions should be measured from the inventory before use; visually treat it as a separate industrial set until its source licence and scale are confirmed.
- **Palette:** Woods is natural green/brown; Underground is high-contrast cavern/crystal; PostApoc and IndustrialPunk are rusted industrial. Use shared accents (oxide orange, muted teal, fungal magenta) rather than forcing palette conversion.
- **Perspective:** all recommended sets are side-view/platformer or orthographic tile art. Do not mix with the Woods parallax layers as foreground tiles without a deliberate depth grade.

## Best combinations

| Combination | Why it works | Guardrails |
|---|---|---|
| Underground terrain + PostApoc Workshop props | Both target 16x16 workflows and support rooms, gadgets, hazards, and industrial spaces. | Match shadow policy; keep PostApoc icons for UI only. |
| Woods backgrounds + Woods decorations | Same documented pack, matching 512x288 parallax layers and vegetation silhouettes. | Treat the 32x32 tiles as a separate logical scale. |
| Underground cave/mine dirt + IndustrialPunk tiles | Strong narrative bridge from soil/cave to reclaimed machinery. | Confirm IndustrialPunk licence and tile scale; restrict IndustrialPunk to foreground set pieces if scale differs. |
| Underground crystals + sci-fi planet images | Shared cyan/purple glow language for deep-tech or alien rooms. | Planet files lack provenance/licence metadata; use only after clearance. |
