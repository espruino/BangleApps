let course = require("Storage").readJSON("course_data(3).json");

console.log(Object.keys(course));

g.setBgColor(0, 0, 0);
g.clear();

for (var feature of course.features) {
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
  newnodelist = g.transformVertices(nodelist, {
    x: 150, // x offset (default 0)
    y: 150, // y offset (default 0)
    scale: 0.45, // scale factor (default 1)
    rotate: course.angle - Math.PI / 2.0, // angle in radians (default 0)
  });

  g.fillPoly(newnodelist, true);
  console.log(feature.type);
  console.log(newnodelist);
}

var nodelist = [];
course.nodesXY.forEach(function (node) {
  nodelist.push(node.x);
  nodelist.push(node.y);
});

newnodelist = g.transformVertices(nodelist, {
  x: 150, // x offset (default 0)
  y: 150, // y offset (default 0)
  scale: 0.45, // scale factor (default 1)
  rotate: course.angle - Math.PI / 2.0, // angle in radians (default 0)
});
g.setColor(0, 1, 1);
g.drawPoly(newnodelist);