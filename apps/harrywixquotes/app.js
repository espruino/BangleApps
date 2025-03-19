// ==== SCREEN VARIABLES ====
const SCREEN_WIDTH = 176;
const SCREEN_HEIGHT = 176;

let cx = SCREEN_WIDTH / 2,
  cy = SCREEN_HEIGHT / 2;

function startGame() {
  // ==== GAME VARIABLES ====
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
  
  function dist(x1, x2, y1, y2) {
    return Math.sqrt(
      (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)
    );
  }
  function castRay() {
      let x = player.x;
      let y = player.y;

      // Direction vector
      let dx = Math.cos(player.angle) * 0.1;  // Small steps for accuracy
      let dy = Math.sin(player.angle) * 0.1;

      // Step until hitting a wall
      while (true) {
          x += dx;
          y += dy;

          let mapX = Math.floor(x / TILE_SIZE);
          let mapY = Math.floor(y / TILE_SIZE);
        console.log(mapX);
        console.log(mapY);

          // Check bounds manually instead of using optional chaining
          if (mapY < 0 || mapY >= map.length || mapX < 0 || mapX >= map[0].length) {
              break; // Out of bounds
          }

          // Stop when we hit a wall
          if (map[mapY][mapX] === 1) {
              return { x: mapX, y: mapY };
          }
      }
  }
  
  // ==== RAYCASTING FUNCTION ====
  function castRayDist(angle) {
    let sinA = Math.sin(angle),
      cosA = Math.cos(angle);
    let x = player.x,
      y = player.y;
    while (true) {
      x += cosA;
      y += sinA;
      if (map[Math.floor(y / TILE_SIZE)][Math.floor(x / TILE_SIZE)] === 1) break;
    }
    return dist(x, player.x, y, player.y);
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
      let dist = castRayDist(angle);
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
  // ==== SHOOT FUNCTION ====
function shootGun() {
  g.setColor(1, 0, 0); // Set bullet color

  function Bullet() {
    this.x = cx;
    this.y = SCREEN_HEIGHT;
    this.size = 20;
    this.speed = 2 + Math.random() * 2;
  }

  const bullets = [new Bullet()];

  function drawBullets() {
    // Redraw the background ONLY where bullets were
    bullets.forEach((bullet, i) => {
      g.setColor(1, 1, 1); // Background color
      g.fillCircle(bullet.x, bullet.y, bullet.size); // Erase old bullet

      // Update bullet position
      if (bullet.y > cy) {
        bullet.y -= bullet.speed;
      }
      bullet.size *= 0.9; // Shrink bullet
      
      // Stop rendering when bullet is too small
      if (bullet.size < 2) {
        bullets.splice(i, 1);
      } else {
        g.setColor(1, 0, 0); // Bullet color
        g.fillCircle(bullet.x, bullet.y, bullet.size);
      }
    });

    g.flip(); // Refresh screen

    // Stop the interval when no bullets remain
    if (bullets.length === 0) {
      clearInterval(bulletInterval);
    }
  }

  // Run the animation
  const bulletInterval = setInterval(drawBullets, 50);
}

  // ==== TOUCH INPUT HANDLING ====
  Bangle.on("touch", (t, xy) => {
    console.log("TAP");
    const ROTATION = Math.PI/32;
    let x = xy.x,
      y = xy.y;

    if (x + y < cx + cy) {
      // Top-left or top-right
      if (x > y) {
        // Top triangle (Forward)
        movePlayer(true);
      } else {
        // Left triangle (Rotate left)
        player.angle -= ROTATION;
        needsRender = true;
      }
    } else {
      // Bottom-left or bottom-right
      if (x < y) {
        // Bottom triangle (Backward)
        movePlayer(false);
      } else {
        // Right triangle (Rotate right)
        player.angle += ROTATION;
        needsRender = true;
      }
    }
  });
  
  
  // ==== GAME LOOP ====
  setInterval(() => {
    if (needsRender) render();
  }, 33);
  render();
  
  setWatch(
    () => {
      shootGun();
    },
    BTN1,
    { repeat: true }
  );
}

function introAnim() {
  g.setBgColor("#000000").setColor(0).clear();
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

titlePage();
