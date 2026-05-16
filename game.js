const GRID = 5;
const CELL = 124;
const PAD = 10;
const CANVAS_SIZE = CELL * GRID + PAD * 2;

const INK = '#2a2a2a';
const CHEEK = '#ffb8c8';

const LEVELS = [
  { name: 'Plateau 1 — Tagada rose',   start: { col: 0, row: 0, dir: 1 }, pot: { col: 4, row: 4 }, obstacles: [],
    color: '#ff8db3', colorDeep: '#c46285', colorName: 'rose' },
  { name: 'Plateau 2 — Tagada bleue',  start: { col: 0, row: 4, dir: 0 }, pot: { col: 2, row: 2 }, obstacles: [{ col: 1, row: 3 }],
    color: '#82c8e5', colorDeep: '#4a90a8', colorName: 'bleue' },
  { name: 'Plateau 3 — Tagada citron', start: { col: 2, row: 2, dir: 1 }, pot: { col: 4, row: 0 }, obstacles: [{ col: 3, row: 2 }, { col: 4, row: 1 }],
    color: '#ffd866', colorDeep: '#c4a040', colorName: 'jaune' },
  { name: 'Plateau 4 — Tagada pomme',  start: { col: 4, row: 0, dir: 2 }, pot: { col: 0, row: 4 }, obstacles: [{ col: 2, row: 2 }],
    color: '#9eda9e', colorDeep: '#5a9c5c', colorName: 'verte' },
  { name: 'Plateau 5 — Tagada raisin', start: { col: 0, row: 2, dir: 1 }, pot: { col: 4, row: 2 }, obstacles: [{ col: 2, row: 1 }, { col: 2, row: 3 }, { col: 1, row: 2 }],
    color: '#c39ee6', colorDeep: '#8a6db5', colorName: 'violette' },
];

const state = {
  levelIndex: 0,
  tagada: null,
  program: [],
  busy: false,
  currentStep: -1,
  message: '',
  messageKind: '',
  shakeAmount: 0,
  animFrom: null,
  animTo: null,
  animStart: 0,
  animDur: 240,
  startTime: performance.now(),
  particles: [],
};

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function setupCanvasDpr() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = CANVAS_SIZE * dpr;
  canvas.height = CANVAS_SIZE * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
setupCanvasDpr();
window.addEventListener('resize', () => { setupCanvasDpr(); draw(); });

function applyAccent() {
  const lv = LEVELS[state.levelIndex];
  document.documentElement.style.setProperty('--accent', lv.color);
  document.documentElement.style.setProperty('--accent-deep', lv.colorDeep);
}

function loadLevel(i) {
  state.levelIndex = i;
  const lv = LEVELS[i];
  state.tagada = {
    col: lv.start.col, row: lv.start.row, dir: lv.start.dir,
    painted: false,
    displayCol: lv.start.col, displayRow: lv.start.row, displayDir: lv.start.dir,
  };
  state.program = [];
  state.currentStep = -1;
  state.busy = false;
  state.message = `Trouve le pot de peinture ${lv.colorName} pour Tagada.`;
  state.messageKind = '';
  state.shakeAmount = 0;
  applyAccent();
  renderUI();
  draw();
}

function cellCenter(col, row) {
  return { x: PAD + col * CELL + CELL / 2, y: PAD + row * CELL + CELL / 2 };
}

function drawGrid() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.strokeStyle = '#e6e0db';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  for (let i = 1; i < GRID; i++) {
    const p = PAD + i * CELL;
    ctx.beginPath(); ctx.moveTo(PAD, p); ctx.lineTo(PAD + GRID * CELL, p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p, PAD); ctx.lineTo(p, PAD + GRID * CELL); ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(PAD, PAD, GRID * CELL, GRID * CELL);
}

function drawObstacles() {
  const lv = LEVELS[state.levelIndex];
  for (const o of lv.obstacles) {
    const c = cellCenter(o.col, o.row);
    const r = CELL * 0.32;
    ctx.fillStyle = '#cfc8c2';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(c.x - r * 0.5, c.y, r * 0.6, 0, Math.PI * 2);
    ctx.arc(c.x, c.y - r * 0.35, r * 0.7, 0, Math.PI * 2);
    ctx.arc(c.x + r * 0.55, c.y, r * 0.6, 0, Math.PI * 2);
    ctx.arc(c.x + r * 0.2, c.y + r * 0.35, r * 0.55, 0, Math.PI * 2);
    ctx.arc(c.x - r * 0.3, c.y + r * 0.3, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawBonbon() {
  const lv = LEVELS[state.levelIndex];
  const c = cellCenter(lv.pot.col, lv.pot.row);

  const t = (performance.now() - state.startTime) / 1000;
  const pulse = 1 + Math.sin(t * 2.2) * 0.01;

  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(pulse, pulse);
  ctx.translate(-CELL * 0.12, 0);

  const potW = CELL * 0.62;
  const potH = CELL * 0.58;
  const halfW = potW / 2;
  const halfH = potH / 2;
  const topY = -halfH * 0.55;
  const botY = topY + potH;
  const rimH = potW * 0.18;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.ellipse(0, botY + 3, halfW * 0.92, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Anse dessinée avant le corps pour qu'elle passe derrière
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-halfW + 6, topY);
  ctx.bezierCurveTo(-halfW + 2, topY - potH * 0.5, halfW - 2, topY - potH * 0.5, halfW - 6, topY);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(-halfW + 6, topY + 1, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(halfW - 6, topY + 1, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-halfW, topY);
  ctx.lineTo(-halfW, botY - 2);
  ctx.bezierCurveTo(-halfW, botY + 2, halfW, botY + 2, halfW, botY - 2);
  ctx.lineTo(halfW, topY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-halfW, botY - potH * 0.15);
  ctx.lineTo(halfW, botY - potH * 0.15);
  ctx.stroke();

  ctx.fillStyle = lv.color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, topY, halfW, rimH / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(-halfW * 0.4, topY - rimH * 0.1, halfW * 0.3, rimH * 0.12, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = lv.color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;

  const dripT = (Math.sin(t * 1.3) + 1) * 2;

  const drips = [
    [-halfW * 0.82, 0.42],
    [-halfW * 0.45, 0.28],
    [-halfW * 0.12, 0.55 + dripT * 0.08],
    [halfW * 0.25, 0.32],
    [halfW * 0.58, 0.48 + dripT * 0.06],
    [halfW * 0.86, 0.25],
  ];

  for (const [cx, df] of drips) {
    const dripWidth = potW * 0.085;
    const dripLen = potH * df;
    const dripBottomY = topY + dripLen;
    ctx.beginPath();
    ctx.moveTo(cx - dripWidth, topY - 1);
    ctx.bezierCurveTo(cx - dripWidth - 1, topY + dripLen * 0.55, cx - dripWidth * 0.5, dripBottomY - 1, cx, dripBottomY);
    ctx.bezierCurveTo(cx + dripWidth * 0.5, dripBottomY - 1, cx + dripWidth + 1, topY + dripLen * 0.55, cx + dripWidth, topY - 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = lv.color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-halfW, topY - 1);
  ctx.lineTo(halfW, topY - 1);
  ctx.lineTo(halfW, topY + 5);
  ctx.lineTo(-halfW, topY + 5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-halfW, topY - 1);
  ctx.lineTo(halfW, topY - 1);
  ctx.stroke();

  ctx.save();
  ctx.translate(halfW + 4, botY - potH * 0.25);
  ctx.rotate(Math.PI * 0.05);

  const brushLen = CELL * 0.32;
  const ferruleLen = CELL * 0.1;
  const ferruleW = CELL * 0.13;
  const bristleLen = CELL * 0.1;

  ctx.fillStyle = lv.color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -ferruleW * 0.45);
  ctx.lineTo(0, ferruleW * 0.45);
  ctx.lineTo(-bristleLen * 0.7, ferruleW * 0.5);
  ctx.bezierCurveTo(-bristleLen, ferruleW * 0.45, -bristleLen * 1.05, ferruleW * 0.2, -bristleLen, 0);
  ctx.bezierCurveTo(-bristleLen * 1.05, -ferruleW * 0.2, -bristleLen, -ferruleW * 0.45, -bristleLen * 0.7, -ferruleW * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#cfcfd6';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(0, -ferruleW * 0.45, ferruleLen, ferruleW * 0.9);
  ctx.fill();
  ctx.stroke();

  const handleStart = ferruleLen;
  const handleH = ferruleW * 0.78;
  ctx.fillStyle = '#e8b878';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(handleStart, -handleH / 2);
  ctx.lineTo(handleStart + brushLen - 5, -handleH / 2);
  ctx.bezierCurveTo(
    handleStart + brushLen + handleH * 0.45, -handleH / 2,
    handleStart + brushLen + handleH * 0.45, handleH / 2,
    handleStart + brushLen - 5, handleH / 2
  );
  ctx.lineTo(handleStart, handleH / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function drawTagada() {
  const lv = LEVELS[state.levelIndex];
  const t = state.tagada;
  const c = cellCenter(t.displayCol, t.displayRow);
  const r = CELL * 0.36;

  const now = performance.now();
  const bob = Math.sin((now - state.startTime) / 380) * 1.6;
  const sx = state.shakeAmount > 0 ? (Math.random() - 0.5) * state.shakeAmount * 6 : 0;
  const sy = state.shakeAmount > 0 ? (Math.random() - 0.5) * state.shakeAmount * 6 : 0;

  // Le corps s'étend plus vers le haut que vers le bas — on compense
  // pour centrer visuellement Tagada dans sa case.
  const yCenterOffset = r * 0.27;

  ctx.save();
  ctx.translate(c.x + sx, c.y + bob + sy + yCenterOffset);

  ctx.fillStyle = 'rgba(80, 60, 80, 0.1)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.7, r * 1.05, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const dirRad = (t.displayDir * Math.PI) / 2 - Math.PI / 2;
  const stemBaseX = Math.cos(dirRad) * r * 0.9;
  const stemBaseY = Math.sin(dirRad) * r * 0.85;
  const stemTipX = Math.cos(dirRad) * r * 1.35;
  const stemTipY = Math.sin(dirRad) * r * 1.2;

  ctx.strokeStyle = '#3f7a3f';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(stemBaseX, stemBaseY);
  ctx.lineTo(stemTipX, stemTipY);
  ctx.stroke();

  ctx.save();
  ctx.translate(stemTipX, stemTipY);
  ctx.rotate(dirRad + Math.PI / 2);
  ctx.fillStyle = '#5fa85f';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.28, r * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#3f7a3f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-r * 0.22, 0);
  ctx.lineTo(r * 0.22, 0);
  ctx.stroke();
  ctx.restore();

  const bodyColor = t.painted ? lv.color : '#ededee';
  const bodyEdge = t.painted ? lv.colorDeep : INK;
  const bodyW = r * 1.15;
  const bodyH = r * 1.1;
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = bodyEdge;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-bodyW, bodyH * 0.55);
  ctx.bezierCurveTo(-bodyW * 1.05, bodyH * 0.1, -bodyW * 0.95, -bodyH * 0.5, -bodyW * 0.6, -bodyH * 0.9);
  ctx.bezierCurveTo(-bodyW * 0.25, -bodyH * 1.05, bodyW * 0.25, -bodyH * 1.05, bodyW * 0.6, -bodyH * 0.9);
  ctx.bezierCurveTo(bodyW * 0.95, -bodyH * 0.5, bodyW * 1.05, bodyH * 0.1, bodyW, bodyH * 0.55);
  ctx.bezierCurveTo(bodyW * 0.6, bodyH * 0.6, -bodyW * 0.6, bodyH * 0.6, -bodyW, bodyH * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const sugarPositions = [
    [-0.2, -0.95], [0.2, -0.95], [0, -1.0],
    [-0.45, -0.78], [-0.15, -0.82], [0.15, -0.82], [0.45, -0.78],
    [-0.7, -0.55], [-0.4, -0.6], [-0.1, -0.62], [0.1, -0.6], [0.4, -0.6], [0.7, -0.55],
    [-0.9, -0.3], [-0.6, -0.32], [-0.3, -0.35], [0, -0.35], [0.3, -0.35], [0.6, -0.32], [0.9, -0.3],
    [-1.0, -0.05], [-0.7, -0.08], [-0.4, -0.1], [-0.1, -0.1], [0.2, -0.1], [0.5, -0.08], [0.8, -0.05], [1.0, 0.0],
    [-1.05, 0.2], [-0.75, 0.18], [-0.45, 0.18], [-0.15, 0.18], [0.15, 0.18], [0.45, 0.18], [0.75, 0.18], [1.05, 0.2],
    [-1.0, 0.4], [-0.7, 0.4], [-0.4, 0.4], [-0.1, 0.42], [0.2, 0.42], [0.5, 0.4], [0.8, 0.4], [1.0, 0.4],
  ];
  ctx.fillStyle = '#ffffff';
  for (const [px, py] of sugarPositions) {
    ctx.beginPath();
    ctx.arc(px * r, py * r, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = t.painted ? lv.colorDeep + 'aa' : '#c8c8cc';
  for (const [px, py] of [[-0.55, -0.5], [0.45, -0.65], [-0.85, -0.1], [0.85, -0.1], [-0.25, -0.85], [0.3, 0.25], [-0.5, 0.3]]) {
    ctx.beginPath();
    ctx.arc(px * r, py * r, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  const cheekColor = t.painted ? 'rgba(255, 255, 255, 0.45)' : CHEEK;
  ctx.fillStyle = cheekColor;
  ctx.beginPath();
  ctx.ellipse(-r * 0.48, r * 0.05, r * 0.15, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 0.48, r * 0.05, r * 0.15, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  const eyeR = r * 0.12;
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.2, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.2, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-r * 0.27, -r * 0.25, eyeR * 0.35, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(r * 0.33, -r * 0.25, eyeR * 0.35, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, r * 0.08, r * 0.13, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  ctx.restore();
}

function drawBugOverlay() {
  if (state.shakeAmount <= 0) return;
  const opacity = Math.min(1, state.shakeAmount * 1.4);
  ctx.fillStyle = `rgba(255, 230, 230, ${opacity * 0.85})`;
  ctx.strokeStyle = `rgba(212, 97, 90, ${opacity})`;
  ctx.lineWidth = 2;
  const w = 180, h = 64;
  const x = (CANVAS_SIZE - w) / 2;
  const y = 40;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 18);
  else ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = `rgba(212, 97, 90, ${opacity})`;
  ctx.font = '700 28px "BBB ReadMe", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Bug !', CANVAS_SIZE / 2, y + h / 2);
}

function draw() {
  drawGrid();
  drawObstacles();
  drawBonbon();
  drawTagada();
  drawParticles();
  drawBugOverlay();
}

function dirToDelta(dir) { return [[0, -1], [1, 0], [0, 1], [-1, 0]][dir]; }

function isObstacle(col, row) {
  const lv = LEVELS[state.levelIndex];
  if (col < 0 || row < 0 || col >= GRID || row >= GRID) return true;
  return lv.obstacles.some(o => o.col === col && o.row === row);
}
function isPot(col, row) {
  const lv = LEVELS[state.levelIndex];
  return col === lv.pot.col && row === lv.pot.row;
}
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateTo(toCol, toRow, toDir, dur, onDone) {
  const t = state.tagada;
  state.animFrom = { col: t.displayCol, row: t.displayRow, dir: t.displayDir };
  let from = t.displayDir, to = toDir;
  let diff = to - from;
  if (diff > 2) diff -= 4;
  if (diff < -2) diff += 4;
  state.animTo = { col: toCol, row: toRow, dir: from + diff };
  state.animStart = performance.now();
  state.animDur = dur;

  const tick = (now) => {
    const k = Math.min(1, (now - state.animStart) / state.animDur);
    const e = easeOutCubic(k);
    state.tagada.displayCol = state.animFrom.col + (state.animTo.col - state.animFrom.col) * e;
    state.tagada.displayRow = state.animFrom.row + (state.animTo.row - state.animFrom.row) * e;
    state.tagada.displayDir = state.animFrom.dir + (state.animTo.dir - state.animFrom.dir) * e;
    draw();
    if (k < 1) requestAnimationFrame(tick);
    else {
      state.tagada.displayCol = toCol;
      state.tagada.displayRow = toRow;
      state.tagada.displayDir = ((toDir % 4) + 4) % 4;
      draw();
      if (onDone) onDone();
    }
  };
  requestAnimationFrame(tick);
}

function applyInstruction(instr, animDur = 240) {
  return new Promise((resolve) => {
    const t = state.tagada;
    if (instr === 'left')  { t.dir = (t.dir + 3) % 4; animateTo(t.col, t.row, t.dir, animDur, resolve); return; }
    if (instr === 'right') { t.dir = (t.dir + 1) % 4; animateTo(t.col, t.row, t.dir, animDur, resolve); return; }
    if (instr === 'forward') {
      const [dx, dy] = dirToDelta(t.dir);
      const nc = t.col + dx, nr = t.row + dy;
      if (isObstacle(nc, nr)) { triggerBug(); resolve('bug'); return; }
      t.col = nc; t.row = nr;
      animateTo(t.col, t.row, t.dir, animDur, () => {
        if (isPot(t.col, t.row)) { triggerWin(); resolve('win'); }
        else resolve('ok');
      });
      return;
    }
    resolve('noop');
  });
}

function triggerBug() {
  state.message = 'Oups… Tagada a tapé un nuage. C\'est un bug !';
  state.messageKind = 'bug';
  state.shakeAmount = 1;
  beep(220, 0.16, 'square');
  setTimeout(() => beep(180, 0.18, 'square'), 80);
  const fade = () => {
    state.shakeAmount *= 0.88;
    if (state.shakeAmount > 0.05) requestAnimationFrame(fade);
    else state.shakeAmount = 0;
    draw();
    renderStatus();
  };
  fade();
}

function triggerWin() {
  const lv = LEVELS[state.levelIndex];
  state.tagada.painted = true;
  state.message = `Bravo ! Tagada est ${lv.colorName} !`;
  state.messageKind = 'win';
  beep(440, 0.12);
  setTimeout(() => beep(660, 0.16), 130);
  setTimeout(() => beep(880, 0.22), 270);
  spawnWinParticles(lv);
  draw();
  renderStatus();
}

function spawnWinParticles(lv) {
  const t = state.tagada;
  const c = cellCenter(t.col, t.row);
  const now = performance.now();
  const COUNT = 18;
  const palette = [lv.color, lv.colorDeep, '#ffffff', lv.color];
  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const speed = 70 + Math.random() * 90;
    const size = 3 + Math.random() * 3.5;
    state.particles.push({
      x: c.x, y: c.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      gravity: 90,
      size,
      life: 1,
      lifeMax: 0.9 + Math.random() * 0.5,
      shape: Math.random() < 0.4 ? 'star' : 'circle',
      color: palette[Math.floor(Math.random() * palette.length)],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 8,
      bornAt: now,
    });
  }
}

function updateParticles(dt) {
  const arr = state.particles;
  for (let i = arr.length - 1; i >= 0; i--) {
    const p = arr[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.gravity * dt;
    p.rot += p.rotSpeed * dt;
    p.life -= dt / p.lifeMax;
    if (p.life <= 0) arr.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of state.particles) {
    const alpha = Math.max(0, p.life);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1;
    if (p.shape === 'star') {
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.3, -s * 0.3);
      ctx.lineTo(s, 0);
      ctx.lineTo(s * 0.3, s * 0.3);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.3, s * 0.3);
      ctx.lineTo(-s, 0);
      ctx.lineTo(-s * 0.3, -s * 0.3);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

async function doInstruction(instr) {
  if (state.busy || state.tagada.painted) return;
  state.busy = true;
  state.program.push(instr);
  state.currentStep = state.program.length - 1;
  renderProgram();
  beep(instr === 'forward' ? 380 : 280, 0.05, 'sine');
  await applyInstruction(instr);
  state.currentStep = -1;
  state.busy = false;
  renderProgram();
  if (!state.tagada.painted && state.messageKind !== 'bug') {
    state.message = `${state.program.length} instruction${state.program.length > 1 ? 's' : ''} dans le programme.`;
    state.messageKind = '';
    renderStatus();
  }
}

function restart() { if (!state.busy) loadLevel(state.levelIndex); }

async function replay() {
  if (state.busy || state.program.length === 0) return;
  state.busy = true;
  const lv = LEVELS[state.levelIndex];
  state.tagada = {
    col: lv.start.col, row: lv.start.row, dir: lv.start.dir,
    painted: false,
    displayCol: lv.start.col, displayRow: lv.start.row, displayDir: lv.start.dir,
  };
  state.message = 'Le programme tourne…';
  state.messageKind = '';
  state.shakeAmount = 0;
  draw();
  renderStatus();
  for (let i = 0; i < state.program.length; i++) {
    state.currentStep = i;
    renderProgram();
    beep(state.program[i] === 'forward' ? 380 : 280, 0.05, 'sine');
    const result = await applyInstruction(state.program[i], 360);
    if (result === 'bug' || result === 'win') break;
    await sleep(140);
  }
  state.currentStep = -1;
  state.busy = false;
  renderProgram();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const levelsEl = document.getElementById('levels');
const programListEl = document.getElementById('program-list');
const statusEl = document.getElementById('status');
const directionArrowEl = document.getElementById('direction-arrow');
const directionTextEl = document.getElementById('direction-text');

const INSTR_LABELS = { forward: '↑ avance', left: '← gauche', right: 'droite →' };
const DIR_TEXT = ['vers le haut', 'vers la droite', 'vers le bas', 'vers la gauche'];
const DIR_ARROW = ['↑', '→', '↓', '←'];

function renderLevels() {
  levelsEl.innerHTML = '';
  for (let i = 0; i < LEVELS.length; i++) {
    const b = document.createElement('button');
    b.innerHTML = `${i + 1}<span class="dot" style="background:${LEVELS[i].color}"></span>`;
    if (i === state.levelIndex) b.classList.add('active');
    b.onclick = () => loadLevel(i);
    b.title = LEVELS[i].name;
    levelsEl.appendChild(b);
  }
}

function renderProgram() {
  programListEl.innerHTML = '';
  if (state.program.length === 0) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = '(programme vide)';
    programListEl.appendChild(e);
    return;
  }
  state.program.forEach((instr, i) => {
    const line = document.createElement('div');
    line.className = 'line' + (i === state.currentStep ? ' current' : '');
    line.innerHTML = `<span class="num">${String(i + 1).padStart(2, '0')}</span><span>${INSTR_LABELS[instr]}</span>`;
    programListEl.appendChild(line);
  });
  programListEl.scrollTop = programListEl.scrollHeight;
}

function renderStatus() {
  statusEl.textContent = state.message;
  statusEl.className = 'status ' + (state.messageKind || '');
}

function renderDirection() {
  if (!state.tagada) return;
  const d = Math.round(state.tagada.displayDir) % 4;
  const dd = ((d % 4) + 4) % 4;
  directionArrowEl.textContent = DIR_ARROW[dd];
  directionTextEl.textContent = state.tagada.painted
    ? `Tagada est ${LEVELS[state.levelIndex].colorName} !`
    : `Tagada regarde ${DIR_TEXT[dd]}`;
}

function renderUI() {
  renderLevels();
  renderProgram();
  renderStatus();
  renderDirection();
}

let lastLoopTime = performance.now();
function loop() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastLoopTime) / 1000);
  lastLoopTime = now;
  if (state.particles.length > 0) updateParticles(dt);
  renderDirection();
  draw();
  requestAnimationFrame(loop);
}

let audioCtx = null;
function beep(freq, duration = 0.1, type = 'sine') {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = 0.08;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    o.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'f') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
    return;
  }
  if (k === 'r') { restart(); return; }
  if (k === ' ') { e.preventDefault(); replay(); return; }
  if (k >= '1' && k <= '5') { loadLevel(parseInt(k, 10) - 1); return; }
  if (e.key === 'ArrowUp' || k === 'z' || k === 'w') { e.preventDefault(); doInstruction('forward'); return; }
  if (e.key === 'ArrowLeft' || k === 'q') { e.preventDefault(); doInstruction('left'); return; }
  if (e.key === 'ArrowRight') { e.preventDefault(); doInstruction('right'); return; }
  if (k === 'a') { doInstruction('forward'); return; }
  if (k === 'g') { doInstruction('left'); return; }
  if (k === 'd') { doInstruction('right'); return; }
});

for (const b of document.querySelectorAll('[data-instr]')) {
  b.onclick = () => doInstruction(b.dataset.instr);
}
document.getElementById('btn-restart').onclick = restart;
document.getElementById('btn-replay').onclick = replay;

loadLevel(0);
draw();
loop();
