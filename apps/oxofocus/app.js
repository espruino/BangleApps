
const YOUR_MOVE = 0;
const SHOW_SELECTION = 1;
const DISPLAY_MOVE = 2;
const THINKING = 3;
const GAME_OVER = 4;

var move_count;
var win_count = 0;
var game_state;
var msg;
var board;

const wins = [ [1,2,3], [4,5,6], [7,8,9], [1,4,7], [2,5,8], [3,6,9], [1,5,9], [3,5,7] ];
const rowcol = [ [-1,-1], [1,1], [1,2], [1,3], [2,1], [2,2], [2,3], [3,1], [3,2], [3,3] ];
const x_img = require("heatshrink").decompress(atob("mEwwI63jACEngCEvwCEv4CB/wCBn+AgP8AoMf4ED/AFBh/gg/wAoIDBA4IFBB4ITBAoIbBD4I8C/wrCGAQuCGAQuCGAQuCGAQuCAo4RFDoopFGohBFJopZFMopxFPoqJFSoqhFVooA0A"));
const o_img = require("heatshrink").decompress(atob("mEwwIdah/wAof//4ECgYFB4AFBg4FB8AFBj/wh/4AoM/wEB/gFBvwCB/wCBBAU/AQIUCj8AgIzCh+AgYmCg/AgYyCAYIHBAoXgg+AAoMBApkPLgZKBAtBBRLIprDMoJxFPoqJFSoyhCAQStFXIrFFaIrdFdIwAVA"));


function debug(o) {
  //console.log(o);
}


// 1 2 3
// 4 5 6
// 7 8 9

function draw(){
  debug("draw()");
  g.clear();
  message(msg);

  //drawboard
  g.setColor(g.theme.fg);
  g.drawLine(62,24,62,176);
  g.drawLine(112,24,112,176);
  g.drawLine(12,74,164,74);
  g.drawLine(12,124,164,124); 

  for (let cell = 1; cell < 10; cell++) {
    let row = rowcol[cell][0];
    let col = rowcol[cell][1];
    
    if (board[cell] == "X") {
      g.drawImage(x_img, (col - 1)*50+12, (row - 1)*50+24);
    } else if (board[cell] == "O") {
      g.drawImage(o_img, (col - 1)*50+12, (row - 1)*50+24);
    }
  }
}

function message(m) {
  g.reset();
  // if all rules are operating show a green background
  debug('win count=' + win_count);
  
  if (win_count == 0) {
    g.setColor('#f00');  // red, no wins
  } else if (win_count < 8) {
    g.setColor('#00f');  // blue, some wins, not all rules active
  } else {
    g.setColor('#0f0');  // green all rules active
  }
  
  g.fillRect(0, 0, 176, 23);
  g.setColor('#fff');
  g.setFont('6x8',2);
  g.setFontAlign(0, 0);
  g.drawString("" + win_count + " " + m, g.getWidth()/2, 12);
}


// Square locations
//12,24;62,24,112,24
//12,74;62,74,112,74
//12,124;62,124,112,124

function get_move() {
  var col;
  var row;

  if (game_state != YOUR_MOVE)
    return;

  // work out which row/col was selected
  if (x <= 62) {
    col= 0;
  } else if (x <= 112){
    col= 1;
  } else {
    col= 2;
  }
  
  if (y <= 74) {
    row = 0;
  } else if (y <= 124){
    row = 1;
  } else {
    row = 2;
  }

  // convert row / col to a cell
  let cell = 3*row + col + 1;
  debug("select:" + cell);

  if (cell_is_free(cell)) {
    set_cell(cell,'X');
    move_count++;
    game_state = SHOW_SELECTION;
    if (check_for_win()) {
      draw();
      return;
    }
    next_state();
  } else {
    message('try again');
  }
}

function new_game() {
  game_state = YOUR_MOVE;
  move_count = 0;
  msg = 'your move';
  board = [ "-", "1", "2", "3", "4", "5", "6", "7", "8", "9" ];
  draw();
}

function next_state() {
  debug("state=" + game_state);
  
  // show humans selected move with a selection circle
  if (game_state == SHOW_SELECTION) {
    game_state = DISPLAY_MOVE;
    //message('selection..');
    g.fillCircle(x, y, 10);
    setTimeout(next_state,300);
  } else if (game_state == DISPLAY_MOVE) {
    game_state = THINKING;
    msg = 'thinking..';
    draw();
    setTimeout(next_state,1800);
  } else if (game_state == THINKING) {
    game_state = YOUR_MOVE;
    msg = 'your move';
    computer_move();
    move_count++;
    check_for_win();
    draw();
  }

}


function computer_move() {
  var mvs;
  var mv;
  
  if (win_count > 0) {
    if (first_move_was_a_corner()) {
      make_my_move(5);
      debug("RULE 1: you played corner, computer played centre");
      return;
    }
  }
    
  if (win_count > 1) {
    if (first_move_was_the_centre()) {
      mv = get_a_corner_move();
      make_my_move(mv);
      debug("RULE 2: you played center, computer played corner");
      return;
    }
  }
    
  if (win_count > 6) {
    if (first_move_was_a_side()) {
      make_my_move(5);
      debug("RULE 3: you played side, computer played centre");
      return;
    }
  }

  if (win_count > 2) {
    mvs = get_winning_moves("O");
    if (mvs.length > 0) {
      mv = select_random_move_from(mvs);
      make_my_move(mv);
      debug("RULE 4: computer played a winning move");
      return;
    }
  }

  if (win_count > 3) {
    mvs = get_winning_moves("X");
    if (mvs.length > 0) {
      mv = select_random_move_from(mvs);
      make_my_move(mv);
      debug("RULE 5: computer played a blocking move");
      return;
    }
  }
  
  /***
      Adjacent Sides, play in appropriate corner (.)

      . | X
     ---|---
      X |

  ***/

  // not covered by rule 3
  if (win_count > 4) {
    if (player_adjacent_sides("X")) {
      mv = get_adjacent_corner("X");
      if (mv != -1) {
	make_my_move(mv);
	debug("RULE 6: compluter played adjacent corner");
	return;
      }
    }
  }

  if (win_count > 7) {
    if (player_has_corner_and_centre("X")) {
      mvs = get_free_corner();
      if (mvs.length > 0) {
	mv = select_random_move_from(mvs);
	make_my_move(mv);
	debug("RULE 7: compluter played a corner");
	return;
      }
    }
  }
  
  if (win_count > 5) {
    mvs = get_free_sides();
    if (mvs.length > 0) {
      mv = select_random_move_from(mvs);
      make_my_move(mv);
      debug("RULE 8: compluter played a side");
      return;
    }
  }

  // default rule
  mvs = get_free_cells();
  mv = select_random_move_from(mvs);
  debug("RULE 9: computer played a random cell");
  make_my_move(mv);
}

// check the move and make it for "O"
function make_my_move(mv) {
  if (valid_move(mv)) {
    set_cell(mv, "O");
  } else {
    debug("make_my_move(): Invalid move was generated " + mv);
  }
}

function check_for_win() {
  if (player_has_won("X")) {
    msg = 'you win';
    game_state = GAME_OVER;
    win_count++;
    return true;
  } else if (player_has_won("O")) {
    msg = 'I win';
    win_count = 0;
    game_state = GAME_OVER;
    return true;
  } else if (check_for_draw()) {
    msg = 'draw';
    game_state = GAME_OVER;
    return true;
  }
  
  return false;
}

function player_has_won(player) {
  for (var r in wins)
    if (row_is_won(wins[r], player))
      return true;
  return false;
}

function check_for_draw() {
  var v = get_free_cells();
  return (v.length == 0);
}

function row_is_won(rw, pl) {
  if (board[rw[0]] == pl && board[rw[1]] == pl && board[rw[2]] == pl)
    return true;
  return false;
}


function get_winning_moves(player) {
  var win_moves = new Array();

  for (var r in wins) {
    var ind = winning_move_for_row(wins[r], player);
    
    if (ind > -1) {
      win_moves.push(wins[r][ind]);
    }
  }

  return win_moves;
}


function winning_move_for_row(rw, pl) {
  if (board[rw[1]] == pl && board[rw[2]] == pl && cell_is_free(rw[0])) return 0;
  if (board[rw[2]] == pl && board[rw[0]] == pl && cell_is_free(rw[1])) return 1;
  if (board[rw[0]] == pl && board[rw[1]] == pl && cell_is_free(rw[2])) return 2;
  
  return -1;
}

function first_move_was_a_corner() {
  if (move_count != 1)
    return false;

  if (board[1] == "X" || board[3] == "X" || board[7] == "X" || board[9] == "X")
    return true;

  return false;
}

function first_move_was_a_side() {
  if (move_count != 1)
    return false;

  if (board[2] == "X" || board[4] == "X" || board[6] == "X" || board[8] == "X")
    return true;

  return false;
}

function player_adjacent_sides(pl) {
  if (move_count > 3) return false;
  if (board[2] == pl && board[4] == pl) return true;
  if (board[2] == pl && board[6] == pl) return true;
  if (board[8] == pl && board[2] == pl) return true;
  if (board[8] == pl && board[6] == pl) return true;
  
  return false;
}

function get_adjacent_corner(pl) {
  if (board[2] == pl && board[4] == pl) return 1;
  if (board[2] == pl && board[6] == pl) return 3;
  if (board[8] == pl && board[2] == pl) return 7;
  if (board[8] == pl && board[6] == pl) return 9;

  return -1;
}

function player_has_corner_and_centre(pl) {
  if (board[1] == pl && board[5] == pl) return true;
  if (board[3] == pl && board[5] == pl) return true;
  if (board[7] == pl && board[5] == pl) return true;
  if (board[9] == pl && board[5] == pl) return true;
  
  return false;
}

function first_move_was_the_centre() {
  if (move_count == 1 && board[5] == "X")
    return true;
  return false;
}

function get_a_side_move() {
  return select_random_move_from([2,4,6,8]);
}

function get_a_corner_move() {
  return select_random_move_from([1,3,7,9]);
}

function select_random_move_from(mvs) {
  var len = mvs.length;
  var rnd = random(len) - 1;
  return mvs[rnd];
}

function random(n) {
  try {
    return Math.floor((Math.random() * n) + 1);
  } catch ( e ) { debug("Error: " + this + e.description); } 
}

function get_free_cells() {
  var frees = new Array();
  
  for (var i in board) {
    if (i > 0 && cell_is_free(i))
      frees.push(i);
  }
  return frees;
}

function get_free_sides() {
  var frees = new Array();
  var sides = [2,4,6,8];

  for (var i in sides) {
    if (cell_is_free(sides[i]))
      frees.push(sides[i]);
  }
  return frees;
}

function get_free_corner() {
  var frees = new Array();
  var corners = [1,3,7,9];

  for (var i in corners) {
    if (cell_is_free(corners[i]))
      frees.push(corners[i]);
  }
  return frees;
}

function cell_is_free(i) {
    if (board[i] == "X" || board[i] == "O") return false;
    return true;
}

function valid_move(id) {
    if (cell_is_free(id) == false) {
	debug("Invalid move, try another cell");
	return false;
    }
    return true;
}

function set_cell(n, player) {
    if (player == "X") {
	board[n] = "X";
    } else {
	board[n] = "O";
    }
}

Bangle.on('touch', function(zone,e) {
  x = Object.values(e)[0];
  y = Object.values(e)[1];

  if (game_state == GAME_OVER) {
    new_game();
    return;
  }

  get_move();
});


new_game();
