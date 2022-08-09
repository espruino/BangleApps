/* OpenStreetMap plotting module.

Usage:

var m = require("openstmap");
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

var map = require("Storage").readJSON("openstmap.0.json");
map.center = Bangle.project({lat:map.lat,lon:map.lon});
exports.map = map;
exports.lat = map.lat; // actual position of middle of screen
exports.lon = map.lon;  // actual position of middle of screen
var m = exports;

exports.draw = function() {
  var img = require("Storage").read(map.fn);
  var cx = g.getWidth()/2;
  var cy = g.getHeight()/2;
  var p = Bangle.project({lat:m.lat,lon:m.lon});
  var ix = (p.x-map.center.x)/map.scale + (map.imgx/2) - cx;
  var iy = (map.center.y-p.y)/map.scale + (map.imgy/2) - cy;
  //console.log(ix,iy);
  var tx = 0|(ix/map.tilesize);
  var ty = 0|(iy/map.tilesize);
  var ox = (tx*map.tilesize)-ix;
  var oy = (ty*map.tilesize)-iy;
  for (var x=ox,ttx=tx;x<g.getWidth();x+=map.tilesize,ttx++)
    for (var y=oy,tty=ty;y<g.getHeight();y+=map.tilesize,tty++) {
      if (ttx>=0 && ttx<map.w && tty>=0 && tty<map.h) g.drawImage(img,x,y,{frame:ttx+(tty*map.w)});
      else g.clearRect(x,y,x+map.tilesize-1,y+map.tilesize-1).drawLine(x,y,x+map.tilesize-1,y+map.tilesize-1).drawLine(x,y+map.tilesize-1,x+map.tilesize-1,y);
    }
};

/// Convert lat/lon to pixels on the screen
exports.latLonToXY = function(lat, lon) {
  var p = Bangle.project({lat:m.lat,lon:m.lon});
  var q = Bangle.project({lat:lat, lon:lon});
  var cx = g.getWidth()/2;
  var cy = g.getHeight()/2;
  return {
    x : (q.x-p.x)/map.scale + cx,
    y : cy - (q.y-p.y)/map.scale
  };
};

/// Given an amount to scroll in pixels on the screen, adjust the lat/lon of the map to match
exports.scroll = function(x,y) {
  var a = Bangle.project({lat:this.lat,lon:this.lon});
  var b = Bangle.project({lat:this.lat+1,lon:this.lon+1});
  this.lon += x * this.map.scale / (a.x-b.x);
  this.lat -= y * this.map.scale / (a.y-b.y);
};
