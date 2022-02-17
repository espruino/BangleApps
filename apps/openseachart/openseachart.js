/* OpenStreetMap plotting module.

Usage:

var m = require("openseachart");
// m.lat/lon are now the center of the loaded map
m.draw(); // draw centered on the middle of the loaded map

// plot gps position on map
Bangle.on('GPS',function(f) {
  if (!f.fix) return;
  var p = m.latLonToXY(fix.lat, fix.lon);
  g.fillRect(p.x-2, p.y-2, p.x+2, p.y+2);
});

// recenter and redraw map!
function center() {
  m.lat = fix.lat;
  m.lon = fix.lon;
  m.draw();
}

*/

var map = require("Storage").readJSON("openseachart.json");
map.center = {lat:map.lat, lon:map.lon}; // save original center
exports.map = map;
exports.lat = map.lat; // actual position of middle of screen
exports.lon = map.lon;  // actual position of middle of screen
var m = exports;

exports.draw = function() {
  var s = require("Storage");
  var cx = g.getWidth()/2;
  var cy = g.getHeight()/2;
  var ix = (m.lon-map.center.lon)/map.dlonpx + (map.imgx/2) - cx;
  var iy = (map.center.lat-m.lat)/map.dlatpx + (map.imgy/2) - cy;
  //console.log(ix,iy);
  var tx = 0|(ix/map.tilesize);
  var ty = 0|(iy/map.tilesize);
  var ox = (tx*map.tilesize)-ix;
  var oy = (ty*map.tilesize)-iy;
  for (var x=ox,ttx=tx;x<g.getWidth();x+=map.tilesize,ttx++) {
    for (var y=oy,tty=ty;y<g.getHeight();y+=map.tilesize,tty++) {
      var img = s.read("openseamap-"+ttx+"-"+tty+".img");
      if (img) g.drawImage(img,x,y);
      else g.clearRect(x,y,x+map.tilesize-1,y+map.tilesize-1).drawLine(x,y,x+map.tilesize-1,y+map.tilesize-1).drawLine(x,y+map.tilesize-1,x+map.tilesize-1,y);
    }
  }
};

/// Convert lat/lon to pixels on the screen
exports.latLonToXY = function(lat, lon) {
  var cx = g.getWidth()/2;
  var cy = g.getHeight()/2;
  return {
    x : cx + (lon-m.lon)/map.dlonpx,
    y : cy - (lat-m.lat)/map.dlatpx
  };
};

/// Given an amount to scroll in pixels on the screen, adjust the lat/lon of the map to match
exports.scroll = function(x,y) {
  this.lon -= x * this.map.dlonpx;
  this.lat += y * this.map.dlatpx;
//  console.log(this.lon, this.lat);
};
