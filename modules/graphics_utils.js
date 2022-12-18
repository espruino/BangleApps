// draw an arc between radii minR and maxR, and between angles minAngle and maxAngle
exports.drawArc = function(graphics, minR, maxR, minAngle, maxAngle) {
  var step = stepAngle;
  var angle = minAngle;
  var inside = [];
  var outside = [];
  var c, s;
  while (angle < maxAngle) {
    c = Math.cos(angle);
    s = Math.sin(angle);
    inside.push(centreX+c*minR); // x
    inside.push(centreY+s*minR); // y
    // outside coordinates are built up in reverse order
    outside.unshift(centreY+s*maxR); // y
    outside.unshift(centreX+c*maxR); // x
    angle += step;
  }
  c = Math.cos(maxAngle);
  s = Math.sin(maxAngle);
  inside.push(centreX+c*minR);
  inside.push(centreY+s*minR);
  outside.unshift(centreY+s*maxR);
  outside.unshift(centreX+c*maxR);
  
  var vertices = inside.concat(outside);
  graphics.fillPoly(vertices, true);
}