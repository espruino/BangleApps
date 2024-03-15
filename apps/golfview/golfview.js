// maptools.js
const EARTHRADIUS = 6371000; //km

function radians(a) {
  return a * Math.PI / 180;
}

function degrees(a) {
  let d = a * 180 / Math.PI;
  return (d + 360) % 360;
}

function toXY(a, origin) {
  let pt = {
    x: 0,
    y: 0
  };

  pt.x = EARTHRADIUS * radians(a.lon - origin.lon) * Math.cos(radians((a.lat + origin.lat) / 2));
  pt.y = EARTHRADIUS * radians(origin.lat - a.lat);
  return pt;
}

function arraytoXY(array, origin) {
  let out = [];
  for (var j in array) {
    let newpt = toXY(array[j], origin);
    out.push(newpt);
  }
  return out;
}

function angle(a, b) {
  let x = b.x - a.x;
  let y = b.y - a.y;
  return Math.atan2(-y, x);
}

function rotateVec(a, theta) {
  let pt = {
    x: 0,
    y: 0
  };
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  pt.x = c * a.x - s * a.y;
  pt.y = s * a.x + c * a.y;
  return pt;
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}


// golfview.js
let courselist = require("Storage").list(/^golf-\d+\.json$/);
let course = require("Storage").readJSON(courselist[0]).holes; // TODO use the first course for now

let current_hole = 1;
let hole = course[current_hole.toString()];
let user_position = {
  fix: false,
  lat: 0,
  lon: 0,
  x: 0,
  y: 0,
  to_hole: 0,
  last_time: getTime(),
  transform: {},
};

function drawUser() {
  if(!user_position.fix) return;
  let new_pos = g.transformVertices([user_position.x,user_position.y],user_position.transform);
  g.setColor(g.theme.fg);
  g.drawCircle(new_pos[0],new_pos[1],8);
}

function drawHole(l) {

  //console.log(l);
  let hole_straight_distance = distance(
    hole.nodesXY[0],
    hole.nodesXY[hole.nodesXY.length - 1]
  );

  let scale = 0.9 * l.h / hole_straight_distance;

  let transform = {
    x: l.x + l.w / 2, // center in the box
    y: l.h * 0.95, // pad it just a bit TODO use the extent of the teeboxes/green
    scale: scale, // scale factor (default 1)
    rotate: hole.angle - Math.PI / 2.0, // angle in radians (default 0)
  };

  user_position.transform = transform;

  // draw the fairways first
  hole.features.sort((a, b) => {
    if (a.type === "fairway") {
      return -1;
    }
  });

  for (var feature of hole.features) {
    //console.log(Object.keys(feature));
    if (feature.type === "fairway") {
      g.setColor(1, 0, 1); // magenta
    } else if (feature.type === "tee") {
      g.setColor(1, 0, 0); // red
    } else if (feature.type === "green") {
      g.setColor(0, 1, 0); // green
    } else if (feature.type === "bunker") {
      g.setColor(1, 1, 0); // yellow
    } else if (feature.type === "water_hazard") {
      g.setColor(0, 0, 1); // blue
    } else {
      continue;
    }

    var nodelist = [];
    feature.nodesXY.forEach(function (node) {
      nodelist.push(node.x);
      nodelist.push(node.y);
    });
    const newnodelist = g.transformVertices(nodelist, transform);

    g.fillPoly(newnodelist, true);
    //console.log(feature.type);
    //console.log(newnodelist);

    drawUser();
  }

  var waynodelist = [];
  hole.nodesXY.forEach(function (node) {
    waynodelist.push(node.x);
    waynodelist.push(node.y);
  });

  const newnodelist = g.transformVertices(waynodelist, transform);
  g.setColor(0, 1, 1); // cyan
  g.drawPoly(newnodelist);
}

function setHole(current_hole) {
  layout.hole.label = "HOLE " + current_hole;
  layout.par.label = "PAR " + course[current_hole.toString()].par;
  layout.hcp.label = "HCP " + course[current_hole.toString()].handicap;
  layout.postyardage.label = course[current_hole.toString()].tees[course[current_hole.toString()].tees.length - 1]; //TODO only use longest hole for now

  g.clear();
  layout.render();
}

function updateDistanceToHole() {
  let xy = toXY({ "lat": user_position.lat, "lon": user_position.lon }, hole.way[0]);
  user_position.x = xy.x;
  user_position.y = xy.y;
  user_position.last_time = getTime();
  let new_distance = Math.round(distance(xy, hole.nodesXY[hole.nodesXY.length - 1]) * 1.093613); //TODO meters later
  //console.log(new_distance);
  layout.measyardage.label = (new_distance < 999) ? new_distance : "---";

  g.clear();
  layout.render();
}

Bangle.on('swipe', function (direction) {
  if (direction > 0) {
    current_hole--;
  } else {
    current_hole++;
  }

  if (current_hole > 18) { current_hole = 1; }
  if (current_hole < 1) { current_hole = 18; }
  hole = course[current_hole.toString()];

  setHole(current_hole);
});

Bangle.on('GPS', (fix) => {
  if (isNaN(fix.lat)) return;
  //console.log(fix.hdop * 5); //precision
  user_position.fix = true;
  user_position.lat = fix.lat;
  user_position.lon = fix.lon;
  updateDistanceToHole();
  drawUser();
});

// The layout, referencing the custom renderer
var Layout = require("Layout");
var layout = new Layout({
  type: "h", c: [
    {
      type: "v", c: [
        { type: "txt", font: "10%", id: "hole", label: "HOLE 18" },
        { type: "txt", font: "10%", id: "par", label: "PAR 4" },
        { type: "txt", font: "10%", id: "hcp", label: "HCP 18" },
        { type: "txt", font: "35%", id: "postyardage", label: "---" },
        { type: "txt", font: "20%", id: "measyardage", label: "---" },
      ]
    },
    { type: "custom", render: drawHole, id: "graph", bgCol: g.theme.bg, fillx: 1, filly: 1 }
  ],
  lazy: true
});

Bangle.setGPSPower(1);
setHole(current_hole);
//layout.debug();
