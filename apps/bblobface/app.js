{
  // ~~ Variables for clock ~~
  let clockDrawTimeout;
  let twelveHourTime = require('Storage').readJSON('setting.json', 1)['12hour'];
  let updateSeconds = !Bangle.isLocked();
  let batteryLevel = E.getBattery();

  // ~~ Variables for game logic ~~
  const NUM_COLORS = 6;
  const NUISANCE_COLOR = 7;
  let grid = [
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0])
    ];
  let hiddenRow = new Uint8Array([0, 0, 0, 0, 0, 0]);
  let nextQueue = [{pivot: 1, leaf: 1}, {pivot: 1, leaf: 1}];
  let currentPair = {pivot: 0, leaf: 0};
  let dropCoordinates = {pivotX: 2, pivotY: 11, leafX: 2, leafY: 10};
  let pairX = 2;
  let pairOrientation = 0; //0 is up, 1 is right, 2 is down, 3 is left
  let slotsToCheck = [];
  let selectedColors;
  let lastChain = 0;
  let gameLost = false;
  let gamePaused = false;
  let midChain = false;

  /*
  Sets up a new game.
  Must be called once before the first round.
  */
  let restartGame = function() {
    grid = [
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0])
    ];
    hiddenRow = new Uint8Array([0, 0, 0, 0, 0, 0]);
    currentPair = {pivot: 0, leaf: 0};
    pairX = 2;
    pairOrientation = 0; //0 is up, 1 is right, 2 is down, 3 is left
    slotsToCheck = [];
    gameLost = false;
    lastChain = 0;

    //Set up random colors
    selectedColors = new Uint8Array([1, 2, 3, 4, 5, 6]);
    for (let i = NUM_COLORS - 1; i > 0; i--) {
      let swap = selectedColors[i];
      let swapIndex = Math.floor(Math.random() * (i + 1));
      selectedColors[i] = selectedColors[swapIndex];
      selectedColors[swapIndex] = swap;
    }

    //Create the first two pairs (Always in the first three colors)
    nextQueue[0].pivot = selectedColors[Math.floor(Math.random() * 3)];
    nextQueue[0].leaf = selectedColors[Math.floor(Math.random() * 3)];
    nextQueue[1].pivot = selectedColors[Math.floor(Math.random() * 3)];
    nextQueue[1].leaf = selectedColors[Math.floor(Math.random() * 3)];
  };

  /*
  Readies the next pair and generates a new one for the queue.
  */
  let newPair = function() {
    currentPair.pivot = nextQueue[0].pivot;
    currentPair.leaf = nextQueue[0].leaf;

    nextQueue[0].pivot = nextQueue[1].pivot;
    nextQueue[0].leaf = nextQueue[1].leaf;

    nextQueue[1].pivot = selectedColors[Math.floor(Math.random() * 4)];
    nextQueue[1].leaf = selectedColors[Math.floor(Math.random() * 4)];

    pairX = 2;
    pairOrientation = 0;

    calcDropCoordinates();
  };

  /*
  Calculates the coordinates at which the current pair will be placed when quick dropped.
  */
  let calcDropCoordinates = function() {
    dropCoordinates.pivotX = pairX;

    //Find Y coordinate of pivot
    dropCoordinates.pivotY = -2;
    for (let i = 11; i >= 0; i--) {
      if (grid[i][pairX] == 0) {
        dropCoordinates.pivotY = i;
        break;
      }
    }
    if (dropCoordinates.pivotY == -2 && hiddenRow[pairX] == 0)
      dropCoordinates.pivotY = -1;

    //Find coordinates of leaf
    if (pairOrientation == 1) {
      dropCoordinates.leafX = pairX + 1;

      dropCoordinates.leafY = -2;
      for (let i = 11; i >= 0; i--) {
        if (grid[i][pairX + 1] == 0) {
          dropCoordinates.leafY = i;
          break;
        }
      }
      if (dropCoordinates.leafY == -2 && hiddenRow[pairX + 1] == 0)
        dropCoordinates.leafY = -1;
    } else if (pairOrientation == 3) {
      dropCoordinates.leafX = pairX - 1;

      dropCoordinates.leafY = -2;
      for (let i = 11; i >= 0; i--) {
        if (grid[i][pairX - 1] == 0) {
          dropCoordinates.leafY = i;
          break;
        }
      }
      if (dropCoordinates.leafY == -2 && hiddenRow[pairX - 1] == 0)
        dropCoordinates.leafY = -1;
    } else if (pairOrientation == 2) {
      dropCoordinates.leafX = pairX;
      dropCoordinates.leafY = dropCoordinates.pivotY;
      dropCoordinates.pivotY--;
    } else {
      dropCoordinates.leafX = pairX;
      dropCoordinates.leafY = dropCoordinates.pivotY - 1;
    }
  };

  /*
  Moves the current pair a certain number of slots.
  */
  let movePair = function(dx) {
    pairX += dx;

    if (dx < 0) {
      if (pairX < (pairOrientation == 3 ? 1 : 0))
        pairX = (pairOrientation == 3 ? 1 : 0);
    }
    if (dx > 0) {
      if (pairX > (pairOrientation == 1 ? 4 : 5))
        pairX = (pairOrientation == 1 ? 4 : 5);
    }

    calcDropCoordinates();
  };

  /*
  Rotates the pair in the given direction around the pivot.
  */
  let rotatePair = function(clockwise) {
    pairOrientation += (clockwise ? 1 : -1);
    if (pairOrientation > 3)
      pairOrientation = 0;
    if (pairOrientation < 0)
      pairOrientation = 3;

    if (pairOrientation == 1 && pairX == 5)
      pairX = 4;
    if (pairOrientation == 3 && pairX == 0)
      pairX = 1;

    calcDropCoordinates();
  };

  /*
  Places the current pair at the drop coordinates.
  */
  let quickDrop = function() {
    if (dropCoordinates.pivotY == -1) {
      hiddenRow[dropCoordinates.pivotX] = currentPair.pivot;
    } else if (dropCoordinates.pivotY > -1) {
      grid[dropCoordinates.pivotY][dropCoordinates.pivotX] = currentPair.pivot;
    }

    if (dropCoordinates.leafY == -1) {
      hiddenRow[dropCoordinates.leafX] = currentPair.leaf;
    } else if (dropCoordinates.leafY > -1) {
      grid[dropCoordinates.leafY][dropCoordinates.leafX] = currentPair.leaf;
    }

    currentPair.pivot = 0;
    currentPair.leaf = 0;
  };

  /*
  Makes all blobs fall to the lowest available slot.
  All blobs that fall will be added to slotsToCheck.
  */
  let settleBlobs = function() {
    for (let x = 0; x < 6; x++) {
      let lowestOpen = 11;
      for (let y = 11; y >= 0; y--) {
        if (grid[y][x] != 0) {
          if (y != lowestOpen) {
            grid[lowestOpen][x] = grid[y][x];
            grid[y][x] = 0;
            addSlotToCheck(x, lowestOpen);
          }
          lowestOpen--;
        }
      }

      if (lowestOpen >= 0 && hiddenRow[x] != 0) {
        grid[lowestOpen][x] = hiddenRow[x];
        hiddenRow[x] = 0;
        addSlotToCheck(x, lowestOpen);
      }
    }
  };

  /*
  Adds a slot to slotsToCheck. This slot will be checked for a pop
  next time popAll is called.
  */
  let addSlotToCheck = function(x, y) {
    slotsToCheck.push({x: x, y: y});
  };

  /*
  Checks for a pop at every slot in slotsToCheck.
  Pops at all locations.
  */
  let popAll = function() {
    let result = {pops: 0};
    while(slotsToCheck.length > 0) {
      let coord = slotsToCheck.pop();
      if (grid[coord.y][coord.x] != 0 && grid[coord.y][coord.x] != NUISANCE_COLOR) {
        if (checkSlotForPop(coord.x, coord.y))
          result.pops += 1;
      }
    }
    return result;
  };

  /*
  Checks a specific slot for a pop.
  If there are four or more adjacent blobs of the same color, they are removed.
  */
  let checkSlotForPop = function(x, y) {
    let toDelete = [
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0]),
      new Uint8Array([0, 0, 0, 0, 0, 0])
    ];
    let blobsInClump = 0;
    let color = grid[y][x];
    let toCheck = [{x: x, y: y}];

    //Count every blob in this clump
    while (toCheck.length > 0) {
      let coord = toCheck.pop();
      if (grid[coord.y][coord.x] == color && toDelete[coord.y][coord.x] == 0) {
        blobsInClump++;
        toDelete[coord.y][coord.x] = 1;
        if (coord.x > 0) toCheck.push({x: coord.x - 1, y: coord.y});
        if (coord.x < 5) toCheck.push({x: coord.x + 1, y: coord.y});
        if (coord.y > 0) toCheck.push({x: coord.x, y: coord.y - 1});
        if (coord.y < 11) toCheck.push({x: coord.x, y: coord.y + 1});
      }
      if (grid[coord.y][coord.x] == NUISANCE_COLOR && toDelete[coord.y][coord.x] == 0)
        toDelete[coord.y][coord.x] = 1; //For erasing garbage
    }

    //If there are at least four blobs in this clump, remove them from the grid and draw a pop.
    if (blobsInClump >= 4) {
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 6; x++) {
          if (toDelete[y][x] == 1) {
            grid[y][x] = 0;

            //Clear the blob out of the slot
            g.setBgColor(0, 0, 0);
            g.clearRect((x*18)+34, (y*14)+7, (x*18)+52, (y*14)+21);

            //Draw the pop
            let colorInfo = getColor(color);
            g.setColor(colorInfo.r, colorInfo.g, colorInfo.b);
            if (color < NUISANCE_COLOR) {
              //A fancy pop for popped colors!
              g.drawEllipse((x*18)+36, (y*14)+7, (x*18)+50, (y*14)+21);
              g.drawEllipse((x*18)+27, (y*14)-2, (x*18)+59, (y*14)+30);
            } else if (color == NUISANCE_COLOR) {
              //Nuisance Blobs are simply crossed out.
              //TODO: Nuisance Blobs are currently unusued, but also untested. Test before use.
              g.drawLine((x*18)+34, (y*14)+7, (x*18)+52, (y*14)+21);
            }
          }
        }
      }
      return true;
    }
    return false;
  };

  // Variables for graphics
  let oldGhost = {pivotX: 0, pivotY: 0, leafX: 0, leafY: 0};

  /*
  Draws the time on the side.
  */
  let drawTime = function(scheduleNext) {
    //Change this to alter the y-coordinate of the top edge.
    let dy = 25;

    g.setBgColor(0, 0, 0);
    g.clearRect(2, dy, 30, dy + 121);

    //Draw the time
    let d = new Date();
    let h = d.getHours(), m = d.getMinutes();
    if (twelveHourTime) {
      let mer = 'A';
      if (h >= 12) mer = 'P';
      if (h >= 13) h -= 12;
      if (h == 0) h = 12;

      g.setColor(1, 1, 1);
      g.setFont("Vector", 12);
      g.drawString(mer, 23, dy + 63);
    }
    let hs = h.toString().padStart(2, 0);
    let ms = m.toString().padStart(2, 0);
    g.setFont("Vector", 24);
    g.setColor(1, 0.2, 1);
    g.drawString(hs, 3, dy + 21);
    g.setColor(0.5, 0.5, 1);
    g.drawString(ms, 3, dy + 42);

    //Draw seconds
    let s = d.getSeconds();
    if (updateSeconds) {
      let ss = s.toString().padStart(2, 0);
      g.setFont("Vector", 12);
      g.setColor(0.2, 1, 0.2);
      g.drawString(ss, 3, dy + 63);
    }

    //Draw the date
    let dayString = d.getDate().toString();
    let dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    let dayName = dayNames[d.getDay()];
    let monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JLY", "AUG", "SEP", "OCT", "NOV", "DEC"];
    let monthName = monthNames[d.getMonth()];
    g.setColor(1, 1, 1);
    g.setFont("Vector", 12);
    g.drawString(monthName, 3, dy + 84);
    g.drawString(dayString, 3, dy + 97);
    g.setColor(0.5, 0.5, 0.5);
    g.drawString(dayName, 3, dy + 110);

    //Draw battery
    if (s == 0) batteryLevel = E.getBattery();
    if (Bangle.isCharging()) {
      g.setColor(0, 0, 1);
    } else if (batteryLevel <= 15) {
      g.setColor(1, 0, 0);
    } else {
      g.setColor(0, 1, 0);
    }
    g.drawString(batteryLevel + "%", 3, dy + 1);

    //Schedule the next draw if requested.
    if (!scheduleNext) return;
    if (clockDrawTimeout) clearTimeout(clockDrawTimeout);
    let interval = updateSeconds ? 1000 : 60000;
    clockDrawTimeout = setTimeout(function() {
      clockDrawTimeout = undefined;
      drawTime(true);
    }, interval - (Date.now() % interval));
  };

  /*
  Returns a tuple in the format {r, g, b} with the color
  of the blob with the given ID.
  This saves memory compared to having the colors stored in an array.
  */
  let getColor = function(color) {
    if (color == 1)
      return {r: 1, g: 0, b: 0};
    if (color == 2)
      return {r: 0, g: 1, b: 0};
    if (color == 3)
      return {r: 0, g: 0, b: 1};
    if (color == 4)
      return {r: 1, g: 1, b: 0};
    if (color == 5)
      return {r: 1, g: 0, b: 1};
    if (color == 6)
      return {r: 0, g: 1, b: 1};
    if (color == 7)
      return {r: 0.5, g: 0.5, b: 0.5};
    return {r: 1, g: 1, b: 1};
  };

  /*
  Clears the screen and draws the background.
  */
  let drawBackground = function() {
    //Background
    g.setBgColor(0.5, 0.2, 0.1);
    g.clear();
    g.setBgColor(0, 0, 0);
    g.clearRect(33, 0, 142, 176);
    g.setBgColor(0.5, 0.5, 0.5);
    g.clearRect(33, 4, 142, 6);

    //Reset button
    g.setBgColor(0.5, 0.5, 0.5);
    g.setColor(0, 0, 0);
    g.clearRect(143, 150, 175, 175);
    g.setFont("Vector", 30);
    g.drawString("R", 152, 150);

    //Pause button
    g.clearRect(0, 150, 32, 175);
    g.fillRect(9, 154, 13, 171);
    g.fillRect(18, 154, 22, 171);
  };

  /*
  Draws a box under the next queue that displays
  the current value of lastChain.
  */
  let drawChainCount = function() {
    g.setBgColor(0, 0, 0);
    g.setColor(1, 0.2, 0.2);
    g.setFont("Vector", 23);
    g.clearRect(145, 42, 173, 64);

    if (lastChain > 0) {
      if (lastChain < 10) g.drawString(lastChain, 154, 44);
      if (lastChain >= 10) g.drawString(lastChain, 147, 44);
    }
  };

  /*
  Draws the blob at the given slot.
  */
  let drawBlobAtSlot = function(x, y) {
    //If this blob is in the hidden row, clear it out and stop.
    if (y < 0) {
      g.setBgColor(0, 0, 0);
      g.clearRect((x*18)+34, 0, (x*18)+52, 3);
      return;
    }

    //First, clear what was in that slot.
    g.setBgColor(0, 0, 0);
    g.clearRect((x*18)+34, (y*14)+7, (x*18)+52, (y*14)+21);

    let color = grid[y][x];

    if (color != 0) {
      let myColor = getColor(color);
      g.setColor(myColor.r, myColor.g, myColor.b);
      g.fillEllipse((x*18)+34, (y*14)+7, (x*18)+52, (y*14)+21);
      g.setColor(1, 1, 1);
      g.drawEllipse((x*18)+34, (y*14)+7, (x*18)+52, (y*14)+21);
    }
  };

  /*
  Draws the ghost piece.
  clearOld: if the previous location of the ghost piece should be cleared.
  */
  let drawGhostPiece = function(clearOld) {
    if (clearOld) {
      g.setColor(0, 0, 0);
      g.fillRect((oldGhost.pivotX*18)+38, (oldGhost.pivotY*14)+8, (oldGhost.pivotX*18)+47, (oldGhost.pivotY*14)+17);
      g.fillRect((oldGhost.leafX*18)+38, (oldGhost.leafY*14)+8, (oldGhost.leafX*18)+47, (oldGhost.leafY*14)+17);
    }

    let pivotX = dropCoordinates.pivotX;
    let pivotY = dropCoordinates.pivotY;
    let leafX = dropCoordinates.leafX;
    let leafY = dropCoordinates.leafY;
    let pivotColor = getColor(currentPair.pivot);
    let leafColor = getColor(currentPair.leaf);

    g.setColor(pivotColor.r, pivotColor.g, pivotColor.b);
    g.fillRect((pivotX*18)+40, (pivotY*14)+10, (pivotX*18)+45, (pivotY*14)+15);
    g.setColor(1, 1, 1);
    g.drawRect((pivotX*18)+38, (pivotY*14)+8, (pivotX*18)+47, (pivotY*14)+17);
    g.setColor(leafColor.r, leafColor.g, leafColor.b);
    g.fillRect((leafX*18)+40, (leafY*14)+10, (leafX*18)+45, (leafY*14)+15);

    oldGhost = {pivotX: pivotX, pivotY: pivotY, leafX: leafX, leafY: leafY};
  };

  /*
  Draws the next queue.
  */
  let drawNextQueue = function() {
    g.setBgColor(0, 0, 0);
    g.clearRect(145, 4, 173, 28);

    let p1 = nextQueue[0].pivot;
    let l1 = nextQueue[0].leaf;
    let p2 = nextQueue[1].pivot;
    let l2 = nextQueue[1].leaf;
    let p1C = getColor(p1);
    let l1C = getColor(l1);
    let p2C = getColor(p2);
    let l2C = getColor(l2);

    g.setColor(p1C.r, p1C.g, p1C.b);
    g.fillEllipse(146, 17, 157, 28);
    g.setColor(l1C.r, l1C.g, l1C.b);
    g.fillEllipse(146, 5, 157, 16);
    g.setColor(p2C.r, p2C.g, p2C.b);
    g.fillEllipse(162, 17, 173, 28);
    g.setColor(l2C.r, l2C.g, l2C.b);
    g.fillEllipse(162, 5, 173, 16);

    g.setColor(1, 1, 1);
    g.drawLine(159, 4, 159, 28);
    g.drawEllipse(146, 17, 157, 28);
    g.drawEllipse(146, 5, 157, 16);
    g.drawEllipse(162, 17, 173, 28);
    g.drawEllipse(162, 5, 173, 16);
  };

  /*
  Redraws the screen, except for the ghost piece.
  */
  let redrawBoard = function() {
    drawBackground();
    drawNextQueue();
    drawChainCount();
    drawTime(false);
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 6; x++) {
        drawBlobAtSlot(x, y);
      }
    }
  };

  /*
  Toggles the pause screen.
  */
  let togglePause = function() {
    gamePaused = !gamePaused;

    if (gamePaused) {
      g.setBgColor(0.5, 0.2, 0.1);
      g.clear();
      drawTime(false);

      g.setBgColor(0, 0, 0);
      g.setColor(1, 1, 1);
      g.clearRect(48, 66, 157, 110);
      g.setFont("Vector", 20);
      g.drawString("Tap here\nto unpause", 50, 68);

      require("widget_utils").show();
      Bangle.drawWidgets();
    } else {
      require("widget_utils").hide();

      redrawBoard();
      drawGhostPiece(false);

      //Display the loss text if the game is lost.
      if (gameLost) {
        g.setBgColor(0, 0, 0);
        g.setColor(1, 1, 1);
        g.clearRect(33, 73, 142, 103);
        g.setFont("Vector", 20);
        g.drawString("You Lose", 43, 80);
      }
    }
  };

  // ~~ Events ~~
  let dragAmnt = 0;

  let onTouch = (z, e) => {
    if (midChain) return;

    if (gamePaused) {
      if (e.x >= 40 && e.y >= 58 && e.x <= 165 && e.y <= 118) {
        g.setBgColor(1, 1, 1);
        g.clearRect(48, 66, 157, 110);
        g.flip();
        togglePause();
      }
    } else {
      //Tap reset button
      if (e.x >= 143 && e.y >= 150) {
        restartGame();
        newPair();
        redrawBoard();
        drawGhostPiece(false);
        g.flip();
        return;
      }

      //Tap pause button
      if (e.x <= 32 && e.y >= 150) {
        togglePause();
        return;
      }

      //While playing, rotate pieces.
      if (!gameLost && !gamePaused) {
        if (e.x < 88) {
          rotatePair(false);
          drawGhostPiece(true);
        } else {
          rotatePair(true);
          drawGhostPiece(true);
        }
      }
    }
  };

  Bangle.on("touch", onTouch);

  let onDrag = (e) => {
    if (gameLost || gamePaused || midChain) return;

    //Do nothing if the user is dragging down so that they don't accidentally move while dropping
    if (e.dy >= 5) {
      return;
    }

    dragAmnt += e.dx;
    if (e.b == 0) {
      dragAmnt = 0;
    }
    if (dragAmnt >= 20) {
      movePair(Math.floor(dragAmnt / 20));
      drawGhostPiece(true);
      dragAmnt = dragAmnt % 20;
    }
    if (dragAmnt <= -20) {
      movePair(Math.ceil(dragAmnt / 20));
      drawGhostPiece(true);
      dragAmnt = dragAmnt % 20;
    }
  };

  Bangle.on("drag", onDrag);

  let onSwipe = (x, y) => {
    if (gameLost || gamePaused || midChain) return;

    if (y > 0) {
      let pivotX = dropCoordinates.pivotX;
      let pivotY = dropCoordinates.pivotY;
      let leafX = dropCoordinates.leafX;
      let leafY = dropCoordinates.leafY;

      if (pivotY < -1 && leafY < -1) return;

      quickDrop();
      drawBlobAtSlot(pivotX, pivotY);
      drawBlobAtSlot(leafX, leafY);
      g.flip();

      //Check for pops
      if (pivotY >= 0) addSlotToCheck(pivotX, pivotY);
      if (leafY >= 0) addSlotToCheck(leafX, leafY);
      midChain = true;
      let currentChain = 0;
      while (popAll().pops > 0) {
        currentChain++;
        lastChain = currentChain;
        drawChainCount();
        g.flip();
        settleBlobs();
        redrawBoard();
        g.flip();
      }

      newPair();
      drawNextQueue();
      drawGhostPiece(false);

      //If the top slot of the third column is taken, lose the game.
      if (grid[0][2] != 0) {
        gameLost = true;
        g.setBgColor(0, 0, 0);
        g.setColor(1, 1, 1);
        g.clearRect(33, 73, 142, 103);
        g.setFont("Vector", 20);
        g.drawString("You Lose", 43, 80);
      }

      midChain = false;
    }
  };

  Bangle.on("swipe", onSwipe);

  let onLock = on => {
    updateSeconds = !on;
    drawTime(true);
  };

  Bangle.on('lock', onLock);

  let onCharging = charging => {
    drawTime(false);
  };

  Bangle.on('charging', onCharging);

  Bangle.setUI({mode:"clock", remove:function() {
    //Remove listeners
    Bangle.removeListener("touch", onTouch);
    Bangle.removeListener("drag", onDrag);
    Bangle.removeListener("swipe", onSwipe);
    Bangle.removeListener('lock', onLock);
    Bangle.removeListener('charging', onCharging);

    if (clockDrawTimeout) clearTimeout(clockDrawTimeout);
    require("widget_utils").show();
  }});

  g.reset();

  Bangle.loadWidgets();
  require("widget_utils").hide();

  drawBackground();
  drawTime(true);

  restartGame();

  newPair();
  drawGhostPiece(false);

  drawNextQueue();
  drawChainCount();
}
