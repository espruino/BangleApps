

// ==== GAME VARIABLES ====
const SCREEN_WIDTH = 176;
const SCREEN_HEIGHT = 176;
const TILE_SIZE = 16;
const FOV = Math.PI / 4;
const map = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,0,1],
  [1,0,1,0,1,0,0,1],
  [1,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1]
];

let player = { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE, angle: 0 };

// ==== RAYCASTING FUNCTION ====
function castRay(angle) {
  let sinA = Math.sin(angle), cosA = Math.cos(angle);
  let x = player.x, y = player.y;
  while (true) {
    x += cosA;
    y += sinA;
    if (map[Math.floor(y / TILE_SIZE)][Math.floor(x / TILE_SIZE)] === 1) break;
  }
  return Math.sqrt(Math.pow(x - player.x, 2) + Math.pow(y - player.y, 2));
}

// ==== RENDER FUNCTION ====
function render() {
  g.clear(); // Clear screen
  
  // Draw sky
  g.setColor(0, 0, 0); // White sky
  g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);
  
  // Draw ground
  g.setColor(0.5, 0.25, 0); // Brown ground (3-bit approximation)
  g.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Raycasting loop
  for (let i = 0; i < SCREEN_WIDTH; i++) {
    let angle = player.angle - FOV / 2 + (i / SCREEN_WIDTH) * FOV;
    let dist = castRay(angle);
    let height = Math.min(SCREEN_HEIGHT, (TILE_SIZE * SCREEN_HEIGHT) / dist);
    
    // Distance-based shading (limited to 3-bit colors)
    let colorIndex = Math.floor(Math.max(0, 7 - Math.pow(dist, 0.8) * 0.2)); 
    g.setColor(colorIndex / 7, colorIndex / 7, colorIndex / 7);
    
    // Draw vertical wall slice
    let startY = (SCREEN_HEIGHT - height) / 2;
    g.fillRect(i, startY, i + 1, startY + height);
  }

  g.flip();  // Update display
}

// ==== PLAYER MOVEMENT FUNCTION ====
function movePlayer(backward) {
  let direction = backward ? -1 : 1;
  let newX = player.x + Math.cos(player.angle) * TILE_SIZE / 4 * direction;
  let newY = player.y + Math.sin(player.angle) * TILE_SIZE / 4 * direction;

  // Wall collision check
  if (map[Math.floor(newY / TILE_SIZE)][Math.floor(newX / TILE_SIZE)] === 0) {
    player.x = newX;
    player.y = newY;
    render();
  }
}

// ==== TOUCH INPUT HANDLING ====
Bangle.on("touch", (wat, xy) => {
  let x = xy.x;
  let y = xy.y;
  let cx = SCREEN_WIDTH / 2;
  let cy = SCREEN_HEIGHT / 2; // Center of screen
  
  // Calculate triangle region
  if (x + y < cx + cy) { // Top-left or top-right
    if (x > y) { // Top triangle (Forward)
      movePlayer(true);
    } else { // Left triangle (Rotate left)
      player.angle -= 0.09817477042;
      render();
    }
  } else { // Bottom-left or bottom-right
    if (x < y) { // Bottom triangle (Backward)
      movePlayer(false);
    } else { // Right triangle (Rotate right)
      player.angle += 0.09817477042;
      render();
    }
  }
});

// ==== GAME LOOP ====
let lastRenderTime = Date.now();
setInterval(() => {
  if (Date.now() - lastRenderTime >= 33) {
    render();
    lastRenderTime = Date.now();
  }
}, 33);

render(); // Initial rendering
