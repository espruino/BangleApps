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

// you can even change the scale - eg 'm/scale *= 2'

*/

var m = exports;
m.maps = require("Storage").list(/openstmap\.\d+\.json/).map(f=>{
  let map = require("Storage").readJSON(f);
  map.center = Bangle.project({lat:map.lat,lon:map.lon});
  return map;
});
m.maps.sort((a,b) => b.scale-a.scale); // sort by scale so highest resolution is drawn last
// we base our start position on the middle of the first map
m.map = m.maps[0];
if (m.map) {
  m.scale = m.map.scale; // current scale (based on first map)
  m.lat = m.map.lat; // position of middle of screen
  m.lon = m.map.lon;  // position of middle of screen
}

// return number of tiles drawn
exports.draw = function() {
  var cx = g.getWidth()/2;
  var cy = g.getHeight()/2;
  var p = Bangle.project({lat:m.lat,lon:m.lon});
  let count = 0;
  m.maps.forEach((map,idx) => {
    var d = map.scale/m.scale;
    var ix = (p.x-map.center.x)/m.scale + (map.imgx*d/2) - cx;
    var iy = (map.center.y-p.y)/m.scale + (map.imgy*d/2) - cy;
    var o = {};
    var s = map.tilesize;
    if (d!=1) { // if the two are different, add scaling
      s *= d;
      o.scale = d;
      o.filter = true; // on 2v19+ enables supersampling
    }
    //console.log(ix,iy);
    var tx = 0|(ix/s);
    var ty = 0|(iy/s);
    var ox = (tx*s)-ix;
    var oy = (ty*s)-iy;
    var img = require("Storage").read(map.fn);
    // fix out of range so we don't have to iterate over them
    if (tx<0) {
      ox+=s*-tx;
      tx=0;
    }
    if (ty<0) {
      oy+=s*-ty;
      ty=0;
    }
    var mx = g.getWidth();
    var my = g.getHeight();
    for (var x=ox,ttx=tx; x<mx && ttx<map.w; x+=s,ttx++) {
      for (var y=oy,tty=ty;y<my && tty<map.h;y+=s,tty++) {
        o.frame = ttx+(tty*map.w);
        g.drawImage(img,x,y,o);
        count++;
      }
    }
  });
  return count;
};

/// Convert lat/lon to pixels on the screen
exports.latLonToXY = function(lat, lon) {
  var p = Bangle.project({lat:m.lat,lon:m.lon});
  var q = Bangle.project({lat:lat, lon:lon});
  var cx = g.getWidth()/2;
  var cy = g.getHeight()/2;
  return {
    x : (q.x-p.x)/m.scale + cx,
    y : cy - (q.y-p.y)/m.scale
  };
};

/// Given an amount to scroll in pixels on the screen, adjust the lat/lon of the map to match
exports.scroll = function(x,y) {
  var a = Bangle.project({lat:m.lat,lon:m.lon});
  var b = Bangle.project({lat:m.lat+1,lon:m.lon+1});
  this.lon += x * m.scale / (a.x-b.x);
  this.lat -= y * m.scale / (a.y-b.y);
};
