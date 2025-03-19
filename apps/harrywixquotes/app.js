// ==== GAME VARIABLES ====
const SCREEN_WIDTH = 176;
const SCREEN_HEIGHT = 176;
const TILE_SIZE = 16;
const FOV = Math.PI / 4;
const map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

let player = { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE, angle: 0 };
let needsRender = true; // Flag to control rendering

let cx = SCREEN_WIDTH / 2,
  cy = SCREEN_HEIGHT / 2;

// ==== RAYCASTING FUNCTION ====
function castRay(angle) {
  let sinA = Math.sin(angle),
    cosA = Math.cos(angle);
  let x = player.x,
    y = player.y;
  while (true) {
    x += cosA;
    y += sinA;
    if (map[Math.floor(y / TILE_SIZE)][Math.floor(x / TILE_SIZE)] === 1) break;
  }
  return Math.sqrt(
    (x - player.x) * (x - player.x) + (y - player.y) * (y - player.y)
  );
}

// ==== RENDER FUNCTION ====
function render() {
  if (!needsRender) return; // Only render when needed
  needsRender = false; // Reset flag

  g.clear(); // Clear screen

  // Draw sky
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

  // Draw ground
  g.setColor(0.5, 0.25, 0);
  g.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Raycasting loop
  for (let i = 0; i < SCREEN_WIDTH; i++) {
    let angle = player.angle - FOV / 2 + (i / SCREEN_WIDTH) * FOV;
    let dist = castRay(angle);
    let height = Math.min(SCREEN_HEIGHT, (TILE_SIZE * SCREEN_HEIGHT) / dist);

    // Optimized distance shading (avoids Math.pow)
    let colorIndex = Math.floor(Math.max(0, 7 - dist * 0.25));
    g.setColor(colorIndex / 7, colorIndex / 7, colorIndex / 7);

    // Draw vertical wall slice
    let startY = (SCREEN_HEIGHT - height) / 2;
    g.fillRect(i, startY, i + 1, startY + height);
  }

  g.flip(); // Update display
}

// ==== PLAYER MOVEMENT FUNCTION ====
function movePlayer(backward) {
  let direction = backward ? -1 : 1;
  let newX = player.x + ((Math.cos(player.angle) * TILE_SIZE) / 4) * direction;
  let newY = player.y + ((Math.sin(player.angle) * TILE_SIZE) / 4) * direction;

  // Wall collision check
  if (map[Math.floor(newY / TILE_SIZE)][Math.floor(newX / TILE_SIZE)] === 0) {
    player.x = newX;
    player.y = newY;
    needsRender = true; // Mark for rendering
  }
}

// ==== TOUCH INPUT HANDLING ====
Bangle.on("touch", (t, xy) => {
  console.log("TAP");
  let x = xy.x,
    y = xy.y;

  if (x + y < cx + cy) {
    // Top-left or top-right
    if (x > y) {
      // Top triangle (Forward)
      movePlayer(true);
    } else {
      // Left triangle (Rotate left)
      player.angle -= 0.098;
      needsRender = true;
    }
  } else {
    // Bottom-left or bottom-right
    if (x < y) {
      // Bottom triangle (Backward)
      movePlayer(false);
    } else {
      // Right triangle (Rotate right)
      player.angle += 0.098;
      needsRender = true;
    }
  }
});

function startGame() {
  // ==== GAME LOOP ====
  setInterval(() => {
    if (needsRender) render();
  }, 33);
  render();
}

function introAnim() {
  //g.reset();
  g.setBgColor("#000000").setColor(0).clear();

  //g.setColor(1,1,1);
  //g.drawString("Enter if you dare...",20,120);
  //g.drawString("Not much more\nto say...",x,130);

  //g.clear();
  const W = g.getWidth();
  const H = g.getHeight();

  function Drip() {
    this.x = Math.random() * W;
    this.y = 0;
    this.size = 2 + Math.random() * 3;
    this.speed = 2 + Math.random() * 2;
  }

  let drips = [new Drip()];

  function drawDrips() {
    g.clear();
    g.setColor(1, 0, 0); // Red color for blood

    drips.forEach((drip, i) => {
      g.fillCircle(drip.x, drip.y, drip.size);
      drip.y += drip.speed;

      // Add a smear effect for realism
      g.fillRect(
        drip.x - drip.size / 2,
        drip.y - drip.size,
        drip.x + drip.size / 2,
        drip.y
      );

      // Reset if it reaches the bottom
      if (drip.y > H) {
        drips[i] = new Drip();
      }
    });
    if (drips.length < 50) {
      drips.push(new Drip());
    }

    g.flip();
  }

  // Run the animation
  const dripInterval = setInterval(drawDrips, 50);
  setWatch(
    () => {
      clearInterval(dripInterval);
      startGame();
    },
    BTN1,
    { repeat: false }
  );
}

function titlePage() {
  g.clear();
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  g.setColor(1, 1, 1);
  setTimeout(() => g.drawString("D", cx - 30, cy), 500);
  setTimeout(() => g.drawString("O", cx - 20, cy), 1000);
  setTimeout(() => g.drawString("O", cx - 10, cy), 1500);
  setTimeout(() => g.drawString("M", cx, cy), 2000);

  setWatch(
    () => {
      introAnim();
    },
    BTN1,
    { repeat: false }
  );
}

//setTimeout(()=>startGame(), 4000);

titlePage();
