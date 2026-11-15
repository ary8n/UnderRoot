// A connected night-cavern branch reached through the greenhouse service water tank.
export const UNDERGROUND_NIGHT_WORLD = {
  id: 'underground-night',
  mapAsset: '../assets/generated/underground-night-map.png',
  width: 1536,
  height: 1024,
  spawn: { x: 210, y: 900 },
  rooms: [
    { id: 'night-entry', name: 'Night Cavern · Entry', bounds: { x: 18, y: 740, w: 450, h: 266 } },
    { id: 'reactor-chamber', name: 'Root Reactor', bounds: { x: 230, y: 150, w: 620, h: 650 } },
    { id: 'waterworks', name: 'Underground Waterworks', bounds: { x: 620, y: 18, w: 898, h: 330 } },
    { id: 'fungal-grove', name: 'Fungal Network', bounds: { x: 770, y: 285, w: 748, h: 721 } },
  ],
  walkable: [
    // Stone routes connect the entrance stair, reactor court, waterworks and grove.
    { id: 'entry-stair', x: 18, y: 740, w: 250, h: 266 },
    { id: 'lower-entry-road', x: 190, y: 820, w: 300, h: 186 },
    { id: 'lower-central-road', x: 380, y: 780, w: 520, h: 226 },
    { id: 'reactor-south-approach', x: 420, y: 600, w: 220, h: 220 },
    { id: 'reactor-court', x: 360, y: 478, w: 270, h: 142 },
    { id: 'reactor-west-path', x: 270, y: 330, w: 110, h: 300 },
    { id: 'reactor-east-path', x: 600, y: 403, w: 220, h: 120 },
    { id: 'waterworks-approach', x: 780, y: 330, w: 160, h: 145 },
    { id: 'upper-waterworks-road', x: 780, y: 270, w: 738, h: 78 },
    { id: 'fungal-west-path', x: 820, y: 430, w: 190, h: 210 },
    { id: 'fungal-memory-road', x: 990, y: 500, w: 245, h: 150 },
    { id: 'fungal-center-loop', x: 900, y: 620, w: 310, h: 210 },
    { id: 'fungal-north-loop', x: 1000, y: 420, w: 184, h: 100 },
    { id: 'fungal-east-west-path', x: 1184, y: 420, w: 194, h: 112 },
    { id: 'fungal-east-path', x: 1330, y: 420, w: 48, h: 290 },
    { id: 'fungal-lower-loop', x: 1210, y: 700, w: 170, h: 120 },
  ],
  solids: [
    { x: 0, y: 0, w: 1536, h: 18, id: 'north-rock-rim', category: 'rock' },
    { x: 0, y: 0, w: 18, h: 1024, id: 'west-rock-rim', category: 'rock' },
    { x: 1536, y: 0, w: 18, h: 1024, id: 'east-rock-rim', category: 'rock' },
    { x: 0, y: 1006, w: 1536, h: 18, id: 'south-rock-rim', category: 'rock' },

    // The reactor housing blocks the center while leaving its south approach open.
    { id: 'reactor-core-housing', category: 'machinery', shape: 'polygon', points: [[393,310],[423,285],[490,280],[544,307],[572,348],[572,414],[546,456],[505,478],[435,478],[396,456],[372,417],[372,355]] },
    { x: 329, y: 324, w: 28, h: 56, id: 'reactor-west-pipe-foot', category: 'machinery' },
    { x: 591, y: 324, w: 28, h: 56, id: 'reactor-east-pipe-foot', category: 'machinery' },
    { x: 386, y: 493, w: 32, h: 24, id: 'reactor-south-left-support', category: 'machinery' },
    { x: 532, y: 493, w: 32, h: 24, id: 'reactor-south-right-support', category: 'machinery' },

    // Channels and falls are blocked; paths follow the dry stone banks.
    { id: 'upper-river', category: 'water', shape: 'polygon', points: [[682,82],[727,53],[904,49],[1085,63],[1215,40],[1536,36],[1536,232],[1490,254],[1402,250],[1332,270],[1244,258],[1170,277],[1082,247],[1005,242],[941,218],[864,228],[798,211],[742,194],[692,160]] },
    { id: 'reactor-fall-pool', category: 'water', shape: 'polygon', points: [[650,210],[690,198],[735,224],[774,273],[793,326],[789,378],[760,403],[719,381],[699,334],[668,299],[640,265]] },
    { id: 'east-lower-stream', category: 'water', shape: 'polygon', points: [[1400,755],[1452,735],[1518,750],[1536,792],[1536,976],[1496,1006],[1439,987],[1408,944],[1380,891],[1378,817]] },

    // Raised fungal beds, rock clusters and crystal bases follow their ground rims.
    { id: 'upper-right-mushroom-bed', category: 'planter', shape: 'polygon', points: [[1190,282],[1224,262],[1317,266],[1368,294],[1386,344],[1370,396],[1330,420],[1248,414],[1204,386],[1184,334]] },
    { id: 'east-middle-mushroom-bed', category: 'planter', shape: 'polygon', points: [[1378,436],[1410,407],[1506,414],[1536,446],[1536,568],[1502,592],[1422,582],[1384,544]] },
    { id: 'east-lower-mushroom-bed', category: 'planter', shape: 'polygon', points: [[1380,690],[1422,666],[1516,676],[1536,714],[1536,862],[1508,888],[1420,870],[1380,826]] },
    { id: 'lower-crystal-garden', category: 'planter', shape: 'polygon', points: [[1088,842],[1115,811],[1192,812],[1230,843],[1232,906],[1204,940],[1125,935],[1086,900]] },
    { x: 809, y: 374, w: 72, h: 58, id: 'west-bank-rocks', category: 'rock' },
    { x: 899, y: 469, w: 80, h: 62, id: 'central-rock-outcrop', category: 'rock' },
    { x: 973, y: 684, w: 98, h: 72, id: 'lower-bank-rocks', category: 'rock' },
    { x: 1284, y: 774, w: 76, h: 62, id: 'crystal-cluster-foot', category: 'crystal' },
    { x: 1018, y: 342, w: 44, h: 38, id: 'blue-crystal-foot', category: 'crystal' },
    { x: 716, y: 592, w: 54, h: 44, id: 'violet-crystal-foot', category: 'crystal' },
  ],
  gates: [],
  props: [
    { id: 'root-reactor', x: 482, y: 507, type: 'night-reactor' },
    { id: 'greenhouse-lift', x: 151, y: 896, type: 'surface-lift' },
  ],
  interactables: [
    { id: 'root-reactor', x: 482, y: 507, title: 'ROOT REACTOR', kind: 'story', text: 'The chamber is running on a quiet reserve. Roots carry its remaining light into the water and the fungal beds. The greenhouse console may be able to wake the network.' },
    { id: 'waterworks-memory', x: 828, y: 306, title: 'WATERWORKS MARKER', kind: 'story', text: 'The channels were cut around the living roots. The falls still move water even when the reactor sleeps.' },
    { id: 'fungal-memory', x: 1120, y: 558, title: 'FUNGAL NETWORK', kind: 'story', text: 'The caps pulse softly with the water below. Tiny filaments run back toward the reactor housing.' },
    { id: 'return-greenhouse', x: 151, y: 896, title: 'GREENHOUSE LIFT', kind: 'return' },
  ],
  ambient: [
    { id: 'reactor-glow', rect: { x: 260, y: 150, w: 520, h: 560 }, color: '#4ecbc6', strength: 0.07 },
    { id: 'fungal-glow', rect: { x: 1040, y: 265, w: 496, h: 720 }, color: '#b34ed8', strength: 0.055 },
    { id: 'water-glow', rect: { x: 720, y: 18, w: 816, h: 325 }, color: '#35b8df', strength: 0.06 },
  ],
};
