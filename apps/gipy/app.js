
// screen size is 172x172
// we want to show 100 meters ahead
// 86 pixels is 100 meters
// 10 meters is 8.6 pixels
// 1 integer unit is 1.1 meter
// 8.6 pixels is 10 / 1.1 integers
// int = 8.6 pix * 1.1 / 10
// int = 0.946 pixels

var lat = null;
var lon = null;
var refresh_needed = false;

class Path {
  constructor(filename) {
    let buffer = require("Storage").readArrayBuffer(filename);
    this.points = Float64Array(buffer);
  }
  
  point(index) {
    let lon = this.points[2*index];
    let lat = this.points[2*index+1];
    return new Point(lon, lat);
  }
  
  // return index of segment which is nearest from point
  nearest_segment(point, start, end) {
    let previous_point = null;
    let min_index = 0;
    let min_distance = Number.MAX_VALUE;
    for(let i = Math.max(0, start) ; i < Math.min(this.len, end) ; i++) {
      let current_point = this.point(i);
      if (previous_point !== null) {
        let distance = point.distance_to_segment(previous_point, current_point);
        if (distance <= min_distance) {
          min_distance = distance;
          min_index = i-1;
        }
      }
      previous_point = current_point;
    }
    return min_index;
  }
  get len() {
    return this.points.length /2;
  }
}

class Point {
  constructor(lon, lat) {
    this.lon = lon;
    this.lat = lat;
  }
  screen_x() {
    return 172/2 + Math.round((this.lon - lon) * 20000.0);
  }
  screen_y() {
    return 172/2 + Math.round((this.lat - lat) * 20000.0);
  }
  minus(other_point) {
    let xdiff = this.lon - other_point.lon;
    let ydiff = this.lat - other_point.lat;
    return new Point(xdiff, ydiff);
  }
  plus(other_point) {
    return new Point(this.lon + other_point.lon, this.lat + other_point.lat);
  }
  length_squared(other_point) {
    let d = this.minus(other_point);
    return (d.lon*d.lon + d.lat*d.lat);
  }
  times(scalar) {
    return new Point(this.lon * scalar, this.lat * scalar);
  }
  dot(other_point) {
    return this.lon * other_point.lon + this.lat * other_point.lat;
  }
  distance(other_point) {
    return Math.sqrt(this.length_squared(other_point));
  }
  distance_to_segment(v, w) {
      // from : https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
      // Return minimum distance between line segment vw and point p
      let l2 = v.length_squared(w);  // i.e. |w-v|^2 -  avoid a sqrt
      if (l2 == 0.0) {
        return this.distance(v);   // v == w case
      }
      // Consider the line extending the segment, parameterized as v + t (w - v).
      // We find projection of point p onto the line. 
      // It falls where t = [(p-v) . (w-v)] / |w-v|^2
      // We clamp t from [0,1] to handle points outside the segment vw.
      let t = Math.max(0, Math.min(1, (this.minus(v)).dot(w.minus(v)) / l2));
      let projection = v.plus((w.minus(v)).times(t));  // Projection falls on the segment
      return this.distance(projection);
  }
}

function display(path) {
  if (!refresh_needed) {
    return;
  }
  refresh_needed = false;
  g.clear();
  g.setColor(g.theme.fg);
  // let next_segment = path.nearest_segment(new Point(lon, lat), current_segment-2, current_segment+3);
  current_segment = path.nearest_segment(new Point(lon, lat), 0, path.len);
  let previous_point = null;
  let start = Math.max(current_segment - 5, 0);
  let end = Math.min(current_segment + 7, path.len);
  for (let i=start ; i < end ; i++) {
    let point = path.point(i);

    let px = point.screen_x();
    let py = point.screen_y();
    if (previous_point !== null) {
      if (i == current_segment + 1) {
        g.setColor(0.0, 1.0, 0.0);
      } else {
        g.setColor(1.0, 0.0, 0.0);
      }
      g.drawLine(
        previous_point.screen_x(),
        previous_point.screen_y(),
        px,
        py
      );
    }
    g.setColor(g.theme.fg2);
    g.fillCircle(px, py, 4);
    g.setColor(g.theme.fg);
    g.fillCircle(px, py, 3);
    previous_point = point;
  }
  g.setColor(g.theme.fgH);
  g.fillCircle(172/2, 172/2, 5);
  Bangle.drawWidgets();
}

Bangle.loadWidgets()
let path = new Path("test.gpc");
lat = path.min_lat;
lon = path.min_lon;
var current_segment = path.nearest_segment(new Point(lon, lat), 0, Number.MAX_VALUE);


// let fake_gps_point = 0.0;
// function simulate_gps(path) {
//   let point_index = Math.floor(fake_gps_point);
//   if (point_index >= path.len) {
//     return;
//   }
//   let p1 = path.point(point_index);
//   let p2 = path.point(point_index+1);
//   let alpha = fake_gps_point - point_index;

//   lon = (1-alpha)*p1.lon + alpha*p2.lon;
//   lat = (1-alpha)*p1.lat + alpha*p2.lat;
//   fake_gps_point += 0.2;
//   display(path);
// }

// setInterval(simulate_gps, 500, path);


function set_coordinates(data) {
  let old_lat = lat;
  if (!isNaN(data.lat)) {
    lat = data.lat;
  }
  let old_lon = lon;
  if (!isNaN(data.lon)) {
    lon = data.lon;
  }
  if ((old_lat != lat)||(old_lon != lon)) {
    refresh_needed = true;
  }
}
Bangle.setGPSPower(true, "gipy");
Bangle.on('GPS', set_coordinates);


setInterval(display, 1000, path);

