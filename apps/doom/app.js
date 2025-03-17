// ==== GRAPHICS SETUP ====
const g = require("Graphics"); // This is implicitly available on Bangle.js

g.clear();  // Clear the screen initially

// ==== RAYCASTING GAME VARIABLES ====
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

// Cast a ray to find the wall distance in the given angle
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
  g.clear(); // Clear the screen before drawing the frame
  
  // Draw the background first
  g.setColor(0, 0, 255); // Set background color (blue)
  g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); // Fill the entire screen with the background color

  // Loop through every column of the screen
  for (let i = 0; i < SCREEN_WIDTH; i++) {
    let angle = player.angle - FOV / 2 + (i / SCREEN_WIDTH) * FOV;
    let dist = castRay(angle);
    let height = Math.min(SCREEN_HEIGHT, (TILE_SIZE * SCREEN_HEIGHT) / dist);
    
    // Ensure the startY and height are within the bounds of the screen
    let barHeight = Math.round(height);
    let startY = Math.max(0, Math.min(SCREEN_HEIGHT - barHeight, (SCREEN_HEIGHT - barHeight) / 2));
    
    // Calculate shading based on distance
    let shade = Math.min(255, Math.max(0, 255 - Math.floor(dist * 0.5))); // Adjust distance factor for better shading effect
    g.setColor(shade, shade, shade); // Set the wall color based on distance
    
    // Draw the wall as a filled vertical bar
    g.fillRect(i, startY, i + 1, startY + barHeight); // Draw a vertical bar
  }

  // Draw the virtual buttons
  drawButtons();

  // Flip the buffer to update the display
  g.flip();
}

// ==== BUTTONS SETUP ====
const BUTTON_WIDTH = 30, BUTTON_HEIGHT = 50;  // Increase button height for forward/backward
const buttonArea = {
  forward: { x: SCREEN_WIDTH / 2 - BUTTON_WIDTH / 2, y: 10, width: BUTTON_WIDTH, height: BUTTON_HEIGHT }, // Position forward at top
  backward: { x: SCREEN_WIDTH / 2 - BUTTON_WIDTH / 2, y: SCREEN_HEIGHT - BUTTON_HEIGHT - 10, width: BUTTON_WIDTH, height: BUTTON_HEIGHT }, // Position backward at bottom
  left: { x: 10, y: SCREEN_HEIGHT / 2 - BUTTON_WIDTH / 2, width: BUTTON_WIDTH, height: BUTTON_WIDTH },
  right: { x: SCREEN_WIDTH - BUTTON_WIDTH - 10, y: SCREEN_HEIGHT / 2 - BUTTON_WIDTH / 2, width: BUTTON_WIDTH, height: BUTTON_WIDTH }
};

// Draw buttons on screen
function drawButtons() {
  g.setColor(0, 255, 0); // Green for buttons
  g.fillRect(buttonArea.left.x, buttonArea.left.y, buttonArea.left.x + buttonArea.left.width, buttonArea.left.y + buttonArea.left.height);
  g.fillRect(buttonArea.right.x, buttonArea.right.y, buttonArea.right.x + buttonArea.right.width, buttonArea.right.y + buttonArea.right.height);
  g.fillRect(buttonArea.forward.x, buttonArea.forward.y, buttonArea.forward.x + buttonArea.forward.width, buttonArea.forward.y + buttonArea.forward.height);
  g.fillRect(buttonArea.backward.x, buttonArea.backward.y, buttonArea.backward.x + buttonArea.backward.width, buttonArea.backward.y + buttonArea.backward.height);
  
  // Draw button labels
  g.setColor(255, 255, 255); // White text
  g.drawString("Forward", buttonArea.forward.x + 5, buttonArea.forward.y + 10);
  g.drawString("Backward", buttonArea.backward.x + 5, buttonArea.backward.y + 10);
  g.drawString("Left", buttonArea.left.x + 5, buttonArea.left.y + 10);
  g.drawString("Right", buttonArea.right.x + 5, buttonArea.right.y + 10);
}

// ==== TOUCH HANDLER USING BANGLE.on('touch') ====
let lastTouchTime = 0;  // Variable to track the last touch time
const touchDelay = 100; // 100ms delay between touch event processing to avoid overload

Bangle.on('touch', function(zone, e) {
  const currentTime = Date.now();
  
  // Prevent rapid touch event processing
  if (currentTime - lastTouchTime < touchDelay) return;
  lastTouchTime = currentTime;
  
  // Debug log to check touch coordinates
  console.log("Touch detected at: ", e.x, e.y);
  
  // Check touch coordinates and map them to buttons
  if (e.x >= buttonArea.forward.x && e.x <= buttonArea.forward.x + buttonArea.forward.width && e.y >= buttonArea.forward.y && e.y <= buttonArea.forward.y + buttonArea.forward.height) {
    console.log("Forward button pressed");
    movePlayer(false);  // Trigger forward movement
  }
  if (e.x >= buttonArea.backward.x && e.x <= buttonArea.backward.x + buttonArea.backward.width && e.y >= buttonArea.backward.y && e.y <= buttonArea.backward.y + buttonArea.backward.height) {
    console.log("Backward button pressed");
    movePlayer(true);  // Trigger backward movement
  }
  if (e.x >= buttonArea.left.x && e.x <= buttonArea.left.x + buttonArea.left.width && e.y >= buttonArea.left.y && e.y <= buttonArea.left.y + buttonArea.left.height) {
    console.log("Left button pressed");
    player.angle -= Math.PI / 16; // Rotate player left (counter-clockwise)
    render(); // Redraw screen
  }
  if (e.x >= buttonArea.right.x && e.x <= buttonArea.right.x + buttonArea.right.width && e.y >= buttonArea.right.y && e.y <= buttonArea.right.y + buttonArea.right.height) {
    console.log("Right button pressed");
    player.angle += Math.PI / 16; // Rotate player right (clockwise)
    render(); // Redraw screen
  }
});

// Function for moving player
function movePlayer(backward) {
  let direction = backward ? -1 : 1;
  player.x += Math.cos(player.angle) * TILE_SIZE / 4 * direction;  // Move player in the direction of the angle
  player.y += Math.sin(player.angle) * TILE_SIZE / 4 * direction;  // Move player in the direction of the angle
  render();  // Redraw screen
}

// ==== GAME LOOP INTERVAL ====
let lastRenderTime = Date.now();
setInterval(() => {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastRenderTime;
  
  // Run the loop at a faster interval for smoother operation
  if (elapsedTime >= 33) { // Approximately 30 frames per second (33 ms between frames)
    render();          // Render the updated frame
    lastRenderTime = currentTime; // Update last render time
  }
}, 33); // Update interval for smoother operation
