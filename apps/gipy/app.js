
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
    this.points_number = (buffer.byteLength - 2*8)/4;
    this.view = DataView(buffer);
    this.min_lon = this.view.getFloat64(0);
    this.min_lat = this.view.getFloat64(8);
    this.current_start = 0; // index of first point to be displayed
    this.current_x = 0;
    this.current_y = 0;
  }

  get len() {
    return this.points_number;
  }
}

class Point {
  constructor(lon, lat) {
    this.lon = lon;
    this.lat = lat;
  }
  screen_x() {
    return 192/2 + Math.round((this.lon - lon) * 100000.0);
  }
  screen_y() {
    return 192/2 + Math.round((this.lat - lat) * 100000.0);
  }
}

function display(path) {
  g.clear();
  let previous_point = null;
  let current_x = path.current_x;
  let current_y = path.current_y;
  for (let i = path.current_start ; i < path.len ; i++) {
    current_x += path.view.getInt16(2*8+4*i);
    current_y += path.view.getInt16(2*8+4*i+2);
    let point = new Point(current_x/100000.0 + path.min_lon, current_y/100000.0 + path.min_lat);

    if (previous_point !== null) {
      g.drawLine(
        previous_point.screen_x(),
        previous_point.screen_y(),
        point.screen_x(),
        point.screen_y()
      );
    }
    previous_point = point;
  }
  g.setColor(1.0, 0.0, 0.0);
  g.fillCircle(192/2, 192/2, 5);
}

let path = new Path("test.gpc");
lat = path.min_lat;
lon = path.min_lon;

function set_coordinates(data) {
  if (!isNaN(data.lat)) {
    lat = data.lat;
  }
  if (!isNaN(data.lon)) {
    lon = data.lon;
  }
}

Bangle.setGPSPower(true, "gipy");
Bangle.on('GPS', set_coordinates);

setInterval(display, 1000, path);

