const FIELD_WIDTH = [11, 11, 15]; // for each phase
const FIELD_HEIGHT = FIELD_WIDTH;
//const FIELD_LINE_WIDTH = 2;
const FIELD_MARGIN = 2;
const FIELD_COUNT_X = 10;
const FIELD_COUNT_Y = FIELD_COUNT_X;
const MARGIN_LEFT = 16;
const MARGIN_TOP = 42;
const HEADING_COLOR = ['#FF7070', '#7070FF']; // for each player
const FIELD_LINE_COLOR = '#FFFFFF';
const FIELD_BG_COLOR_REGULAR = '#808080';
const FIELD_BG_COLOR_SELECTED = '#FFFFFF';
const SHIP_COLOR_PLACED = '#507090';
const SHIP_COLOR_AVAIL = '#204070';
const STATE_HIT_COLOR = ['#B00000', '#0000B0']; // for each player
const STATE_MISS_COLOR = '#404040';
const SHIP_CAPS = [
  1, // Carrier (type 0, size 5)
  2, // Battleship (type 1, size 4)
  3, // Destroyer (type 2, size 3)
  4 // Patrol Boat (type 3, size 2)
];
const FULL_HITS = SHIP_CAPS.reduce((a, c, i) => a + c*(5 -i), 0);
const INDICATOR_LAYOUT = [
  [0, 1, 1, 3],
  [2, 2, 2, 3, 3, 3]
];
const INDICATORS = INDICATOR_LAYOUT.reduce((a, c, i) => {
  let y = FIELD_COUNT_Y + 1 + i;
  let x1 = 0;
  c.forEach(type => {
    let size = 5 - type;
    let x2 = x1 + size - 1;
    a.push({ "type": type, "position": [x1, y, x2, y] });
    x1 += size;
  });
  return a;
}, []).sort((l, r) => (l.type - r.type)*FIELD_COUNT_X*FIELD_COUNT_Y
            + (l.position[0] + l.position[1]*FIELD_COUNT_X
               - (r.position[0] + r.position[1]*FIELD_COUNT_X)));

let phase = 0;
let player = 0;
let selected = [-10, -10];
let to_add = null;
let to_rem = null;
let placements = [[],[]];
let field_states = [new Array(100).fill(0), new Array(FIELD_COUNT_X*FIELD_COUNT_Y).fill(0)];
let current = [[0, 0],[0, 0]];
let behaviours = []; // depending on phase

function getLeftOffset(x) {
  return MARGIN_LEFT + x*(FIELD_WIDTH[phase] + FIELD_MARGIN + 1);
}

function getTopOffset(y) {
  return MARGIN_TOP + y*(FIELD_HEIGHT[phase] + FIELD_MARGIN + 1);
}

function getFieldState(x, y) {
  return field_states[player][x + FIELD_COUNT_X*y];
}

function setFieldState(x, y, value) {
  field_states[player][x + FIELD_COUNT_X*y] = value;
}

function updateFieldStates() {
  placements.forEach((ps, i) => {
    ps.forEach(p => {
      let pos = p.position;
      for (let x = pos[0]; x <= pos[2]; x++)
      for (let y = pos[1]; y <= pos[3]; y++) {
        field_states[i][x + FIELD_COUNT_X*y] = 1;
      }
    });
  });
}

function getHitCount() {
  return field_states[player].reduce(
    (v, state) => state == 3 ? v + 1 : v,
    0);
}

function drawField(x, y, selected) {
  let x1 = getLeftOffset(x);
  let y1 = getTopOffset(y);
  let x2 = x1 + FIELD_WIDTH[phase];
  let y2 = y1 + FIELD_HEIGHT[phase];
  let field_state = getFieldState(x, y);
  g.setColor(selected ? FIELD_BG_COLOR_SELECTED : FIELD_BG_COLOR_REGULAR);
  g.fillRect(x1, y1, x2, y2);
  g.setColor(FIELD_LINE_COLOR);
  g.drawRect(x1, y1, x2, y2);
  switch (field_state) {
    case 2:
      g.setColor(STATE_MISS_COLOR);
      g.fillCircle(x1 + FIELD_WIDTH[phase]/2 + 1, y1 + FIELD_HEIGHT[phase]/2 + 1, FIELD_WIDTH[phase]/2 - 3);
      break;
    case 3:
      g.setColor(STATE_HIT_COLOR[player]);
      g.fillCircle(x1 + FIELD_WIDTH[phase]/2 + 1, y1 + FIELD_HEIGHT[phase]/2 + 1, FIELD_WIDTH[phase]/2 - 1);
      break;
    default:
      break;
  }
}

function drawFields(x1, y1, x2, y2) {
  let l = getLeftOffset(x1);
  let t = getTopOffset(y1);
  let r = getLeftOffset(x2) + FIELD_WIDTH[phase] + FIELD_MARGIN;
  let b = getTopOffset(y2) + FIELD_HEIGHT[phase] + FIELD_MARGIN;
  g.clearRect(l, t, r, b);
  for (let x = x1; x <= x2; x++)
  for (let y = y1; y <= y2; y++) {
    drawField(x, y, x == current[player][0] && y == current[player][1]);
  }
}

function drawShip(x1, y1, x2, y2, color) {
  g.setColor(color);
  let diam = Math.min(FIELD_HEIGHT[phase], FIELD_WIDTH[phase]) - 3;
  let rad = diam/2;
  let cx1 = getLeftOffset(x1) + FIELD_WIDTH[phase]/2 + 1;
  let cy1 = getTopOffset(y1) + FIELD_HEIGHT[phase]/2 + 1;
  let cx2 = getLeftOffset(x2) + FIELD_WIDTH[phase]/2 + 1;
  let cy2 = getTopOffset(y2) + FIELD_HEIGHT[phase]/2 + 1;
  if (x1 == x2) {
    g.fillRect(cx1 - rad, cy1, cx1 + rad, cy2);
  } else {
    g.fillRect(cx1, cy1 - rad, cx2, cy1 + rad);
  }
  g.fillCircle(cx1, cy1, rad);
  g.fillCircle(cx2, cy2, rad);
}

function hasCollision(pos) {
  return placements[player].some(
    p => pos[0] <= p.position[2]
      && pos[2] >= p.position[0]
      && pos[1] <= p.position[3]
      && pos[3] >= p.position[1]);
}

function isAvailable(type) {
  let count = placements[player].reduce(
    (v, p) => p.type == type ? v + 1 : v,
    0);
  return count < SHIP_CAPS[type];
}

function determineChanges() {
  to_rem = to_add;
  to_add = null;
  if (selected[0] == current[player][0] && selected[1] == current[player][1]) return;
  if (selected[0] == current[player][0]) {
    let size = Math.abs(selected[1] - current[player][1]) + 1;
    if (size < 2 || size > 5 ) return;
    let y1 = Math.min(selected[1], current[player][1]);
    let y2 = Math.max(selected[1], current[player][1]);
    let pos = [current[player][0], y1, current[player][0], y2];
    let type = 5 - size;
    if (!hasCollision(pos) && isAvailable(type)) {
      to_add = { "type": type, "position": pos };
    }
  }
  if (selected[1] == current[player][1]) {
    let size = Math.abs(selected[0] - current[player][0]) + 1;
    if (size < 2 || size > 5 ) return;
    let x1 = Math.min(selected[0], current[player][0]);
    let x2 = Math.max(selected[0], current[player][0]);
    let pos = [x1, current[player][1], x2, current[player][1]];
    let type = 5 - size;
    if (!hasCollision(pos) && isAvailable(type)) {
      to_add = { "type": type, "position": pos };
    }
  }
}

function addPlacement(descriptor) {
  placements[player].push(descriptor);
  placements[player].sort((l, r) => l.type - r.type);
}

function drawShipPlacements() {
  if (to_rem) {
    drawFields.apply(null, to_rem.position);
  }
  placements[player].forEach(
    p => drawShip.apply(null, p.position.concat([SHIP_COLOR_PLACED])));
  if (to_add) {
    drawShip.apply(null, to_add.position.concat([SHIP_COLOR_PLACED]));
  }
}

function drawShipIndicator() {
  let p = to_add
    ? placements[player].concat(to_add).sort((l, r) => l.type - r.type)
    : placements[player];
  let pi = 0;
  INDICATORS.forEach(indicator => {
    let color = SHIP_COLOR_AVAIL;
    if (pi < p.length && p[pi].type == indicator.type) {
        pi += 1;
        color = SHIP_COLOR_PLACED;
    }
    drawShip.apply(null, indicator.position.concat(color));
  });
}

function drawHeading(text) {
  g.clearRect(0, 20, 100, 32);
  g.setColor(HEADING_COLOR[player]);
  g.setFont('4x6', 2.8);
  g.drawString(text, MARGIN_LEFT, 20);
}

function reset() {
  g.clear();
  drawHeading('Player ' + (player + 1));
  drawFields(0, 0, 9, 9);
}

function showResults() {
  let text1 = 'Player ' + (player + 1) + ' won!';
  let text2 = 'Congratulations!';
  g.clear();
  g.clearRect(0, 20, 100, 32);
  g.setColor(HEADING_COLOR[player]);
  g.setFont('Vector', 20);
  g.drawString(text1, MARGIN_LEFT, 80);
  g.drawString(text2, MARGIN_LEFT, 120);
}

function moveSelection(dx, dy) {
  let x = current[player][0];
  let y = current[player][1];
  drawField(x, y, false);
  current[player][0] = x = (x + dx + FIELD_COUNT_X)%FIELD_COUNT_X;
  current[player][1] = y = (y + dy + FIELD_COUNT_Y)%FIELD_COUNT_Y;
  drawField(x, y, true);
}

behaviours.push({
  "move": (dx, dy) => {
    moveSelection(dx, dy);
    determineChanges();
    drawShipPlacements();
    drawShipIndicator();
  },
  "action": _ => {
    if (to_add) {
      addPlacement(to_add);
      to_add = null;
      selected = [-10, -10];
      if (placements[player].length == 10) {
        behaviours[phase].transition();
      }
    } else {
      selected = [current[player][0], current[player][1]];
    }
  },
  "transition": _ => {
    current[0] = [0, 0];
    player = 1;
    phase = 1;
    reset();
    drawShipIndicator();
  }
});

behaviours.push({
  "move": behaviours[0].move,
  "action": behaviours[0].action,
  "transition": _ => {
    current[1] = [0, 0];
    player = 0;
    phase = 2;
    updateFieldStates();
    reset();
  }
});

behaviours.push({
  "move": (dx, dy) => moveSelection(dx, dy),
  "action": _ => {
    let x = current[player][0];
    let y = current[player][1];
    let field_state = getFieldState(x, y);
    if (field_state > 1) return;
    setFieldState(x, y, field_state + 2);
    drawField(x, y, true);
    Bangle.buzz(200 + field_state*800, 0.5 + field_state*0.5);
    if (getHitCount() < FULL_HITS) {
      player = (player + 1)%2;
      setTimeout(reset, 1000);
    } else {
      setTimeout(behaviours[phase].transition, 1000);
    }
  },
  "transition": _ => {
    phase = 3;
    showResults();
  }
});

behaviours.push({
  "move": _ => {},
  "action": _ => {}
});

reset();
drawShipIndicator();

setWatch(_ => behaviours[phase].move(0, -1), BTN1, {repeat: true, debounce: 100});
setWatch(_ => behaviours[phase].move(0, 1), BTN3, {repeat: true, debounce: 100});
setWatch(_ => behaviours[phase].move(-1, 0), BTN4, {repeat: true, debounce: 100});
setWatch(_ => behaviours[phase].move(1, 0), BTN5, {repeat: true, debounce: 100});
setWatch(_ => behaviours[phase].action(), BTN2, {repeat: true, debounce: 100});
