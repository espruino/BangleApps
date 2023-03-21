// draw an arc between radii minR and maxR, and between angles minAngle and maxAngle centered at X,Y. All angles are radians.
exports.fillArc = function(graphics, X, Y, minR, maxR, minAngle, maxAngle, stepAngle) {
  var step = stepAngle || 0.21;
  var angle = minAngle;
  var inside = [];
  var outside = [];
  var c, s;
  while (angle < maxAngle) {
    c = Math.cos(angle);
    s = Math.sin(angle);
    inside.push(X+c*minR); // x
    inside.push(Y+s*minR); // y
    // outside coordinates are built up in reverse order
    outside.unshift(Y+s*maxR); // y
    outside.unshift(X+c*maxR); // x
    angle += step;
  }
  c = Math.cos(maxAngle);
  s = Math.sin(maxAngle);
  inside.push(X+c*minR);
  inside.push(Y+s*minR);
  outside.unshift(Y+s*maxR);
  outside.unshift(X+c*maxR);

  var vertices = inside.concat(outside);
  graphics.fillPoly(vertices, true);
}

exports.degreesToRadians = function(degrees){
  return Math.PI/180 * degrees;
}

exports.radiansToDegrees = function(radians){
  return 180/Math.PI * radians;
}