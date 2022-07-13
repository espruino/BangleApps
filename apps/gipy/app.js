
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

class Path {
  constructor(filename) {
    let buffer = require("Storage").readArrayBuffer(filename);
    this.points = Float64Array(buffer);
    let total_distance = 0.0;
    this.on_segments(function (p1, p2, i) {
      total_distance += p1.distance(p2);
    }, 0, this.len-1);
    this.total_distance = total_distance;
  }

  // start is index of first wanted segment
  // end is 1 after index of last wanted segment
  on_segments(op, start, end) {
      let previous_point = null;
      for(let i = start ; i < end + 1 ; i++) {
          let point = new Point(this.points[2*i], this.points[2*i+1]);
          if (previous_point !== null) {
              op(previous_point, point, i);
          }
          previous_point = point;
      }
  }

  point(index) {
    let lon = this.points[2*index];
    let lat = this.points[2*index+1];
    return new Point(lon, lat);
  }

  // return index of segment which is nearest from point
  nearest_segment(point, start, end) {
    let min_index = 0;
    let min_distance = Number.MAX_VALUE;
    this.on_segments(function (p1, p2, i) {
      let distance = point.fake_distance_to_segment(p1, p2);
        if (distance <= min_distance) {
          min_distance = distance;
          min_index = i-1;
        }
    }, start, end);
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
      //see https://www.movable-type.co.uk/scripts/latlong.html
      const R = 6371e3; // metres
      const phi1 = this.lat * Math.PI/180;
      const phi2 = other_point.lat * Math.PI/180;
      const deltaphi = (other_point.lat-this.lat) * Math.PI/180;
      const deltalambda = (other_point.lon-this.lon) * Math.PI/180;

      const a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // in metres
  }
  fake_distance(other_point) {
    return Math.sqrt(this.length_squared(other_point));
  }
  fake_distance_to_segment(v, w) {
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
      return this.fake_distance(projection);
  }
}

function display(path) {
  g.clear();
  g.setColor(g.theme.fg);
  // let next_segment = path.nearest_segment(new Point(lon, lat), current_segment-2, current_segment+3);
  current_segment = path.nearest_segment(new Point(lon, lat), 0, path.len-1);
  let start = Math.max(current_segment - 5, 0);
  let end = Math.min(current_segment + 7, path.len-1);
  path.on_segments(function(p1, p2, i) {
    let px = p2.screen_x();
    let py = p2.screen_y();
    if (i == current_segment + 1) {
      g.setColor(0.0, 1.0, 0.0);
    } else {
      g.setColor(1.0, 0.0, 0.0);
    }
    g.drawLine(
      p1.screen_x(),
      p1.screen_y(),
      px,
      py
    );
    g.setColor(g.theme.fg);
    g.fillCircle(px, py, 4);
    g.setColor(g.theme.bg);
    g.fillCircle(px, py, 3);
  }, 0, path.len-1);

  g.setColor(g.theme.fgH);
  g.fillCircle(172/2, 172/2, 5);
  g.setFont("6x8:2").drawString(("distance "+(Math.round(path.total_distance/100)/10))+" km",0,30);
  Bangle.drawWidgets();
}

Bangle.loadWidgets();
let path = new Path("test.gpc");
var current_segment = path.nearest_segment(new Point(lon, lat), 0, path.len-1);


let fake_gps_point = 0.0;
function simulate_gps(path) {
  let point_index = Math.floor(fake_gps_point);
  if (point_index >= path.len) {
    return;
  }
  let p1 = path.point(point_index);
  let p2 = path.point(point_index+1);
  let alpha = fake_gps_point - point_index;

  lon = (1-alpha)*p1.lon + alpha*p2.lon;
  lat = (1-alpha)*p1.lat + alpha*p2.lat;
  fake_gps_point += 0.2;
  display(path);
}

setInterval(simulate_gps, 500, path);


// function set_coordinates(data) {
//   let old_lat = lat;
//   if (!isNaN(data.lat)) {
//     lat = data.lat;
//   }
//   let old_lon = lon;
//   if (!isNaN(data.lon)) {
//     lon = data.lon;
//   }
//   if ((old_lat != lat)||(old_lon != lon)) {
//     display(path);
//   }
// }
// Bangle.setGPSPower(true, "gipy");
// Bangle.on('GPS', set_coordinates);


