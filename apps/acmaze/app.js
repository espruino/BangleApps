const MARGIN = 25;
const WALL_RIGHT = 1, WALL_DOWN = 2;
const STATUS_GENERATING = 0, STATUS_PLAYING = 1,
      STATUS_SOLVED = 2, STATUS_ABORTED = -1;

function Maze(n) {
  this.n = n;
  this.status = STATUS_GENERATING;
  this.wall_length = Math.floor((g.getHeight()-2*MARGIN)/n);
  this.total_length = this.wall_length*n;
  this.margin = Math.floor((g.getHeight()-this.total_length)/2);
  this.ball_x = 0;
  this.ball_y = 0;
  // This voodoo is needed because otherwise
  // bottom line widgets (like digital clock)
  // disappear during maze generation
  Bangle.drawWidgets();
  g.setColor(g.theme.fg);
  for (let i=0; i<=n; i++) {
    g.drawRect(
      this.margin, this.margin+i*this.wall_length,
      g.getWidth()-this.margin, this.margin+i*this.wall_length
    );
    g.drawRect(
      this.margin+i*this.wall_length, this.margin,
      this.margin+i*this.wall_length, g.getHeight() - this.margin
    );
  }
  this.walls = new Uint8Array(n*n);
  this.groups = new Uint8Array(n*n);
  for (let cell = 0; cell<n*n; cell++) {
    this.walls[cell] = WALL_RIGHT|WALL_DOWN;
    this.groups[cell] = cell;
  }
  // Candidates of walls to break when digging the maze.
  // If candidate failed (breaking it would create a loop),
  // it would never succeed, so no need to retry it.
  let candidates_down = [],
      candidates_right = [];
  for (let r=0 ; r<n; r++) {
    for (let c=0; c<n; c++) {
      let cell = n*r+c;
      if (r<(n-1)) { // Don't break wall down for bottom row.
        candidates_down.push(cell);
      }
      if (c<(n-1)) { // Don't break wall right for rightmost column.
        candidates_right.push(cell);
      }
    }
  }
  let from_group, to_group;
  let ngroups = n*n;
  while (--ngroups) {
    // Abort if BTN1 pressed [grace period for menu]
    // (for some reason setWatch() fails inside constructor)
    if (ngroups<n*n-16 && digitalRead(BTN1)) {
      //aborting = true;
      return;
    }
    from_group = to_group = -1;
    while (from_group<0) {
      let trying_down = false;
      if (Math.random()<0.5 && candidates_down.length || !candidates_right.length) {
        trying_down = true;
      }
      let candidates = trying_down ? candidates_down : candidates_right,
          candidate_index = Math.floor(Math.random()*candidates.length),
          cell = candidates.splice(candidate_index, 1)[0],
          r = Math.floor(cell/n),
          c = cell%n;
      if (trying_down) { // try to break a wall down
        if (this.groups[cell]!=this.groups[cell+n]) {
          this.walls[cell] &= ~WALL_DOWN;
          g.clearRect(
              this.margin+c*this.wall_length+1,
              this.margin+(r+1)*this.wall_length,
              this.margin+(c+1)*this.wall_length-1,
              this.margin+(r+1)*this.wall_length
          );
          g.flip(); // show progress.
          from_group = this.groups[cell];
          to_group = this.groups[cell+n];
        }
      } else { // try to break a wall right
        if (this.groups[cell]!=this.groups[cell+1]) {
          this.walls[cell] &= ~WALL_RIGHT;
          g.clearRect(
              this.margin+(c+1)*this.wall_length,
              this.margin+r*this.wall_length+1,
              this.margin+(c+1)*this.wall_length,
              this.margin+(r+1)*this.wall_length-1
          );
          g.flip(); // show progress.
          from_group = this.groups[cell];
          to_group = this.groups[cell+1];
        }
      }
    }
    for (let cell = 0; cell<n*n; cell++) {
      if (this.groups[cell]==from_group) {
        this.groups[cell] = to_group;
      }
    }
  }
  this.clearCell = function(r, c) {
    if (!r && !c) {
      g.setColor("#ffff00");
    } else if (r==this.n-1 && c==this.n-1) {
      g.setColor("#00ff00");
    } else {
      g.setColor(g.theme.bg);
    }
    g.fillRect(
      this.margin+this.wall_length*c+1,
      this.margin+this.wall_length*r+1,
      this.margin+this.wall_length*(c+1),
      this.margin+this.wall_length*(r+1)
    );
    g.setColor(g.theme.fg);
    if (this.walls[r*n+c]&WALL_RIGHT) {
      g.fillRect(
        this.margin+this.wall_length*(c+1),
        this.margin+this.wall_length*r,
        this.margin+this.wall_length*(c+1),
        this.margin+this.wall_length*(r+1)
      );
    }
    if (this.walls[r*n+c]&WALL_DOWN) {
      g.fillRect(
        this.margin+this.wall_length*c,
        this.margin+this.wall_length*(r+1),
        this.margin+this.wall_length*(c+1),
        this.margin+this.wall_length*(r+1)
      );
    }
  };
  this.drawBall = function(x, y) {
    g.setColor("#ff0000");
    g.fillEllipse(
      this.margin+x+1,
      this.margin+y+1,
      this.margin+x+this.wall_length-1,
      this.margin+y+this.wall_length-1
    );
    g.setColor(g.theme.fg);
  };
  this.move = function(dx, dy) {
    let next_x = this.ball_x,
        next_y = this.ball_y,
        ball_r = Math.floor(this.ball_y/this.wall_length),
        ball_c = Math.floor(this.ball_x/this.wall_length);
    if (this.ball_x%this.wall_length) {
      if (dx) {
        next_x += dx;
      } else {
        return false;
      }
    } else if (this.ball_y%this.wall_length) {
      if (dy) {
        next_y += dy;
      } else {
        return false;
      }
    } else { // exactly in a cell. Check walls
      if (dy<0 && ball_r>0 && !(this.walls[n*(ball_r-1)+ball_c]&WALL_DOWN)) {
        next_y--;
      } else if (dy>0 && ball_r<(this.n-1) && !(this.walls[n*ball_r+ball_c]&WALL_DOWN)) {
        next_y++;
      } else if (dx<0 && ball_c>0 && !(this.walls[n*ball_r+ball_c-1]&WALL_RIGHT)) {
        next_x--;
      } else if (dx>0 && ball_c<(this.n-1) && !(this.walls[n*ball_r+ball_c]&WALL_RIGHT)) {
        next_x++;
      } else {
        return false;
      }
    }
    this.clearCell(ball_r, ball_c);
    if (this.ball_x%this.wall_length) {
      this.clearCell(ball_r, ball_c+1);
    }
    if (this.ball_y%this.wall_length) {
      this.clearCell(ball_r+1, ball_c);
    }
    this.ball_x = next_x;
    this.ball_y = next_y;
    this.drawBall(this.ball_x, this.ball_y);
    if (this.ball_x==(n-1)*this.wall_length && this.ball_y==(n-1)*this.wall_length) {
      this.status = STATUS_SOLVED;
    }
    return true;
  };
  this.try_move_horizontally = function(accel_x) {
    if (accel_x>0.15) {
      return this.move(-1, 0);
    } else if (accel_x<-0.15) {
      return this.move(1, 0);
    }
    return false;
  };
  this.try_move_vertically = function(accel_y) {
    if (accel_y<-0.15) {
      return this.move(0,1);
    } else if (accel_y>0.15) {
      return this.move(0,-1);
    }
    return false;
  };
  this.tick = function() {
    let accel = Bangle.getAccel();
    if (this.ball_x%this.wall_length) {
      this.try_move_horizontally(accel.x);
    } else if (this.ball_y%this.wall_length) {
      this.try_move_vertically(accel.y);
    } else {
      if (Math.abs(accel.x)>Math.abs(accel.y)) { // prefer horizontally
        if (!this.try_move_horizontally(accel.x)) {
          this.try_move_vertically(accel.y);
        }
      } else { // prefer vertically
        if (!this.try_move_vertically(accel.y)) {
          this.try_move_horizontally(accel.x);
        }
      }
    }
  };
  this.clearCell(0,0);
  this.clearCell(n-1,n-1);
  this.drawBall(0,0);
  this.status = STATUS_PLAYING;
}

function timeToText(t) { // Courtesy of stopwatch app
  let hrs = Math.floor(t/3600000);
  let mins = Math.floor(t/60000)%60;
  let secs = Math.floor(t/1000)%60;
  let tnth = Math.floor(t/100)%10;
  let text;

  if (hrs === 0)
    text = ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2) + "." + tnth;
  else
    text = ("0"+hrs) + ":" + ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2);
  return text;
}

//let aborting = false;
let start_time = 0;
let duration = 0;
let maze=null;
let mazeMenu = {
  "": { "title": "Maze size", "selected": 1 },
  "Easy (8x8)": function() { E.showMenu(); maze = new Maze(8); },
  "Medium (10x10)": function() { E.showMenu(); maze = new Maze(10); },
  "Hard (14x14)": function() { E.showMenu(); maze = new Maze(14); },
  "< Exit": function() { setTimeout(load, 100); } // timeout voodoo prevents deadlock
};

g.reset();
Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.setLocked(false);
Bangle.setLCDTimeout(0);
E.showMenu(mazeMenu);
/*let maze_interval =*/ setInterval(
  function() {
    if (maze) {
      if (digitalRead(BTN1) || maze.status==STATUS_ABORTED) {
        maze = null;
        start_time = duration = 0;
        //aborting = false;
        setTimeout(function() {E.showMenu(mazeMenu); }, 100);
        return;
      }
      if (!start_time) {
        start_time = Date.now();
      }
      if (maze.status==STATUS_PLAYING) {
        maze.tick();
      }
      if (maze.status==STATUS_SOLVED && !duration) {
        duration = Date.now()-start_time;
        g.setFontAlign(0,0).setColor(g.theme.fg);
        g.setFont("Vector",18);
        g.drawString(`Solved ${maze.n}X${maze.n} in\n ${timeToText(duration)} \nBtn1 to play again`, g.getWidth()/2, g.getHeight()/2, true);
      }
    }
  }, 25);
