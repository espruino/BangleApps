// ==== GRAPHICS SETUP ====
const g = require("Graphics"); // Implicitly available on Bangle.js
g.clear();  // Clear the screen initially

// ==== GAME VARIABLES ====
const SCREEN_WIDTH = 176, SCREEN_HEIGHT = 176, TILE_SIZE = 16, FOV = Math.PI / 4;
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
  g.setColor(1, 1, 1); // White sky
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

  // Draw buttons
  drawButtons();

  // Flip the buffer to update the display
  g.flip();
}

// ==== BUTTON SETUP ====
const BUTTON_SIZE = 30, BUTTON_HEIGHT = 50;
const buttonArea = {
  forward: { x: SCREEN_WIDTH / 2 - BUTTON_SIZE / 2, y: 10, width: BUTTON_SIZE, height: BUTTON_HEIGHT },
  backward: { x: SCREEN_WIDTH / 2 - BUTTON_SIZE / 2, y: SCREEN_HEIGHT - BUTTON_HEIGHT - 10, width: BUTTON_SIZE, height: BUTTON_HEIGHT },
  left: { x: 10, y: SCREEN_HEIGHT / 2 - BUTTON_SIZE / 2, width: BUTTON_SIZE, height: BUTTON_SIZE },
  right: { x: SCREEN_WIDTH - BUTTON_SIZE - 10, y: SCREEN_HEIGHT / 2 - BUTTON_SIZE / 2, width: BUTTON_SIZE, height: BUTTON_SIZE }
};

function drawButtons() {
  g.setColor(0, 1, 0); // Green buttons
  for (let key in buttonArea) {
    let b = buttonArea[key];
    g.fillRect(b.x, b.y, b.x + b.width, b.y + b.height);
  }

  // Draw labels
  g.setColor(1, 1, 1); // White text
  g.drawString("F", buttonArea.forward.x + 10, buttonArea.forward.y + 10);
  g.drawString("B", buttonArea.backward.x + 10, buttonArea.backward.y + 10);
  g.drawString("L", buttonArea.left.x + 10, buttonArea.left.y + 10);
  g.drawString("R", buttonArea.right.x + 10, buttonArea.right.y + 10);
}

// ==== TOUCH INPUT HANDLER ====
let lastTouchTime = 0, touchDelay = 100;

Bangle.on('touch', function(_, e) {
  const currentTime = Date.now();
  if (currentTime - lastTouchTime < touchDelay) return;
  lastTouchTime = currentTime;

  let moveSpeed = TILE_SIZE / 4;
  let rotateSpeed = Math.PI / 32;

  // Check touch coordinates for button press
  if (e.x >= buttonArea.forward.x && e.x <= buttonArea.forward.x + buttonArea.forward.width &&
      e.y >= buttonArea.forward.y && e.y <= buttonArea.forward.y + buttonArea.forward.height) {
    movePlayer(false);
  }
  if (e.x >= buttonArea.backward.x && e.x <= buttonArea.backward.x + buttonArea.backward.width &&
      e.y >= buttonArea.backward.y && e.y <= buttonArea.backward.y + buttonArea.backward.height) {
    movePlayer(true);
  }
  if (e.x >= buttonArea.left.x && e.x <= buttonArea.left.x + buttonArea.left.width &&
      e.y >= buttonArea.left.y && e.y <= buttonArea.left.y + buttonArea.left.height) {
    player.angle -= rotateSpeed;
    render();
  }
  if (e.x >= buttonArea.right.x && e.x <= buttonArea.right.x + buttonArea.right.width &&
      e.y >= buttonArea.right.y && e.y <= buttonArea.right.y + buttonArea.right.height) {
    player.angle += rotateSpeed;
    render();
  }
});

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

// ==== GAME LOOP ====
let lastRenderTime = Date.now();
setInterval(() => {
  if (Date.now() - lastRenderTime >= 33) {
    render();
    lastRenderTime = Date.now();
  }
}, 33);
