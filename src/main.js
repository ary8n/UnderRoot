import { GREENHOUSE_WORLD } from './data/greenhouseWorld.js';
import { UNDERGROUND_NIGHT_WORLD } from './data/undergroundNightWorld.js';

let world = GREENHOUSE_WORLD;

const canvas = document.querySelector('#game');
if (!canvas) throw new Error('UNDERROOT: canvas #game is missing from index.html');
const ctx = canvas.getContext('2d', { alpha: false });
if (!ctx) throw new Error('UNDERROOT: Canvas 2D context is unavailable');

const BASE_W = 384;
const BASE_H = 256;
let W = BASE_W;
let H = BASE_H;
let mapZoom = 1;
let screenScale = 1;
ctx.imageSmoothingEnabled = false;
function viewWidth() { return W / mapZoom; }
function viewHeight() { return H / mapZoom; }
function cameraForPlayer() {
  const width = viewWidth(), height = viewHeight();
  return {
    x: world.width <= width ? (world.width - width) / 2 : Math.max(0, Math.min(world.width - width, player.x - width / 2)),
    y: world.height <= height ? (world.height - height) / 2 : Math.max(0, Math.min(world.height - height, player.y - height / 2)),
  };
}
function focusCameraOnPlayer() {
  const target = cameraForPlayer();
  camera.x = target.x;
  camera.y = target.y;
}
function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  screenScale = Math.max(Math.min(bounds.width / BASE_W, bounds.height / BASE_H), 1.25);
  W = Math.max(1, Math.round(bounds.width / screenScale));
  H = Math.max(1, Math.round(bounds.height / screenScale));
  const shortSide = Math.min(bounds.width, bounds.height);
  mapZoom = shortSide <= 520 ? .68 : shortSide <= 900 ? .78 : .9;
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
  }
  focusCameraOnPlayer();
}
let mapArt = null;
let mapReady = false;
let mapFailed = false;
function loadMapArt() {
  mapReady = false;
  mapFailed = false;
  const nextMap = new Image();
  mapArt = nextMap;
  nextMap.addEventListener('load', () => { if (mapArt === nextMap) mapReady = true; });
  nextMap.addEventListener('error', () => { if (mapArt === nextMap) mapFailed = true; console.error(`UNDERROOT: map art failed to load (${world.id})`, nextMap.src); });
  nextMap.src = new URL(world.mapAsset, import.meta.url).href;
}
loadMapArt();

const SAVE_KEY = 'underroot-exploration-v1';
const freshProgress = () => ({ seed: false, water: false, compost: false, power: false, restored: false, yardBed: false });
function readProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return freshProgress();
    return Object.fromEntries(Object.keys(freshProgress()).map(key => [key, raw[key] === true]));
  } catch { return freshProgress(); }
}
let progress = readProgress();
function saveProgress() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); } catch (error) { console.warn('UNDERROOT: progress could not be saved', error); } }

const player = { x: world.spawn.x, y: world.spawn.y, facing: 'down', moving: false, step: 0 };
const camera = { x: 0, y: 0 };
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
const keys = new Set();
const moveStick = document.querySelector('#move-stick');
const moveStickKnob = moveStick?.querySelector('.move-stick__knob');
const touchMode = window.matchMedia('(pointer: coarse)').matches;
const touchInteract = document.querySelector('#touch-interact');
const touchInteractName = document.querySelector('#touch-interact-name');
const touchInteractHint = touchInteract?.querySelector('small');
const touchPause = document.querySelector('#touch-pause');
const touchPauseIcon = touchPause?.querySelector('span');
const virtualStick = { x: 0, y: 0 };
let stickPointerId = null;
let scene = 'title';
let paused = false;
let dialog = null;
let tankNightMode = false;
let tankTransitionPending = false;
try { tankNightMode = localStorage.getItem('underroot-water-tank-night-v1') === 'true'; } catch {}
let notice = '';
let noticeEnd = 0;
let lastTime = 0;
let clock = 0;
let currentRoom = world.rooms[0];
let mapDebug = false;

const palette = {
  outline: '#24414a', body: '#d9f1d7', glow: '#9ef0d6', shade: '#79b9ad', eye: '#293642',
};
const sprites = {
  down: [
    '....OOOO....', '...OWWWWO...', '..OWWWWWO..', '.OWWWWWWWO.', 'OWWWWWWWWWO', 'OWWLEWWLEWWO', 'OWWLEWWLEWWO', 'OWWWSSSSWWWO', 'OWWWWWWWWWO', 'OWWWWWWWWWO', '.OWWWLLWWWO.', '.OWWLLLWWWO.', '..OWW..WWO..', '...OW..WO...', '....O..O....',
  ],
  up: [
    '....OOOO....', '...OWWWWO...', '..OWWWWWO..', '.OWWWWWWWO.', 'OWWWWWWWWWO', 'OWWWLWWLWWWO', 'OWWWWWWWWWO', 'OWWWSSSSWWWO', 'OWWWWWWWWWO', 'OWWWWWWWWWO', '.OWWWLLWWWO.', '.OWWLLLWWWO.', '..OWW..WWO..', '...OW..WO...', '....O..O....',
  ],
  side: [
    '....OOOO....', '...OWWWWO...', '..OWWWWWO..', '.OWWWWWWWO.', 'OWWWWWWWWWO', 'OWWWWWWLEWWO', 'OWWWWWWWWWO', 'OWWWSSSSWWWO', 'OWWWWWWWWWO', 'OWWWWWWWWWO', '.OWWWLLWWWO.', '.OWWLLLWWWO.', '..OWW..WWO..', '...OW..WO...', '....O..O....',
  ],
};
const spriteColor = { O: palette.outline, W: palette.body, L: palette.glow, S: palette.shade, E: palette.eye };

function insideWorld(x, y) {
  const body = { x: x - 5, y: y - 4, w: 10, h: 8 };
  return body.x >= 0 && body.y >= 0 && body.x + body.w <= world.width && body.y + body.h <= world.height;
}
function roomAt(x, y) {
  return world.rooms.find(room => x >= room.bounds.x && y >= room.bounds.y && x < room.bounds.x + room.bounds.w && y < room.bounds.y + room.bounds.h) || world.rooms[0];
}
function say(text, milliseconds = 2800) { notice = text; noticeEnd = clock + milliseconds; }
function openStory(object) { dialog = { title: object.title, text: object.text, action: 'E · close' }; }
function transitionWorld(nextWorld, spawn = nextWorld.spawn) {
  world = nextWorld;
  player.x = spawn.x; player.y = spawn.y; player.moving = false; player.facing = 'down';
  keys.clear(); dialog = null; paused = false; notice = '';
  currentRoom = roomAt(player.x, player.y);
  focusCameraOnPlayer();
  loadMapArt();
  say(world.id === 'underground-night' ? 'THE ROOT REACTOR STIRS BELOW.' : 'BACK TO THE GREENHOUSE.');
}
function interact(targetOverride = null) {
  if (scene !== 'play' || paused) return;
  if (dialog) { dialog = null; return; }
  const target = targetOverride || world.interactables
    .map(object => ({ object, distance: Math.hypot(object.x - player.x, object.y - player.y) }))
    .filter(entry => entry.distance < 36)
    .sort((a, b) => a.distance - b.distance)[0]?.object;
  if (!target) { say('Nothing nearby asks to be disturbed.'); return; }

  switch (target.kind) {
    case 'story': openStory(target); break;
    case 'seed':
      progress.seed = true; saveProgress();
      openStory({ title: target.title, text: progress.seed ? 'A dry tin of native seeds. Someone labelled each envelope by the patch of ground it once grew in. You tuck one into the field pouch.' : target.text });
      break;
    case 'water': progress.water = true; saveProgress(); openStory(target); break;
    case 'compost': progress.compost = true; saveProgress(); openStory(target); break;
    case 'power':
      progress.power = true; saveProgress();
      openStory({ title: target.title, text: 'The breaker clicks. Warm lamps return across the greenhouse, the rain pump begins to turn, and the east service gate releases its latch.' });
      break;
    case 'console': {
      const missing = [['seed', progress.seed], ['water', progress.water], ['compost', progress.compost]].filter(([, ready]) => !ready).map(([name]) => name);
      if (!progress.power) openStory({ title: target.title, text: 'The central console is dark. Its line runs through the lower service breaker.' });
      else if (missing.length) openStory({ title: target.title, text: `The console is ready, but the planting beds still need ${missing.join(', ')}. The field notes are old; the living rooms will show where to look.` });
      else if (!progress.restored) {
        progress.restored = true; saveProgress();
        openStory({ title: 'A LIVING SYSTEM', text: 'The console hums softly. Water finds the beds; the first dormant seeds take hold beneath the glass. Outside, the old path is ready to be tended too.' });
      } else openStory({ title: target.title, text: 'Sensors steady. The beds are growing at their own pace now.' });
      break;
    }
    case 'gate':
      if (!progress.power) openStory(target);
      else say('The east gate is open. The courtyard path continues beyond it.');
      break;
    case 'stairs': say('The stair is open. A low pump hums below the greenhouse.'); break;
    case 'optional':
      if (progress.restored) { progress.yardBed = true; saveProgress(); openStory({ title: target.title, text: 'The saved seeds settle into the courtyard bed. The path has room for another small garden.' }); }
      else openStory({ title: target.title, text: 'This bed is still workable, but it needs the greenhouse seed stock first.' });
      break;
    case 'transition': {
      if (tankTransitionPending) break;
      tankNightMode = true;
      tankTransitionPending = true;
      try { localStorage.setItem('underroot-water-tank-night-v1', 'true'); } catch {}
      say('NIGHT CURRENT FLOWS THROUGH THE TANK.', 1300);
      setTimeout(() => {
        tankTransitionPending = false;
        if (scene === 'play' && !paused) transitionWorld(UNDERGROUND_NIGHT_WORLD);
      }, 850);
      break;
    }
    // Return at the aisle junction, where all four directions remain connected.
    case 'return': transitionWorld(GREENHOUSE_WORLD, { x: 610, y: 940 }); break;
    default: openStory(target);
  }
}

function startGame() {
  scene = 'play'; paused = false;
  currentRoom = roomAt(player.x, player.y);
  focusCameraOnPlayer();
  canvas.focus({ preventScroll: true });
}
function updateVirtualStick(event) {
  if (!moveStick || !moveStickKnob) return;
  const bounds = moveStick.getBoundingClientRect();
  const limit = bounds.width * .27;
  let dx = (event.clientX - (bounds.left + bounds.width / 2)) / limit;
  let dy = (event.clientY - (bounds.top + bounds.height / 2)) / limit;
  const magnitude = Math.hypot(dx, dy);
  if (magnitude > 1) { dx /= magnitude; dy /= magnitude; }
  const strength = Math.hypot(dx, dy);
  if (strength < .14) { virtualStick.x = 0; virtualStick.y = 0; }
  else {
    const adjusted = (Math.min(1, strength) - .14) / .86;
    virtualStick.x = dx / strength * adjusted;
    virtualStick.y = dy / strength * adjusted;
  }
  moveStickKnob.style.transform = `translate(-50%,-50%) translate(${dx * limit}px,${dy * limit}px)`;
}
function resetVirtualStick(event) {
  if (stickPointerId !== null && event && event.pointerId !== stickPointerId) return;
  stickPointerId = null;
  virtualStick.x = 0; virtualStick.y = 0;
  if (moveStickKnob) moveStickKnob.style.transform = 'translate(-50%,-50%)';
}
function updateTouchControls() {
  if (!touchMode) return;
  const inGame = scene === 'play';
  moveStick.hidden = !inGame;
  touchPause.hidden = !inGame;
  touchPause.setAttribute('aria-pressed', String(paused));
  touchPause.setAttribute('aria-label', paused ? 'Resume' : 'Pause');
  if (touchPauseIcon) touchPauseIcon.textContent = paused ? '▶' : 'Ⅱ';

  const object = inGame && !paused && !dialog ? nearbyObject() : null;
  const showInteract = inGame && !paused && (Boolean(object) || Boolean(dialog));
  touchInteract.hidden = !showInteract;
  if (!showInteract) return;
  const target = object || { title: 'CONTINUE', x: player.x, y: player.y };
  touchInteractName.textContent = target.title;
  if (touchInteractHint) touchInteractHint.textContent = dialog ? 'TAP TO CONTINUE' : 'INSPECT';
  touchInteract.setAttribute('aria-label', dialog ? 'Continue' : `Inspect ${target.title}`);
  const scaleX = canvas.clientWidth / W;
  const scaleY = canvas.clientHeight / H;
  const targetX = (target.x - camera.x) * mapZoom * scaleX;
  const targetY = (target.y - camera.y) * mapZoom * scaleY;
  const buttonWidth = touchInteract.offsetWidth;
  const buttonHeight = touchInteract.offsetHeight;
  const left = Math.max(buttonWidth / 2 + 12, Math.min(canvas.clientWidth - buttonWidth / 2 - 12, targetX));
  const top = Math.max(buttonHeight + 12, Math.min(canvas.clientHeight - 12, targetY));
  touchInteract.style.left = `${Math.round(left)}px`;
  touchInteract.style.top = `${Math.round(top)}px`;
  touchInteract.classList.toggle('touch-interact--below', targetY < buttonHeight + 20);
}
moveStick?.addEventListener('pointerdown', event => {
  event.preventDefault();
  stickPointerId = event.pointerId;
  moveStick.setPointerCapture(event.pointerId);
  updateVirtualStick(event);
});
moveStick?.addEventListener('pointermove', event => {
  if (event.pointerId === stickPointerId) { event.preventDefault(); updateVirtualStick(event); }
});
moveStick?.addEventListener('pointerup', resetVirtualStick);
moveStick?.addEventListener('pointercancel', resetVirtualStick);
moveStick?.addEventListener('lostpointercapture', resetVirtualStick);
document.querySelector('#touch-interact')?.addEventListener('click', () => {
  if (scene === 'title') startGame();
  else interact();
});
document.querySelector('#touch-pause')?.addEventListener('click', () => {
  if (scene !== 'play') return;
  paused = !paused; dialog = null; keys.clear(); resetVirtualStick();
  updateTouchControls();
});
canvas.addEventListener('pointerdown', event => {
  if (scene === 'title') { startGame(); return; }
  canvas.focus({ preventScroll: true });
  if (scene !== 'play' || paused || dialog) return;
  const bounds = canvas.getBoundingClientRect();
  const clickX = camera.x + (event.clientX - bounds.left) * W / bounds.width / mapZoom;
  const clickY = camera.y + (event.clientY - bounds.top) * H / bounds.height / mapZoom;
  const clicked = world.interactables
    .map(object => ({ object, clickDistance: Math.hypot(object.x - clickX, object.y - clickY), playerDistance: Math.hypot(object.x - player.x, object.y - player.y) }))
    .filter(entry => entry.clickDistance < 24 && entry.playerDistance < 72)
    .sort((a, b) => a.clickDistance - b.clickDistance)[0]?.object;
  if (clicked) interact(clicked);
});
document.addEventListener('keydown', event => {
  const code = event.code;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) event.preventDefault();
  if (code === 'F3' && !event.repeat) { event.preventDefault(); mapDebug = !mapDebug; keys.clear(); return; }
  if (scene === 'title' && ['Enter', 'Space'].includes(code)) { startGame(); return; }
  if (code === 'Escape' && !event.repeat && scene === 'play') { paused = !paused; dialog = null; keys.clear(); resetVirtualStick(); updateTouchControls(); return; }
  if (code === 'KeyE' && !event.repeat && scene === 'play') { interact(); return; }
  if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(code)) keys.add(code);
}, { capture: true });
document.addEventListener('keyup', event => keys.delete(event.code), { capture: true });
window.addEventListener('blur', () => { keys.clear(); resetVirtualStick(); });

function update(dt) {
  clock += dt * 1000;
  if (scene !== 'play' || paused || dialog) { player.moving = false; return; }
  const dx = Math.max(-1, Math.min(1, Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) + virtualStick.x));
  const dy = Math.max(-1, Math.min(1, Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp')) + virtualStick.y));
  player.moving = dx !== 0 || dy !== 0;
  if (player.moving) {
    const length = Math.hypot(dx, dy);
    const moveX = dx / length * 112 * dt;
    const moveY = dy / length * 112 * dt;
    if (dx) player.facing = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : player.facing;
    if (dy && Math.abs(dy) >= Math.abs(dx)) player.facing = dy < 0 ? 'up' : 'down';
    if (insideWorld(player.x + moveX, player.y)) player.x += moveX;
    if (insideWorld(player.x, player.y + moveY)) player.y += moveY;
    player.step += dt * 12;
  }
  currentRoom = roomAt(player.x, player.y);
  const target = cameraForPlayer();
  const targetX = target.x;
  const targetY = target.y;
  camera.x += (targetX - camera.x) * Math.min(1, dt * 7);
  camera.y += (targetY - camera.y) * Math.min(1, dt * 7);
}

function drawPixelSprite(x, y) {
  const facing = player.facing === 'left' || player.facing === 'right' ? 'side' : player.facing;
  const rows = sprites[facing];
  ctx.save();
  ctx.translate(Math.round(x - 6), Math.round(y - 9));
  if (player.facing === 'left') { ctx.translate(12, 0); ctx.scale(-1, 1); }
  ctx.globalAlpha = .94;
  for (let row = 0; row < rows.length; row++) {
    for (let col = 0; col < rows[row].length; col++) {
      const pixel = rows[row][col];
      const color = spriteColor[pixel];
      if (color) { ctx.fillStyle = color; ctx.fillRect(col, row, 1, 1); }
    }
  }
  ctx.restore();
}
function drawPlayer() {
  const x = player.x - camera.x;
  const y = player.y - camera.y;
  const bob = Math.sin(clock / 230) * 1.35 + (player.moving ? Math.sin(player.step * 1.4) * .45 : 0);
  const ghostY = y + bob;
  ctx.save();
  const aura = ctx.createRadialGradient(x, ghostY, 1, x, ghostY, 17);
  aura.addColorStop(0, 'rgba(151,255,226,.25)'); aura.addColorStop(1, 'rgba(72,199,183,0)');
  ctx.fillStyle = aura; ctx.fillRect(x - 18, ghostY - 18, 36, 36);
  ctx.globalAlpha = .2; ctx.fillStyle = '#91eed5'; ctx.beginPath(); ctx.ellipse(x, y + 9, 4.5, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = .9; ctx.fillStyle = '#d4fff0';
  const moteX = Math.round(x + Math.sin(clock / 260) * 10), moteY = Math.round(ghostY - 7 + Math.cos(clock / 310) * 8);
  ctx.fillRect(moteX, moteY, 1, 1);
  ctx.restore();
  drawPixelSprite(x, ghostY);
}

function drawProp(prop) {
  const x = Math.round(prop.x - camera.x), y = Math.round(prop.y - camera.y);
  if (x < -20 || x > viewWidth() + 20 || y < -24 || y > viewHeight() + 24) return;
  const box = (px, py, width, height, color) => { ctx.fillStyle = color; ctx.fillRect(x + px, y + py, width, height); };
  if (prop.type === 'cabinet') {
    box(-8,-6,16,12,'#302d25'); box(-7,-5,14,9,'#936343'); box(-5,-3,10,5,'#ba8a54'); box(-1,-1,2,2,'#e0c17b'); box(-6,5,12,2,'#40382a');
  } else if (prop.type === 'water-still') {
    box(-7,-8,14,15,'#413e30'); box(-5,-6,10,11,'#779887'); box(-4,-4,8,2,'#b5d1ad'); box(-8,-9,16,2,'#d3af6c'); box(-2,7,4,2,'#40382a');
  } else if (prop.type === 'console') {
    box(-9,-6,18,12,'#37332a'); box(-7,-5,14,9,'#9c754b'); box(-6,-4,12,5,progress.restored?'#93b27e':'#527b72'); box(-5,-3,5,2,'#c9d78d'); box(2,-2,4,2,'#dbad60'); box(-2,4,4,2,'#40382a');
  } else if (prop.type === 'compost') {
    box(-8,-5,16,11,'#302d25'); box(-7,-4,14,8,'#69523a'); box(-5,-3,10,2,'#879252'); box(-3,-1,3,3,'#9aa562'); box(2,-2,4,2,'#bc8a55'); box(-6,5,12,2,'#40382a');
  } else if (prop.type === 'breaker') {
    box(-7,-9,14,18,'#36352c'); box(-5,-7,10,14,'#79724e'); box(-4,-5,8,4,progress.power?'#7cad79':'#594c39'); box(-2,1,4,4,progress.power?'#dbcf83':'#b97950'); box(-1,2,2,2,'#e5cf83');
  } else if (prop.type === 'night-switch') {
    box(-10,-6,20,13,'#292d28'); box(-8,-4,16,9,'#83714d'); box(-6,-3,12,6,'#253b38');
    box(-3,-2,6,4,tankNightMode?'#8fffea':'#3aa6ae');
    box(-2,-1,4,2,tankNightMode?'#e3fff5':'#a4e6d2');
    ctx.fillStyle = '#d4c18e'; ctx.font = '5px monospace'; ctx.textAlign = 'center'; ctx.fillText('NIGHT', x, y + 12); ctx.textAlign = 'left';
  } else if (prop.type === 'surface-lift') {
    ctx.fillStyle = '#17242d'; ctx.fillRect(x - 12, y - 9, 24, 18);
    ctx.strokeStyle = '#69cde0'; ctx.lineWidth = 1; ctx.strokeRect(x - 11.5, y - 8.5, 23, 17);
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = '#4cb8d1'; ctx.globalAlpha = .72 + Math.sin(clock / 230) * .22; ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = '#eff6bf'; ctx.fill();
    ctx.fillStyle = '#d1ecdf'; ctx.fillRect(x - 2, y + 7, 4, 1);
  } else if (prop.type === 'night-reactor') {
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fillStyle = '#35ced055'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = '#9df4da'; ctx.fill();
    ctx.fillStyle = '#e9f7bc'; ctx.fillRect(x - 1, y - 1, 2, 2);
  }
}
function drawProps() { for (const prop of world.props) drawProp(prop); }
function drawMap() {
  const width = viewWidth(), height = viewHeight();
  ctx.fillStyle = '#1a2923'; ctx.fillRect(0, 0, width, height);
  if (mapReady) {
    const sx = Math.max(0, camera.x), sy = Math.max(0, camera.y);
    const ex = Math.min(world.width, camera.x + width), ey = Math.min(world.height, camera.y + height);
    if (ex > sx && ey > sy) ctx.drawImage(mapArt, sx, sy, ex - sx, ey - sy, sx - camera.x, sy - camera.y, ex - sx, ey - sy);
  } else {
    ctx.fillStyle = '#e0c995'; ctx.font = '14px monospace'; ctx.textAlign = 'center';
    ctx.fillText(mapFailed ? 'WORLD MAP COULD NOT BE LOADED' : 'OPENING THE WORLD…', width / 2, height / 2);
    ctx.textAlign = 'left';
  }
  // Soft room-specific light keeps the paths and glass readable at game scale.
  const ambient = world.ambient.find(layer => player.x >= layer.rect.x && player.x <= layer.rect.x + layer.rect.w && player.y >= layer.rect.y && player.y <= layer.rect.y + layer.rect.h);
  if (ambient) { ctx.fillStyle = ambient.color; ctx.globalAlpha = ambient.strength; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1; }
  const isNight = world.id === 'underground-night';
  for (let i = 0; i < (isNight ? 18 : 12); i++) {
    const worldX = isNight ? 880 + (i * 67 % 590) : 1050 + (i * 67 % 430);
    const worldY = (isNight ? 330 : 250) + (i * 59 % (isNight ? 610 : 500)) + Math.sin(clock / 520 + i) * 2;
    const x = Math.round(worldX - camera.x), y = Math.round(worldY - camera.y);
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    ctx.fillStyle = isNight ? (i % 3 === 0 ? '#75e4fa' : '#d596ff') : (i % 3 === 0 ? '#f3d480' : '#e0d996');
    ctx.globalAlpha = .5 + Math.sin(clock / 250 + i) * .2; ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}
function drawTankNightMode() {
  if (!tankNightMode || world.id !== 'greenhouse') return;
  const x = Math.round(674 - camera.x), y = Math.round(860 - camera.y);
  const pulse = .58 + Math.sin(clock / 170) * .08;
  ctx.save();
  const halo = ctx.createRadialGradient(x, y, 8, x, y, 82);
  halo.addColorStop(0, 'rgba(41,223,244,.34)');
  halo.addColorStop(1, 'rgba(41,223,244,0)');
  ctx.fillStyle = halo; ctx.fillRect(x - 82, y - 82, 164, 164);
  ctx.beginPath();
  ctx.moveTo(x - 35, y - 26); ctx.lineTo(x + 35, y - 26);
  ctx.lineTo(x + 40, y - 18); ctx.lineTo(x + 40, y + 16);
  ctx.lineTo(x + 32, y + 25); ctx.lineTo(x - 32, y + 25);
  ctx.lineTo(x - 40, y + 16); ctx.lineTo(x - 40, y - 18); ctx.closePath(); ctx.clip();
  ctx.globalAlpha = pulse; ctx.fillStyle = '#17cce5'; ctx.fillRect(x - 42, y - 28, 84, 56);
  ctx.globalAlpha = .5 + Math.sin(clock / 230) * .12; ctx.fillStyle = '#90fff0';
  ctx.fillRect(x - 37, y + 7, 74, 18);
  ctx.globalAlpha = .85; ctx.fillStyle = '#d5fff4';
  for (let i = 0; i < 6; i++) {
    const bx = x - 38 + (i * 31 % 76);
    const by = y + 22 - (clock / 45 + i * 17) % 48;
    ctx.fillRect(Math.round(bx), Math.round(by), 2, 2);
  }
  ctx.restore();
}
function drawHUD() {
  ctx.fillStyle = '#142019e8'; ctx.fillRect(8, 8, 174, 34);
  ctx.fillStyle = '#bd9360'; ctx.fillRect(8, 8, 174, 2);
  ctx.fillStyle = '#f0ddb1'; ctx.font = 'bold 9px monospace'; ctx.fillText(currentRoom.name.toUpperCase(), 16, 23);
  const state = [['SEED',progress.seed],['WATER',progress.water],['SOIL',progress.compost],['POWER',progress.power]];
  state.forEach(([label, ready], i) => {
    const x = 16 + i * 39; ctx.fillStyle = ready ? '#a9c47a' : '#687463'; ctx.fillRect(x, 30, 4, 4);
    ctx.fillStyle = ready ? '#e8d6a9' : '#9aa08a'; ctx.font = '6px monospace'; ctx.fillText(label, x + 6, 35);
  });
  if (progress.restored) { ctx.fillStyle = '#15231ccc'; ctx.fillRect(W - 104, 8, 96, 18); ctx.fillStyle = '#d9da9a'; ctx.font = '7px monospace'; ctx.fillText('ROOTS ARE WAKING', W - 98, 20); }
}
function nearbyObject() {
  return world.interactables.map(object => ({ object, distance: Math.hypot(object.x - player.x, object.y - player.y) })).filter(entry => entry.distance < 36).sort((a,b) => a.distance - b.distance)[0]?.object;
}
function drawPrompt() {
  const object = nearbyObject(); if (!object || dialog || paused || touchMode) return;
  const label = `E / CLICK  ${object.title}`;
  ctx.font = '8px monospace'; const width = Math.min(240, ctx.measureText(label).width + 22);
  const x = Math.max(6, Math.min(W - width - 6, (player.x - camera.x) * mapZoom - width / 2));
  const y = Math.max(50, (player.y - camera.y) * mapZoom - 28);
  ctx.fillStyle = '#142019ee'; ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(width), 16);
  ctx.fillStyle = '#d8bd7f'; ctx.fillRect(Math.round(x), Math.round(y), 2, 16);
  ctx.fillStyle = '#f0ddb1'; ctx.fillText(label, Math.round(x + 8), Math.round(y + 11));
}
function drawNotice() {
  if (!notice || clock >= noticeEnd) return;
  ctx.font = '8px monospace';
  const width = Math.min(W - 24, ctx.measureText(notice).width + 22);
  const x = Math.round((W - width) / 2), y = 48;
  ctx.fillStyle = '#142019ed'; ctx.fillRect(x, y, Math.ceil(width), 18);
  ctx.fillStyle = '#d4a763'; ctx.fillRect(x, y, 2, 18);
  ctx.fillStyle = '#f0ddb1'; ctx.textAlign = 'center'; ctx.fillText(notice, W / 2, y + 12); ctx.textAlign = 'left';
}function drawDialog() {
  if (!dialog) return;
  ctx.fillStyle = '#111a16ec'; ctx.fillRect(14, H - 74, W - 28, 62);
  ctx.fillStyle = '#ba8a58'; ctx.fillRect(14, H - 74, W - 28, 2);
  ctx.fillStyle = '#e7c786'; ctx.font = 'bold 9px monospace'; ctx.fillText(dialog.title, 24, H - 58);
  ctx.fillStyle = '#e0dcc4'; ctx.font = '8px monospace';
  const words = dialog.text.split(/\s+/); let line = ''; let row = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > W - 52 && line) { ctx.fillText(line, 24, H - 44 + row * 10); line = word; row++; }
    else line = test;
    if (row >= 2) break;
  }
  if (line && row < 3) ctx.fillText(line, 24, H - 44 + row * 10);
  ctx.fillStyle = '#b5bc91'; ctx.textAlign = 'right'; ctx.fillText(dialog.action, W - 22, H - 20); ctx.textAlign = 'left';
}
function drawTitle() {
  const panelWidth = Math.min(264, W - 24);
  const panelX = Math.round((W - panelWidth) / 2), panelY = Math.round((H - 116) / 2);
  ctx.fillStyle = '#09110c9c'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#17231c'; ctx.fillRect(panelX, panelY, panelWidth, 116);
  ctx.fillStyle = '#d4a763'; ctx.fillRect(panelX, panelY, panelWidth, 2);
  ctx.fillStyle = '#f0ddb1'; ctx.textAlign = 'center'; ctx.font = 'bold 28px monospace'; ctx.fillText('UNDERROOT', W / 2, panelY + 38);
  ctx.fillStyle = '#b9c697'; ctx.font = '9px monospace'; ctx.fillText('A QUIET ECOLOGICAL EXPLORATION', W / 2, panelY + 56);
  ctx.fillStyle = '#e2c47e'; ctx.font = '9px monospace'; ctx.fillText(touchMode ? 'TAP TO STEP INSIDE' : 'ENTER  ·  STEP INSIDE', W / 2, panelY + 96); ctx.textAlign = 'left';
}
function drawPause() {
  const panelWidth = Math.min(152, W - 24);
  const panelX = Math.round((W - panelWidth) / 2), panelY = Math.round((H - 56) / 2);
  ctx.fillStyle = '#09110cb0'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#18251d'; ctx.fillRect(panelX, panelY, panelWidth, 56);
  ctx.fillStyle = '#d4a763'; ctx.fillRect(panelX, panelY, panelWidth, 2); ctx.fillStyle = '#f0ddb1'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.fillText('PAUSED', W / 2, panelY + 24);
  ctx.fillStyle = '#b9c697'; ctx.font = '8px monospace'; ctx.fillText('ESC · return to the garden', W / 2, panelY + 42); ctx.textAlign = 'left';
}
function drawMapDebug() {
  if (!mapDebug) return;
  ctx.save(); ctx.lineWidth = 1;
  for (const room of world.rooms) {
    ctx.setLineDash([3, 2]); ctx.strokeStyle = '#ffd34d';
    ctx.strokeRect((room.bounds.x - camera.x) * mapZoom, (room.bounds.y - camera.y) * mapZoom, room.bounds.w * mapZoom, room.bounds.h * mapZoom);
    ctx.setLineDash([]); ctx.fillStyle = '#ffe99b'; ctx.font = '6px monospace';
    ctx.fillText(`ROOM ${room.id}`, (room.bounds.x - camera.x + 3) * mapZoom, (room.bounds.y - camera.y + 16) * mapZoom);
  }
  for (const object of world.interactables) {
    const x = (object.x - camera.x) * mapZoom, y = (object.y - camera.y) * mapZoom;
    ctx.beginPath(); ctx.arc(x, y, 3 * mapZoom, 0, Math.PI * 2); ctx.fillStyle = '#39c9ff99'; ctx.fill();
    ctx.strokeStyle = '#8be5ff'; ctx.stroke(); ctx.fillStyle = '#c8f4ff'; ctx.font = '6px monospace';
    ctx.fillText(`I ${object.id}`, x + 4 * mapZoom, y - 3 * mapZoom);
  }
  ctx.beginPath(); ctx.arc((player.x - camera.x) * mapZoom, (player.y - camera.y) * mapZoom, 8 * mapZoom, 0, Math.PI * 2);
  ctx.strokeStyle = '#a6fffb'; ctx.stroke();
  ctx.fillStyle = '#142019ed'; ctx.fillRect(6, H - 32, W - 12, 26);
  ctx.fillStyle = '#f0ddb1'; ctx.font = '6px monospace';
  ctx.fillText('F3 MAP VIEW · YELLOW AREAS · BLUE INTERACTIONS · CYAN GHOST · FREE ROAM', 10, H - 21);
  ctx.fillStyle = '#c8d6b1';
  ctx.fillText(`GHOST ${Math.round(player.x)},${Math.round(player.y)} · ${currentRoom.id}`, 10, H - 10);
  ctx.restore();
}
function render(now) {
  requestAnimationFrame(render);
  const dt = Math.min(.05, Math.max(0, (now - (lastTime || now)) / 1000)); lastTime = now;
  update(dt);
  updateTouchControls();
  ctx.clearRect(0, 0, W, H);
  ctx.save(); ctx.scale(mapZoom, mapZoom);
  drawMap(); drawTankNightMode(); drawProps(); drawPlayer();
  ctx.restore();
  drawHUD(); drawNotice(); drawPrompt();
  if (scene === 'title') drawTitle();
  if (paused) drawPause();
  if (dialog) drawDialog();
  drawMapDebug();
}
requestAnimationFrame(render);
