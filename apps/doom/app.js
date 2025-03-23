// ==== SCREEN VARIABLES ====
const SCREEN_WIDTH = 176;
const SCREEN_HEIGHT = 176;

let cx = SCREEN_WIDTH / 2,
  cy = SCREEN_HEIGHT / 2;

function startGame() {
  g.clear();
  
  function Game() {
    this.level = 1;
    this.lastRender = null;
    this.needsRender = true;
  }

  let game = new Game();

  // ==== GAME VARIABLES ====
  const gameSettings = {
    MAP: {
      TILE_SIZE: 16,
      LAYOUT: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
    PLAYER: {
      FOV: Math.PI / 4,
      MAX_HEALTH: 10,
      START: {
        x: 2,
        y: 2,
      },
    },
  };
  function Player() {
    this.x = gameSettings.PLAYER.START.x * gameSettings.MAP.TILE_SIZE;
    this.y = gameSettings.PLAYER.START.y * gameSettings.MAP.TILE_SIZE;
    this.angle = 0;
    this.health = gameSettings.PLAYER.MAX_HEALTH;
    this.kills = 0;
    this.lastHit = null;
  }
  let player = new Player();

  function Zombie(x, y) {
    this.x = x;
    this.y = y;
    this.baseSize = 20;
    this.speed = 0.05;
    this.health = 5;
  }

  function Hoard(n) {
    let zombies = [];
    for (let i = 0; i < n; i++) {
      let x =
          gameSettings.MAP.LAYOUT[0].length - Math.floor(1 + 3 * Math.random()),
        y = gameSettings.MAP.LAYOUT.length - Math.floor(1 + 3 * Math.random());
      zombies.push(
        new Zombie(
          x * gameSettings.MAP.TILE_SIZE,
          y * gameSettings.MAP.TILE_SIZE
        )
      );
    }
    this.zombies = zombies;
  }

  // Zombies placed at world coordinates
  let zombies = new Hoard(game.level).zombies;

  // Move zombies toward the player
  function moveZombies() {
    zombies.forEach((zombie) => {
      let dx = player.x - zombie.x;
      let dy = player.y - zombie.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.5) {
        // Only move if not already very close
        dx /= dist; // Normalize direction vector
        dy /= dist;
        zombie.x += (dx * zombie.speed) / (Math.random() + 0.25); // Move zombie towards player
        zombie.y += (dy * zombie.speed) / (Math.random() + 0.25);
      } else {
        if (new Date().getTime() - (player.lastHit ?? 0) > 500) {
          player.health += -1;
          g.setBgColor("#ff0000").setColor(0).clear();
          player.lastHit = new Date().getTime();
        }
      }
    });
  }
  function zombieScreenData(zombie) {
    let dx = zombie.x - player.x;
    let dy = zombie.y - player.y;
    let zombieAngle = Math.atan2(dy, dx);

    let angleDifference = player.angle - zombieAngle;
    angleDifference = ((angleDifference + Math.PI) % (2 * Math.PI)) - Math.PI;

    if (Math.abs(angleDifference) <= gameSettings.PLAYER.FOV / 2) {
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < gameSettings.MAP.TILE_SIZE) dist = gameSettings.MAP.TILE_SIZE; // Prevent extreme scaling

      let height = Math.min(
        SCREEN_HEIGHT,
        (gameSettings.MAP.TILE_SIZE * 0.9 * SCREEN_HEIGHT) / dist
      );
      let width = height / 3;
      let screenX =
        SCREEN_WIDTH / 2 + Math.tan(-angleDifference) * (SCREEN_WIDTH / 2);
      let screenY =
        SCREEN_HEIGHT / 2 +
        Math.tan(angleDifference) / (SCREEN_HEIGHT / 2) +
        400 / dist;

      return {
        x: screenX,
        y: screenY,
        height: height,
        width: width,
      };
    }
    return null;
  }

  function renderZombies() {
    zombies.forEach((zombie) => {
      let screen_data = zombieScreenData(zombie);
      if (screen_data !== null) {
        if (zombie.health > 0) {
          g.setColor(0, 1, 0);
        } else {
          g.setColor(1, 0, 0);
        }
        const zombieTopY = screen_data.y - screen_data.height / 2,
          zombieBottomY = screen_data.y + screen_data.height / 2,
          zombieLeftX = screen_data.x - screen_data.width / 2,
          zombieRightX = screen_data.x + screen_data.width / 2;

        g.fillCircle(screen_data.x, zombieTopY - 20, 10);
        g.setColor(1, 1, 1);
        g.drawString(zombie.health, screen_data.x, zombieTopY - 30);
        if (zombie.health > 0) {
          g.setColor(0.12, 0.56, 0.12);
        } else {
          g.setColor(1, 0, 0);
        }
        g.fillRect(
          zombieLeftX,
          zombieTopY + (zombieBottomY - zombieTopY) / 4,
          zombieRightX,
          zombieBottomY - (zombieBottomY - zombieTopY) / 4
        );
        g.fillRect(
          zombieLeftX + 10,
          zombieTopY,
          zombieRightX - 10,
          zombieBottomY
        );
      }
    });
  }

  function renderHUD() {
    g.setColor(1, 0, 0);
    g.setFont("Vector", 20);
    g.fillRect(40, SCREEN_HEIGHT - 40, SCREEN_WIDTH - 40, SCREEN_HEIGHT - 20);
    g.setColor(0, 1, 0);
    g.fillRect(
      40,
      SCREEN_HEIGHT - 40,
      40 +
        (SCREEN_WIDTH - 80) * (player.health / gameSettings.PLAYER.MAX_HEALTH),
      SCREEN_HEIGHT - 20
    );
    g.setFont("Vector", 10);
    g.drawString("Zombies:", 20, 20);
    g.setFont("Vector", 20);
    g.drawString(zombies.length, 20, 30);

    g.setFont("Vector", 10);
    g.drawString(`Level ${game.level}`, SCREEN_WIDTH / 2 - 10, 20);

    g.setColor(1, 0, 0);
    g.setFont("Vector", 10);
    g.drawString("Kills:", SCREEN_WIDTH - 40, 20);
    g.setFont("Vector", 20);
    g.drawString(player.kills, SCREEN_WIDTH - 40, 30);
  }

  function dist(x1, x2, y1, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
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
      if (
        gameSettings.MAP.LAYOUT[Math.floor(y / gameSettings.MAP.TILE_SIZE)][
          Math.floor(x / gameSettings.MAP.TILE_SIZE)
        ] === 1
      )
        break;
    }
    return dist(x, player.x, y, player.y);
  }

  // ==== PLAYER MOVEMENT FUNCTION ====
  function movePlayer(backward) {
    let direction = backward ? -1 : 1;
    let newX =
      player.x +
      ((Math.cos(player.angle) * gameSettings.MAP.TILE_SIZE) / 4) * direction;
    let newY =
      player.y +
      ((Math.sin(player.angle) * gameSettings.MAP.TILE_SIZE) / 4) * direction;

    // Wall collision check
    if (
      gameSettings.MAP.LAYOUT[Math.floor(newY / gameSettings.MAP.TILE_SIZE)][
        Math.floor(newX / gameSettings.MAP.TILE_SIZE)
      ] === 0
    ) {
      player.x = newX;
      player.y = newY;
      game.needsRender = true; // Mark for rendering
    }
  }

  // ==== SHOOT FUNCTION ====
  function shootGun() {
    let bullets = [
      {
        x: cx,
        y: SCREEN_HEIGHT,
        size: 20,
        speed: 2 + Math.random() * 2,
        check_hit: true,
      },
    ];

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
            let screen_data = zombieScreenData(zombie);
            if (
              bullet.check_hit &&
              screen_data !== null &&
              Math.abs(screen_data.x - cx) < 20
            ) {
              // Bullet hits zombie
              zombie.health -= 1;
              if (zombie.health < 0) {
                return;
              } else if (zombie.health == 0) {
                player.kills += 1;
                console.log("KILLED ZOMBIE");
                g.setColor(1, 0, 0);
                g.drawString("KILL", cx, cy);
                setTimeout(() => zombies.splice(j, 1), 1000);
              } else {
                g.setColor(1, 0, 0);
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
    setTimeout(() => clearInterval(bulletInterval), 1000)
  }

  function handleTouch(xy) {
    const ROTATION = Math.PI / 16;
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
        game.needsRender = true;
      }
    } else {
      // Bottom-left or bottom-right
      if (x < y) {
        // Bottom triangle (Backward)
        movePlayer(false);
      } else {
        // Right triangle (Rotate right)
        player.angle += ROTATION;
        game.needsRender = true;
      }
    }
  }

  // ==== TOUCH INPUT HANDLING ====
  Bangle.on("touch", (t, xy) => {
    console.log("Touch");
    handleTouch(xy);
  });
  Bangle.on("tap", (xy) => {
    console.log("Tap");
    handleTouch(xy);
  });

  // ==== RENDER FUNCTION ====
  function render() {
    if (player.health <= 0) {
      g.setBgColor("#000000").setColor(0).clear();
      g.setColor(1, 0, 0);
      g.drawString("YOU DIED", cx - 50, cy);
      clearInterval(renderInterval);
      return;
    }

    if (!game.needsRender) return; // Only render when needed
    game.needsRender = false; // Reset flag
    game.lastRender = new Date().getTime();

    g.clear(); // Clear screen

    // Draw sky
    g.setColor(0, 0, 0);
    g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

    // Draw ground
    g.setColor(0.5, 0.25, 0);
    g.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Raycasting loop
    for (let i = 0; i < SCREEN_WIDTH; i++) {
      let angle =
        player.angle -
        gameSettings.PLAYER.FOV / 2 +
        (i / SCREEN_WIDTH) * gameSettings.PLAYER.FOV;
      let dist = castRayDist(angle);
      let height = Math.min(
        SCREEN_HEIGHT,
        (gameSettings.MAP.TILE_SIZE * SCREEN_HEIGHT) / dist
      );

      // Optimized distance shading (avoids Math.pow)
      let colorIndex = Math.floor(Math.max(0, 7 - dist * 0.25));
      g.setColor(colorIndex / 7, colorIndex / 7, colorIndex / 7);

      // Draw vertical wall slice
      let startY = (SCREEN_HEIGHT - height) / 2;
      g.fillRect(i, startY, i + 1, startY + height);
    }
    renderZombies();
    renderHUD();

    if (zombies.length == 0) {
      g.setColor(0, 1, 0);
      g.drawString("LEVEL SUCCESS", cx - 80, cy);
    }

    g.flip(); // Update display
  }

  function setRenderInterval() {
    return setInterval(() => {
      moveZombies();
      if (game.needsRender) {
        render();
      } else if (new Date().getTime() - game.lastRender > 500) {
        game.needsRender = true;
      }
    }, 100);
  }

  // ==== GAME LOOP ====
  let renderInterval = setRenderInterval();
  render();

  setWatch(
    () => {
      if (player.health > 0 && zombies.length > 0) {
        shootGun();
      } else {
        if (zombies.length == 0) {
          game.level += 1;
          zombies = new Hoard(game.level).zombies;
        }
        player = new Player();
        game.needsRender = true;
        renderInterval = setRenderInterval();
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
  g.setFont("Vector", 20);
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  g.setColor(1, 1, 1);
  setTimeout(() => g.drawString("D", cx - 60, cy), 500);
  setTimeout(() => g.drawString("O", cx - 40, cy), 1000);
  setTimeout(() => g.drawString("O", cx - 20, cy), 1500);
  setTimeout(() => g.drawString("M", cx, cy), 2000);
  setTimeout(() => g.setFont("Vector", 10), 2500);
  setTimeout(() => g.drawString("(recreation)", cx + 20, cy), 3000);
  setTimeout(() => g.drawString("Harry Wixley 2025", cx - 60, cy+40), 3000);

  setWatch(
    () => {
      introAnim();
    },
    BTN1,
    { repeat: false }
  );
}

titlePage();
