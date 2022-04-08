let course = require("Storage").readJSON("golfcourse-Davis.json").holes;//TODO use the course ID
let current_hole = 1;
let hole = course[current_hole.toString()];

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
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

  // draw the fairways first
  hole.features.sort((a, b) => {
    if (a.type === "fairway") {
      return -1;
    }
  })

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
    newnodelist = g.transformVertices(nodelist, transform);

    g.fillPoly(newnodelist, true);
    //console.log(feature.type);
    //console.log(newnodelist);
  }

  var waynodelist = [];
  hole.nodesXY.forEach(function (node) {
    waynodelist.push(node.x);
    waynodelist.push(node.y);
  });

  newnodelist = g.transformVertices(waynodelist, transform);
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
// The layout, referencing the custom renderer
var Layout = require("Layout");
var layout = new Layout({
  type: "h", c: [
    {
      type: "v", c: [
        { type: "txt", font: "10%", id: "hole", label: "HOLE 18" },
        { type: "txt", font: "10%", id: "par", label: "PAR 4" },
        { type: "txt", font: "10%", id: "hcp", label: "HCP 18" },
        { type: "txt", font: "35%", id: "postyardage", label: "000" },
        { type: "txt", font: "20%", id: "measyardage", label: "000" },
      ]
    },
    { type: "custom", render: drawHole, id: "graph", bgCol: g.theme.bg, fillx: 1, filly: 1 }
  ],
  lazy: true
});

setHole(current_hole);
//layout.debug();

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