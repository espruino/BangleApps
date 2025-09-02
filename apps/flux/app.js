const font = {
  "0": [
    [[0,0],[1,0]],
    [[1,0],[1,1]],
    [[1,1],[0,1]],
    [[0,1],[0,0]]
  ],

  "1": [
    [[1,0],[1,1]]
  ],

  "2": [
    [[0,0],[1,0]],
    [[1,0],[1,0.5]],
    [[1,0.5],[0,0.5]],
    [[0,0.5],[0,1]],
    [[0,1],[1,1]]
  ],

  "3": [
    [[0,0],[1,0]],
    [[1,0],[1,1]],
    [[0,0.5],[1,0.5]],
    [[0,1],[1,1]]
  ],

  "4": [
    [[0,0],[0,0.5]],
    [[1,0],[1,1]],
    [[0,0.5],[1,0.5]]
  ],

  "5": [
    [[1,0],[0,0]],
    [[0,0],[0,0.5]],
    [[0,0.5],[1,0.5]],
    [[1,0.5],[1,1]],
    [[1,1],[0,1]]
  ],

  "6": [
    [[1,0],[0,0]],
    [[0,0],[0,1]],
    [[0,1],[1,1]],
    [[1,1],[1,0.5]],
    [[1,0.5],[0,0.5]]
  ],

  "7": [
    [[0,0],[1,0]],
    [[1,0],[1,1]]
  ],

  "8": [
    [[0,0],[1,0]],
    [[1,0],[1,1]],
    [[1,1],[0,1]],
    [[0,1],[0,0]],
    [[0,0.5],[1,0.5]]
  ],

  "9": [
    [[0,0],[1,0]],
    [[0,0],[0,0.5]],
    [[0,0.5],[1,0.5]],
    [[1,0],[1,1]]
  ],

  "NaN": [
    [[],[]]
  ]
};

const corner_base_positions = [
  [[10, 10],   [78, 78]],    // top-left (unchanged)
  [[93, 10],   [165, 78]],   // top-right (x + 5)
  [[10, 93],   [78, 165]],   // bottom-left (y + 5)
  [[93, 93],   [165, 165]]   // bottom-right (x + 5, y + 5)
];

let corner_positions = [];
let previous_corner_positions = [];

const padding = 10;
const width = 175;
const height = 175;

const colors = {
  "Black": [0,0,0],
  "White": [1,1,1],
  "Red": [1,0,0],
  "Blue": [0,0,1],
  "Green": [0,1,0],
  "Yellow": [1,1,0],
  "Orange": [1,0.6,0],
  "Purple": [0.7,0,1],
  "Lime": [0,1,0.5],
  "Cyan": [0, 1, 1],
  "Light Blue": [0,0.5,1],
  "Pink": [1,0.5,1]
};

let bg_color = [0,0,0];
let fg_color = [1,1,1];
let bg_color_topo = [1,0,0.5];
let fg_color_topo = [0,1,0.5];

function randomize_numbers(){
  previous_corner_positions = JSON.parse(JSON.stringify(corner_positions));
  corner_positions = JSON.parse(JSON.stringify(corner_base_positions));

  if (!previous_corner_positions || previous_corner_positions.length === 0) {
    previous_corner_positions = JSON.parse(JSON.stringify(corner_positions));
  }

  // Your offsets and modifications follow here as before
  let x_offset = Math.floor(Math.random() * 61) - 30;
  let left_y_offset = Math.floor(Math.random() * 61) - 30;
  let right_y_offset = Math.floor(Math.random() * 61) - 30;

  [0,1,2,3].forEach(function(i) {
    let min_x = corner_positions[i][0][0];
    let min_y = corner_positions[i][0][1];
    let max_x = corner_positions[i][1][0];
    let max_y = corner_positions[i][1][1];

    if (min_x !== padding) {
      min_x += x_offset;
    }
    if (max_x !== width - padding) {
      max_x += x_offset;
    }

    let yoff = (i % 2) > 0 ? right_y_offset : left_y_offset;

    if (min_y !== padding) {
      min_y += yoff;
    }
    if (max_y !== height - padding) {
      max_y += yoff;
    }

    // Update corner_positions with new offsets
    corner_positions[i][0][0] = min_x;
    corner_positions[i][0][1] = max_x;
    corner_positions[i][1][0] = min_y;
    corner_positions[i][1][1] = max_y;
  });
}

function drawThickLine(x1, y1, x2, y2, width, topoY) {
  let half = Math.floor(width / 2);

  // Expand to thickness by offsetting both ends
  if (x1 === x2) {
    // Vertical line
    x1 -= half;
    x2 += half;
  } else if (y1 === y2) {
    // Horizontal line
    y1 -= half;
    y2 += half;
  } else {
    // Diagonal fallback
    for (let i = -half; i <= half; i++) {
      g.drawLine(x1 + i, y1, x2 + i, y2);
    }
    return;
  }

  // Order the coordinates for fillRect
  let left   = Math.min(x1, x2);
  let right  = Math.max(x1, x2);
  let top    = Math.min(y1, y2);
  let bottom = Math.max(y1, y2);

  // Split based on topoY (topographic height)
  if (top < topoY && bottom > topoY) {
    // Split into two regions
    g.setColor(fg_color_topo[0], fg_color_topo[1], fg_color_topo[2]);
    g.fillRect(left, top, right, topoY);

    g.setColor(fg_color[0], fg_color[1], fg_color[2]);
    g.fillRect(left, topoY + 1, right, bottom);
  } else if (bottom <= topoY) {
    // Entire line is above topo
    g.setColor(fg_color_topo[0], fg_color_topo[1], fg_color_topo[2]);
    g.fillRect(left, top, right, bottom);
  } else {
    // Entire line is below topo
    g.setColor(fg_color[0], fg_color[1], fg_color[2]);
    g.fillRect(left, top, right, bottom);
  }
}




function draw_numbers(transition_value, topo_position){
  //console.log(previous_corner_positions);
  topo_position *= height;
  let d = new Date();

  let hour = d.getHours();
  let padded = ("0" + hour).slice(-2);

  let tl = padded[0];
  let tr = padded[1];

  let min = d.getMinutes();
  padded = ("0" + min).slice(-2);


  let bl = padded[0];
  let br = padded[1];

  g.clear();
  g.setColor(bg_color_topo[0],bg_color_topo[1],bg_color_topo[2]);
  g.fillRect(0,0,width,topo_position);
  g.setColor(bg_color[0],bg_color[1],bg_color[2]);
  g.fillRect(0,topo_position,width,height);

  [tl,tr,bl,br].forEach(function(corner, i) {
    let path = font[corner];
    path.forEach(function(line){
      let pcp = previous_corner_positions[i].slice();
      let ccp = corner_positions[i].slice();

      let x1 = (ccp[0][0] - pcp[0][0]) * transition_value + pcp[0][0];
      let x2 = (ccp[0][1] - pcp[0][1]) * transition_value + pcp[0][1];
      let y1 = (ccp[1][0] - pcp[1][0]) * transition_value + pcp[1][0];
      let y2 = (ccp[1][1] - pcp[1][1]) * transition_value + pcp[1][1];



      let point_1 = [line[0][0]*(x2-x1) + x1, line[0][1]*(y2-y1) + y1];
      let point_2 = [line[1][0]*(x2-x1) + x1, line[1][1]*(y2-y1) + y1];

      drawThickLine(point_1[0], point_1[1], point_2[0], point_2[1], 10, topo_position);
    });
  });
}

let powersaver = false;
let update_timeout = null;

let prev_min = -1;
function update_clock() {
  let d = new Date();
  let min = d.getMinutes();

  if (min != prev_min) {
    randomize_numbers();
    prev_min = min;
  }

  if (powersaver) {
    if (direction == 1) {
      draw_numbers(1, 2);
    }
    else if (direction == 0) {
      draw_numbers(1, 0);
    }
    update_timeout = setTimeout(update_clock, 5000);
  }
  else {
    let seconds = d.getSeconds() + d.getMilliseconds() / 1000;
    if (direction == 1) {
      draw_numbers(Math.min(seconds, 1) / 1, 1.00-(seconds/60));
    }
    else if (direction == 0) {
      draw_numbers(Math.min(seconds, 1) / 1, seconds / 60);
    }
    if (seconds < 1.5) {
      update_timeout = setTimeout(update_clock, 50);
    } else {
      update_timeout =   setTimeout(update_clock, 1000);
    }
  }
}

let settings = require("Storage").readJSON("flux.settings.json", 1) || {};
console.log(settings);
let direction = settings.direction || 0;
bg_color = colors[settings.bg || "Black"];
fg_color = colors[settings.fg || "White"];
bg_color_topo = colors[settings.bg2 || "Green"];
fg_color_topo = colors[settings.fg2 || "Black"];
if (direction == 1) {
  let temp = bg_color;
  bg_color = bg_color_topo;
  bg_color_topo = temp;

  temp = fg_color;
  fg_color = fg_color_topo;
  fg_color_topo = temp;
}


update_clock();

Bangle.on('backlight', function(isOn) {
  if (isOn) {
    powersaver = false;
    clearTimeout(update_timeout);
    update_clock();
  } else {
    powersaver = true;
    let d = new Date();
    let seconds = d.getSeconds() + d.getMilliseconds() / 1000;
    draw_numbers(Math.min(seconds, 1) / 1, 0);
  }
});

Bangle.setUI("clock");
