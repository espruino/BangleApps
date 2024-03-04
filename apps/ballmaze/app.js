(() => {
  BANGLEJS2 = process.env.HWVERSION==2;
  Bangle.setLCDTimeout(0);
  let intervalID;
  let settings = require("Storage").readJSON("ballmaze.json",true) || {};

  // density, elasticity of bounces, "drag coefficient"
  const rho = 100, e = 0.3, C = 0.01;
  // screen width & height in pixels
  const sW = g.getWidth();
  const sH = g.getHeight()*2/3;
  const bgColour ="#f00";  // only for Bangle.js 2
  // gravity constant (lowercase was already taken)
  const G = 9.80665;

  // wall bit flags
  const TOP = 1<<0, LEFT = 1<<1, BOTTOM = 1<<2, RIGHT = 1<<3,
    LINKED = 1<<4; // used in maze generation

  // The play area is 240x160, sizes are the ball radius, so we can use common
  // denominators of 120x80 to get square rooms
  // Reverse the order to show the easiest on top of the menu
  const sizeNames = {
    1: "Insane", 2: "Gigantic", 4: "Enormous", 5: "Huge", 8: "Large",
    10: "Medium", 16: "Small", 20: "Tiny", 40: "Trivial",
  };
  // even size 1 actually works, but larger mazes take forever to generate
  // TODO: should `sizes`, `minSize` and `defaultSize` have been declared outside the if block?
  if (!BANGLEJS2) {
    const sizes = [1, 2, 4, 5, 8, 10, 16, 20, 40].reverse(), minSize = 4, defaultSize = 10;
  } else {
    const sizes = [1, 2, 4, 5, 8, 10, 16, 20    ].reverse(), minSize = 4, defaultSize = 10;
  }
  /**
   * Draw something to all screen buffers
   * @param draw {function} Callback which performs the drawing
   */
  function drawAll(draw) {
    draw();
    g.flip();
    draw();
    g.flip();
  }

  /**
   * Clear all buffers
   */
  function clearAll() {
    drawAll(() => g.clear());
  }

  // use unbuffered graphics for UI stuff
  function showMessage(message, title) {
    if (!BANGLEJS2) Bangle.setLCDMode();
    return E.showMessage(message, title);
  }

  function showPrompt(prompt, options) {
    if (!BANGLEJS2) Bangle.setLCDMode();
    return E.showPrompt(prompt, options);
  }

  function showMenu(menu) {
    if (!BANGLEJS2) Bangle.setLCDMode();
    return E.showMenu(menu);
  }

  const sign = (n) => n<0?-1:1; // we don't really care about zero

  /**
   * Play the game, using a ball with radius size
   * @param size {number}
   */
  function playMaze(size) {
    const r = size;
    // ball mass, weight, "drag"
    // Yes, larger maze = larger ball = heavier ball
    // (atm our physics is so oversimplified that mass cancels out though)
    const m = rho*(r*r*r), w = G*m, d = C*w;

    // number of columns/rows
    const cols = Math.round(sW/(r*2.5)),
      rows = Math.round(sH/(r*2.5));
    // width & height of one column/row in pixels
    const cW = sW/cols, rH = sH/rows;

    // list of rooms, every room can have one or more wall bits set
    // actual layout:  0 1 2
    //                 3 4 5
    // this means that for room with index "i": (except edge cases!)
    //   i-1    = room to the left
    //   i+1    = room to the right
    //   i-cols = room above
    //   i+cols = room below
    let rooms = new Uint8Array(rows*cols);
    // shortest route from start to finish
    let route;

    let x, y, // current position
      px, py, ppx, ppy, // previous positions (for erasing old image)
      vx, vy; // velocity

    function start() {
      // start in top left corner
      x = cW/2;
      y = rH/2;
      vx = vy = 0;
      ppx = px = x;
      ppy = py = y;

      generateMaze(); // this shows unbuffered progress messages
      if (settings.cheat && r>1) findRoute(); // not enough memory for r==1 :-(

      if (!BANGLEJS2) Bangle.setLCDMode("doublebuffered");
      clearAll();
      drawAll(drawMaze);
      intervalID = setInterval(tick, 100);
    }

    // Position conversions
    // index:  index of room in rooms[]
    // rowcol: position measured in roomsizes
    // xy:     position measured in pixels
    /**
     * Index from RowCol
     * @param row {number}
     * @param col {number}
     * @returns {number} rooms[] index
     */
    function iFromRC(row, col) {
      return row*cols+col;
    }

    /**
     * RowCol from index
     * @param index {number}
     * @returns {(number)[]} [row,column]
     */
    function rcFromI(index) {
      return [
        Math.floor(index/cols),
        index%cols,
      ];
    }

    /**
     * RowCol from Xy
     * @param x {number}
     * @param y {number}
     * @returns {(number)[]} [row,column]
     */
    function rcFromXy(x, y) {
      return [
        Math.floor(y/sH*rows),
        Math.floor(x/sW*cols),
      ];
    }

    /**
     * Link another room up
     * @param index {number} Dig from already linked room with this index
     * @param dir {number} in this direction
     * @return {number} index of room we just linked up
     */
    function dig(index, dir) {
      rooms[index] &= ~dir;
      let neighbour;
      switch(dir) {
        case LEFT:
          neighbour = index-1;
          rooms[neighbour] &= ~RIGHT;
          break;
        case RIGHT:
          neighbour = index+1;
          rooms[neighbour] &= ~LEFT;
          break;
        case TOP:
          neighbour = index-cols;
          rooms[neighbour] &= ~BOTTOM;
          break;
        case BOTTOM:
          neighbour = index+cols;
          rooms[neighbour] &= ~TOP;
          break;
      }
      rooms[neighbour] |= LINKED;
      return neighbour;
    }

    /**
     * Generate the maze
     */
    function generateMaze() {
      // Maze generation basically works like this:
      // 1. Start with all rooms set to completely walled off and "unlinked"
      // 2. Then mark a room as "linked", and add it to the "to do" list
      // 3. When the "to do" list is empty, we're done
      // 4. pick a random room from the list
      // 5. if all adjacent rooms are linked -> remove room from list, goto 3
      // 6. pick a random unlinked adjacent room
      // 7. remove the walls between the rooms
      // 8. mark the adjacent room as linked and add it to the "to do" list
      // 9. go to 4
      let pdotnum = 0;
      const title = "Please wait",
        message = "Generating maze\n",
        showProgress = (done, total) => {
          const dotnum = Math.floor(done/total*10);
          if (dotnum>pdotnum) {
            const dots = ".".repeat(dotnum)+" ".repeat(10-dotnum);
            showMessage(message+dots, title);
            pdotnum = dotnum;
          }
        };
      showProgress(0, 100);
      // start with all rooms completely walled off
      rooms.fill(TOP|LEFT|BOTTOM|RIGHT);
      const
        // is room at row,col already linked?
        linked = (row, col) => !!(rooms[iFromRC(row, col)]&LINKED),
        // pick random array element
        pickRandom = (arr) => arr[Math.floor(Math.random()*arr.length)];
      // starting with top-right room seems to generate more interesting mazes
      rooms[cols] |= LINKED;
      let todo = [cols], done = 1;
      while(todo.length) {
        const index = pickRandom(todo);
        const rc = rcFromI(index),
          row = rc[0], col = rc[1];
        let sides = [];
        if ((col>0) && !linked(row, col-1)) sides.push(LEFT);
        if ((col<cols-1) && !linked(row, col+1)) sides.push(RIGHT);
        if ((row>0) && !linked(row-1, col)) sides.push(TOP);
        if ((row<rows-1) && !linked(row+1, col)) sides.push(BOTTOM);
        if (sides.length<=1) {
          // no need to visit this room again
          todo.splice(todo.indexOf(index), 1);
        }
        if (!sides.length) {
          // no neighbours need linking
          continue;
        }
        todo.push(dig(index, pickRandom(sides)));
        showProgress(done++, rooms.length);
      }
    }

    /**
     * We wouldn't want to generate a maze we can't solve ourselves...
     */
    function findRoute() {
      let dist = new Uint16Array(rooms.length), todo = [0];
      dist.fill(-1);
      dist[0] = 0;
      while(true) {
        const i = todo.shift(), d = dist[i], walls = rooms[i],
          rc = rcFromI(i),
          row = rc[0], col = rc[1];
        if (i===rooms.length-1) { break; }
        if (col>0 && !(walls&LEFT) && dist[i-1]>d+1) {
          dist[i-1] = d+1;
          todo.push(i-1);
        }
        if (row>0 && !(walls&TOP) && dist[i-cols]>d+1) {
          dist[i-cols] = d+1;
          todo.push(i-cols);
        }
        if (col<cols-1 && !(walls&RIGHT) && dist[i+1]>d+1) {
          dist[i+1] = d+1;
          todo.push(i+1);
        }
        if (row<rows-1 && !(walls&BOTTOM) && dist[i+cols]>d+1) {
          dist[i+cols] = d+1;
          todo.push(i+cols);
        }
      }

      route = [rooms.length-1];
      while(true) {
        const i = route[0], d = dist[i], walls = rooms[i],
          rc = rcFromI(i),
          row = rc[0], col = rc[1];
        if (i===0) { break; }
        if (col<cols-1 && !(walls&RIGHT) && dist[i+1]<d) {
          route.unshift(i+1);
          continue;
        }
        if (row<rows-1 && !(walls&BOTTOM) && dist[i+cols]<d) {
          route.unshift(i+cols);
          continue;
        }
        if (row>0 && !(walls&TOP) && dist[i-cols]<d) {
          route.unshift(i-cols);
          continue;
        }
        if (col>0 && !(walls&LEFT) && dist[i-1]<d) {
          route.unshift(i-1);
          continue;
        }
        // this should never happen!
        console.log("No route found!");
        break;
      }
    }

    /**
     * Draw the maze:
     * - room borders
     * - maze border
     * - exit
     */
    function drawMaze() {
      const range = {top: 0, left: 0, bottom: rows, right: cols};
      const w = sW/cols, h = sH/rows;
      g.clear();
      if (BANGLEJS2) g.setBgColor(bgColour);
      g.setColor(0.76, 0.60, 0.42);
      for(let row = range.top; row<=range.bottom; row++) {
        for(let col = range.left; col<=range.right; col++) {
          const walls = rooms[row*cols+col], x = col*w, y = row*h;
          if (walls&BOTTOM) g.drawLine(x, y+h, x+w, y+h);
          if (walls&RIGHT) g.drawLine(x+w, y, x+w, y+h);
        }
      }
      // outline
      g.setColor(0.29, 0.23, 0.17).drawRect(0, 0, sW-1, sH-1);
      // target
      g.setColor(0, 0.5, 0).fillCircle(sW-cW/2, sH-rH/2, r-1);
      if (route) drawRoute();
    }

    /**
     * Redraw a part of the maze (after we erased the ball image)
     * @param range Draw rooms in this range {top,left,bottom,right}
     */
    function redrawMaze(range) {
      const w = sW/cols, h = sH/rows;
      g.setColor(0.76, 0.60, 0.42);
      for(let row = range.top; row<=range.bottom; row++) {
        for(let col = range.left; col<=range.right; col++) {
          const walls = rooms[row*cols+col], x = col*w, y = row*h;
          if (row===range.top && walls&TOP) g.drawLine(x, y, x+w, y);
          if (col===range.left && walls&LEFT) g.drawLine(x, y, x, y+h);
          if (walls&BOTTOM) g.drawLine(x, y+h, x+w, y+h);
          if (walls&RIGHT) g.drawLine(x+w, y, x+w, y+h);
        }
      }
      g.setColor(0.29, 0.23, 0.17).drawRect(0, 0, sW-1, sH-1);
    }

    /**
     * Draw the ball, with glare offset depending on ball position
     */
    function drawBall() {
      g.setColor(0.7, 0.7, 0.8).fillCircle(x, y, r-1);
      const gx = -x/sW, gy = -y/sH;
      g.setColor(0.8, 0.8, 0.9).fillCircle(x+gx*r/5, y+gy*r/5, r/2)
        .setColor(0.85, 0.85, 0.95).fillCircle(x+gx*r/4, y+gy*r/4.5, r/2.5)
        .setColor(0.9, 0.9, 1).fillCircle(x+gx*r/3, y+gy*r/3, r/3.5)
        .setColor(1, 1, 1).fillCircle(x+gx*r/3, y+gy*r/3, r/6);
    }

    /**
     * Update the screen:
     * - erase previous ball image
     * - redraw maze around the erased area
     * - draw the ball
     */
    function drawUpdate() {
      g.clearRect(ppx-r, ppy-r, ppx+r, ppy+r);
      const rc = rcFromXy(ppx, ppy),
        row = rc[0], col = rc[1];
      redrawMaze({top: row-1, left: col-1, bottom: row+1, right: col+1});
      drawBall();
      g.flip();
    }

    function drawRoute() {
      let i = route[0], rc = rcFromI(i),
        row = rc[0], col = rc[1],
        x = (col+0.5)*cW, y = (row+0.5)*rH;
      g.setColor(1, 0, 0).moveTo(x, y);
      route.forEach(i => {
        const rc = rcFromI(i),
          row = rc[0], col = rc[1],
          x = (col+0.5)*cW, y = (row+0.5)*rH;
        g.lineTo(x, y);
      });
    }

    /**
     * Move the ball
     */
    function move() {
      const a = Bangle.getAccel();
      const fx = (-a.x*w)-(sign(vx)*d*a.z), fy = (-a.y*w)-(sign(vy)*d*a.z);
      vx += fx/m;
      vy += fy/m;
      const s = Math.ceil(Math.max(Math.abs(vx), Math.abs(vy)));
      for(let n = s; n>0; n--) {
        x += vx/s;
        y += vy/s;
        bounce();
      }
      if (x>sW-cW && y>sH-rH) win();
    }

    /**
     * Check whether we hit any walls, and if so: Bounce.
     *
     * Bounce = reverse velocity in bounce direction, multiply with elasticity
     * Also apply drag in perpendicular direction ("friction with the wall")
     */
    function bounce() {
      const row = Math.floor(y/sH*rows), col = Math.floor(x/sW*cols),
        i = row*cols+col, walls = rooms[i];
      const left = col*cW,
        right = (col+1)*cW,
        top = row*rH,
        bottom = (row+1)*rH;
      let bounced = false;
      if (vx<0) {
        if ((walls&LEFT) && x<=left+r) {
          x += (1+e)*(left+r-x);
          const fy = sign(vy)*d*Math.abs(vx);
          vy -= fy/m;
          vx = -vx*e;
          bounced = true;
        }
      } else {
        if ((walls&RIGHT) && x>=right-r) {
          x -= (1+e)*(x+r-right);
          const fy = sign(vy)*d*Math.abs(vx);
          vy -= fy/m;
          vx = -vx*e;
          bounced = true;
        }
      }
      if (vy<0) {
        if ((walls&TOP) && y<=top+r) {
          y += (1+e)*(top+r-y);
          const fx = sign(vx)*d*Math.abs(vy);
          vx -= fx/m;
          vy = -vy*e;
          bounced = true;
        }
      } else {
        if ((walls&BOTTOM) && y>=bottom-r) {
          y -= (1+e)*(y+r-bottom);
          const fx = sign(vx)*d*Math.abs(vy);
          vx -= fx/m;
          vy = -vy*e;
          bounced = true;
        }
      }
      if (bounced) return;
      let cx, cy;
      if ((rooms[i-1]&TOP) || rooms[i-cols]&LEFT) {
        if ((x-left)*(x-left)+(y-top)*(y-top)<=r*r) {
          cx = left;
          cy = top;
        }
      }
      else if ((rooms[i-1]&BOTTOM) || rooms[i+cols]&LEFT) {
        if ((x-left)*(x-left)+(bottom-y)*(bottom-y)<=r*r) {
          cx = left;
          cy = bottom;
        }
      }
      else if ((rooms[i+1]&TOP) || rooms[i-cols]&RIGHT) {
        if ((right-x)*(right-x)+(y-top)*(y-top)<=r*r) {
          cx = right;
          cy = top;
        }
      }
      else if ((rooms[i+1]&BOTTOM) || rooms[i+cols]&RIGHT) {
        if ((right-x)*(right-x)+(bottom-y)*(bottom-y)<=r*r) {
          cx = right;
          cy = bottom;
        }
      }
      if (!cx) return;
      let nx = x-cx, ny = y-cy;
      const l = Math.sqrt(nx*nx+ny*ny);
      nx /= l;
      ny /= l;
      const p = vx*nx+vy*ny;
      vx -= 2*p*nx*e;
      vy -= 2*p*ny*e;
    }

    /**
     * You reached the bottom-right corner, you win!
     */
    function win() {
      clearInterval(intervalID);
      Bangle.buzz().then(askAgain);
    }

    /**
     * You solved the maze, try the next one?
     */
    function askAgain() {
      const nextLevel = (size>minSize)?"next level":"again";
      const nextSize = (size>minSize)?sizes[sizes.indexOf(size)+1]:size;
      showPrompt(`Well done!\n\nPlay ${nextLevel}?`,
        {"title": "Congratulations!"})
        .then(function(again) {
          if (again) {
            playMaze(nextSize);
          } else {
            startGame();
          }
        });
    }

    function tick() {
      ppx = px;
      ppy = py;
      px = x;
      py = y;
      move();
      drawUpdate();
    }

    start();
  }

  /**
   * Ask player what size maze they would like to play
   */
  function startGame() {
    let menu = {
      "": {
        title: "Select Maze Size",
        selected: sizes.indexOf(settings.size || defaultSize),
      },
    };
    sizes.filter(s => s>=minSize).forEach(size => {
      let name = sizeNames[size];
      if (size<minSize) name = "! "+size;
      let cols = Math.round(sW/(size*2.5)),
        rows = Math.round(sH/(size*2.5));
      if (rows<10) rows = " "+rows;
      if (cols<10) cols = " "+cols;
      name += " ".repeat(14-name.length);
      name += `${cols}x${rows}`;
      menu[name] = () => {
        // remember chosen size
        settings.size = size;
        require("Storage").write("ballmaze.json", settings);
        playMaze(size);
      };
    });
    menu["< Exit"] = () => load();
    showMenu(menu);
  }

  startGame();
})();
