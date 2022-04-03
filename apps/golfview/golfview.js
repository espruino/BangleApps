let course = require("Storage").readJSON("course_data(3).json");
let hole = course;
function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

function drawHole(l) {

  console.log(l);
  let hole_straight_distance = distance(
    hole.nodesXY[0],
    hole.nodesXY[hole.nodesXY.length - 1]
  );

  let scale = 0.9 * l.h / hole_straight_distance;

  let transform = {
    x: l.x + l.w / 2, // x offset (default 0)
    y: l.h * 0.95, // y offset (default 0)
    scale: scale, // scale factor (default 1)
    rotate: hole.angle - Math.PI / 2.0, // angle in radians (default 0)
  }

  for (var feature of hole.features) {
    //console.log(Object.keys(feature));
    if (feature.type === "fairway") {
      g.setColor(0, 0, 1);
    } else if (feature.type === "tee") {
      g.setColor(1, 0, 0);
    } else if (feature.type === "green") {
      g.setColor(0, 1, 0);
    } else if (feature.type === "bunker") {
      g.setColor(1, 1, 0);
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
  g.setColor(0, 1, 1);
  g.drawPoly(newnodelist);
}

// The layout, referencing the custom renderer
var Layout = require("Layout");
var layout = new Layout({
  type: "h", c: [
    {
      type: "v", c: [
        { type: "txt", font: "10%", label: "Hole 1" },
        { type: "txt", font: "10%", label: "Par 4" },
        { type: "txt", font: "10%", label: "Hcp 15" },
        { type: "txt", font: "35%", label: "420" },
        { type: "txt", font: "20%", label: "69" },
      ]
    },
    { type: "custom", render: drawHole, id: "graph", bgCol: g.theme.bg, fillx: 1, filly: 1 }
  ]
});

console.log(g.getWidth());
console.log(g.getHeight());

g.clear();
layout.render();
layout.debug();