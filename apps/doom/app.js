/*function renderZombies() {
  zombies.forEach(zombie => {
    // Calculate the angle to the zombie
    let dx = zombie.x - player.x;
    let dy = zombie.y - player.y;
    let zombieAngle = Math.atan2(dy, dx);

    // Normalize the zombie's angle relative to the player's facing angle
    let angleDifference = Math.abs(player.angle - zombieAngle);
    
    // Adjust angleDifference to be between 0 and Math.PI
    if (angleDifference > Math.PI) {
      angleDifference = 2 * Math.PI - angleDifference;
    }

    // Check if the zombie is within the field of view
    if (angleDifference <= FOV / 2) {
      // Zombie is within the field of view, so calculate distance
      let dist = Math.sqrt(dx * dx + dy * dy);

      // Scale the zombie's size based on the distance (closer = bigger)
      let size = Math.max(6, zombie.baseSize / dist * 10); // Minimum size to prevent disappearing

      // Avoid drawing zombies too close to the player, where their size would be too large
      if (dist < TILE_SIZE) dist = TILE_SIZE; // Zombies that are too close are avoided

      // Convert world coordinates to screen coordinates (perspective projection)
      let screenX = SCREEN_WIDTH / 2 + (dx / dist) * (SCREEN_WIDTH / 2);  // Perspective X projection
      let screenY = SCREEN_HEIGHT / 2 + (dy / dist) * (SCREEN_HEIGHT / 2);  // Perspective Y projection

      // Adjust the zombie's size for perspective scaling
      size = size / dist * 50; // Adjust the size to be more appropriate for display

      // Draw the zombie as a rectangle (for better visibility)
      g.setColor(0, 1, 0); // Green color for zombies
      g.fillRect(screenX - size / 2, screenY - size / 2, screenX + size / 2, screenY + size / 2);
    }
  });
}*/
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
  const player_MAX_HEALTH = 10;
  const initialPlayer = { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE, angle: 0 , health: player_MAX_HEALTH-1, kills: 0 };
  let player = Object.create(initialPlayer);
  let needsRender = true; // Flag to control rendering
  
  function Zombie(x, y) {
    this.x = x;  // World-space coordinates
    this.y = y;  // World-space coordinates
    this.baseSize = 20;  // Base size of the zombie
    this.speed = 0.1;  // Speed at which the zombie moves
    this.health = 5;
  }

  // Zombies placed at world coordinates
  let zombies = [
    new Zombie(1 * TILE_SIZE, 1 * TILE_SIZE),
    new Zombie(1 * TILE_SIZE, 2 * TILE_SIZE),
  ];

  // Move zombies toward the player
  function moveZombies() {
    zombies.forEach(zombie => {
      let dx = player.x - zombie.x;
      let dy = player.y - zombie.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) { // Only move if not already very close
        dx /= dist; // Normalize direction vector
        dy /= dist;
        zombie.x += dx * zombie.speed; // Move zombie towards player
        zombie.y += dy * zombie.speed;
      } else {
        player.health += -1;
        g.setBgColor("#ff0000").setColor(0).clear();
      }
    });
  }
  function zombieScreenData(zombie) {
    let dx = zombie.x - player.x;
    let dy = zombie.y - player.y;
    let zombieAngle = Math.atan2(dy, dx);

    let angleDifference = player.angle - zombieAngle;
    angleDifference = (angleDifference + Math.PI) % (2 * Math.PI) - Math.PI; 
    
    if (Math.abs(angleDifference) <= FOV / 2) {
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < TILE_SIZE) dist = TILE_SIZE; // Prevent extreme scaling

      let height = Math.min(SCREEN_HEIGHT, (TILE_SIZE*0.9 * SCREEN_HEIGHT) / dist);
      let width = height/3;
      let screenX = SCREEN_WIDTH / 2 + Math.tan(-angleDifference) * (SCREEN_WIDTH / 2);
      let screenY = (SCREEN_HEIGHT / 2) + Math.tan(angleDifference)/(SCREEN_HEIGHT / 2) + 400/dist;
      
      return {
        x: screenX,
        y: screenY,
        height: height,
        width: width
      }
    }
    return null;
  }

function renderZombies() {  
  zombies.forEach(zombie => {
    /*let dx = zombie.x - player.x;
    let dy = zombie.y - player.y;
    let zombieAngle = Math.atan2(dy, dx);

    let angleDifference = player.angle - zombieAngle;
    angleDifference = (angleDifference + Math.PI) % (2 * Math.PI) - Math.PI; // Normalize angle
    
    if (Math.abs(angleDifference) <= FOV / 2) {
      console.log("render");
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < TILE_SIZE) dist = TILE_SIZE; // Prevent extreme scaling

      let height = Math.min(SCREEN_HEIGHT, (TILE_SIZE * SCREEN_HEIGHT) / dist);
      let width = height/3;
      let screenX = SCREEN_WIDTH / 2 + Math.tan(angleDifference) * (SCREEN_WIDTH / 2);
      let screenY = (SCREEN_HEIGHT / 2) + Math.tan(angleDifference)/(SCREEN_HEIGHT / 2);*/
    
      screen_data = zombieScreenData(zombie);
      if (screen_data !== null) {

      //if (Math.abs(screenX - x) < zombie.baseSize) {
      if (zombie.health > 0) {
        g.setColor(0, 1, 0);
      } else {
        g.setColor(1,0,0);
      }
      const zombieTopY = screen_data.y - screen_data.height / 2, zombieBottomY = screen_data.y + screen_data.height / 2, zombieLeftX = screen_data.x - screen_data.width/2, zombieRightX = screen_data.x + screen_data.width/2;
      
      g.fillCircle(screen_data.x, zombieTopY - 20, 10);
      g.setColor(1,1,1);
      g.drawString(zombie.health, screen_data.x, zombieTopY - 30);
      if (zombie.health > 0) {
        g.setColor(0.12,0.56, 0.12);
      } else {
        g.setColor(1,0,0);
      }
        g.fillRect(zombieLeftX, zombieTopY + (zombieBottomY - zombieTopY)/4, zombieRightX, zombieBottomY - (zombieBottomY - zombieTopY)/4);
      g.fillRect(zombieLeftX + 10, zombieTopY, zombieRightX -10, zombieBottomY);
      
      //g.fillRect(zombieLeftX, zombieTopY*2, zombieRightX, zombieBottomY*0.75);
      //}
      }
    //}
  });
}
  
  function renderHUD() {
    g.setColor(1,0,0);
    g.setFont("Vector",20);
    g.fillRect(40, SCREEN_HEIGHT-40, SCREEN_WIDTH-40, SCREEN_HEIGHT-20);
    g.setColor(0,1,0);
    g.fillRect(40, SCREEN_HEIGHT-40, 40 + (SCREEN_WIDTH-80)*(player.health/player_MAX_HEALTH), SCREEN_HEIGHT-20);
    g.setFont("Vector",10);
    g.drawString("Zombies:", 20, 20);
    g.setFont("Vector",20);
    g.drawString(zombies.length, 20, 30);

    g.setColor(1,0,0);
    g.setFont("Vector",10);
    g.drawString("Kills:", SCREEN_WIDTH-40, 20);
    g.setFont("Vector",20);
    g.drawString(player.kills, SCREEN_WIDTH-40, 30);
  }




  
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
  let bullets = [{ x: cx, y: SCREEN_HEIGHT, size: 20, speed: 2 + Math.random() * 2, check_hit: true }];

  function drawBullets() {
    bullets.forEach((bullet, i) => {
      g.setColor(1, 1, 1); // Background color
      g.fillCircle(bullet.x, bullet.y, bullet.size); // Erase old bullet

      // Update bullet position
      if (bullet.y > cy) bullet.y -= bullet.speed;
      bullet.size *= 0.9; // Shrink bullet

      if (bullet.check_hit) {
      // Collision detection with zombies
      zombies.forEach((zombie, j) => {
        /*console.log(bullet.size);
        let dx1 = bullet.x - zombie.x - zombie.baseSize/2;
        let dx2 = bullet.x - zombie.x + zombie.baseSize/2;
        let dy = bullet.y - zombie.y;
        let dist1 = Math.sqrt(dx1 * dx1 + dy * dy);
        let dist2 = Math.sqrt(dx2 * dx2 + dy*dy);
        let dist = Math.min(dist1, dist2);
        console.log("checking bullet");
        console.log(dist);*/
        screen_data = zombieScreenData(zombie);
        if (bullet.check_hit && screen_data !== null && Math.abs(screen_data.x - cx) < 20) {
          // Bullet hits zombie
          zombie.health -= 1;
          if (zombie.health <= 0) {
            player.kills += 1;
            console.log("KILLED ZOMBIE");
            g.setColor(1,0,0);
            g.drawString("KILL", cx, cy);
            setTimeout(() => zombies.splice(j, 1),1000);
          } else {
            g.setColor(1,0,0);
            g.drawString("HIT", cx, cy);
          }
          bullet.check_hit = false; // Bullet disappears
        }
      });
      }

      // Stop rendering when bullet is too small
      if (bullet.size < 2) {
        bullets.splice(i, 1);
      } else {
        g.setColor(1, 0, 0); // Bullet color
        g.fillCircle(bullet.x, bullet.y, bullet.size);
      }
    });

    g.flip(); // Refresh screen
  }

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
  
  // ==== RENDER FUNCTION ====
  function render() {
    if (player.health <= 0) {
      g.setBgColor("#000000").setColor(0).clear();
      g.setColor(1,0,0);
      g.drawString("YOU DIED", cx-50, cy);
      return;
    }
    
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
      
      //renderZombieSlice(i);
    }
    moveZombies();
    renderZombies();
    renderHUD();
    

    g.flip(); // Update display
  }
  
  // ==== GAME LOOP ====
  setInterval(() => {
    moveZombies();
    if (needsRender) render();
  }, 33);
  render();
  
  setWatch(
    () => {
      if (player.health > 0) {
      shootGun();
      } else {
        player = Object.create(initialPlayer);
        needsRender = true;
        console.log(player);
      }
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
