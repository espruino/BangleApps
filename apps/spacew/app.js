/* original openstmap.js */

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

var exports = {};
var m = exports;
m.maps = require("Storage").list(/openstmap\.\d+\.json/).map(f=>{
  let map = require("Storage").readJSON(f);
  map.center = Bangle.project({lat:map.lat,lon:map.lon});
  return map;
});
// we base our start position on the middle of the first map
if (m.maps[0] != undefined) {
  m.map = m.maps[0];
  m.scale = m.map.scale; // current scale (based on first map)
  m.lat = m.map.lat; // position of middle of screen
  m.lon = m.map.lon;  // position of middle of screen
} else {
  m.scale = 20;
  m.lat = 50;
  m.lon = 14;
}

exports.draw = function() {
  var cx = g.getWidth()/2;
  var cy = g.getHeight()/2;
  var p = Bangle.project({lat:m.lat,lon:m.lon});
  m.maps.forEach((map,idx) => {
    var d = map.scale/m.scale;
    var ix = (p.x-map.center.x)/m.scale + (map.imgx*d/2) - cx;
    var iy = (map.center.y-p.y)/m.scale + (map.imgy*d/2) - cy;
    var o = {};
    var s = map.tilesize;
    if (d!=1) { // if the two are different, add scaling
      s *= d;
      o.scale = d;
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
    for (var x=ox,ttx=tx; x<mx && ttx<map.w; x+=s,ttx++)
      for (var y=oy,tty=ty;y<my && tty<map.h;y+=s,tty++) {
        o.frame = ttx+(tty*map.w);
        g.drawImage(img,x,y,o);
      }
  });
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

/*
Copyright (c) 2011, Development Seed
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.
- Neither the name "Development Seed" nor the names of its contributors may be
  used to endorse or promote products derived from this software without
  specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

// Convert lon lat to screen pixel value
//
// - `ll` {Array} `[lon, lat]` array of geographic coordinates.
// - `zoom` {Number} zoom level.
function px(ll, zoom) {
    var size = 256 * Math.pow(2, zoom);
    var d = size / 2;
    var bc = (size / 360);
    var cc = (size / (2 * Math.PI));
    var ac = size;
    var D2R = Math.PI / 180;
    var f = Math.min(Math.max(Math.sin(D2R * ll[1]), -0.9999), 0.9999);
    var x = d + ll[0] * bc;
    var y = d + 0.5 * Math.log((1 + f) / (1 - f)) * -cc;
    var expansion = 1;
    (x > ac * expansion) && (x = ac * expansion);
    (y > ac) && (y = ac);
    //(x < 0) && (x = 0);
    //(y < 0) && (y = 0);
    return [x, y];
}

// Convert bbox to xyx bounds
//
// - `bbox` {Number} bbox in the form `[w, s, e, n]`.
// - `zoom` {Number} zoom.
// - `tms_style` {Boolean} whether to compute using tms-style.
// - `srs` {String} projection of input bbox (WGS84|900913).
// - `@return` {Object} XYZ bounds containing minX, maxX, minY, maxY properties.
xyz = function(bbox, zoom, tms_style, srs) {
    // If web mercator provided reproject to WGS84.
    if (srs === '900913') {
        bbox = this.convert(bbox, 'WGS84');
    }

    var ll = [bbox[0], bbox[1]]; // lower left
    var ur = [bbox[2], bbox[3]]; // upper right
    var px_ll = px(ll, zoom);
    var px_ur = px(ur, zoom);
    // Y = 0 for XYZ is the top hence minY uses px_ur[1].
    var size = 256;
    var x = [ Math.floor(px_ll[0] / size), Math.floor((px_ur[0] - 1) / size) ];
    var y = [ Math.floor(px_ur[1] / size), Math.floor((px_ll[1] - 1) / size) ];
    var bounds = {
        minX: Math.min.apply(Math, x) < 0 ? 0 : Math.min.apply(Math, x),
        minY: Math.min.apply(Math, y) < 0 ? 0 : Math.min.apply(Math, y),
        maxX: Math.max.apply(Math, x),
        maxY: Math.max.apply(Math, y)
    };
    if (tms_style) {
        var tms = {
            minY: (Math.pow(2, zoom) - 1) - bounds.maxY,
            maxY: (Math.pow(2, zoom) - 1) - bounds.minY
        };
        bounds.minY = tms.minY;
        bounds.maxY = tms.maxY;
    }
    return bounds;
};

// Convert screen pixel value to lon lat
//
// - `px` {Array} `[x, y]` array of geographic coordinates.
// - `zoom` {Number} zoom level.
function ll(px, zoom) {
    var size = 256 * Math.pow(2, zoom);
    var bc = (size / 360);
    var cc = (size / (2 * Math.PI));
    var zc = size / 2;
    var g = (px[1] - zc) / -cc;
    var lon = (px[0] - zc) / bc;
    var R2D = 180 / Math.PI;
    var lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
    return [lon, lat];
}

// Convert tile xyz value to bbox of the form `[w, s, e, n]`
//
// - `x` {Number} x (longitude) number.
// - `y` {Number} y (latitude) number.
// - `zoom` {Number} zoom.
// - `tms_style` {Boolean} whether to compute using tms-style.
// - `srs` {String} projection for resulting bbox (WGS84|900913).
// - `return` {Array} bbox array of values in form `[w, s, e, n]`.
bbox = function(x, y, zoom, tms_style, srs) {
    var size = 256;
    
    // Convert xyz into bbox with srs WGS84
    if (tms_style) {
        y = (Math.pow(2, zoom) - 1) - y;
    }
    // Use +y to make sure it's a number to avoid inadvertent concatenation.
    var ll_ = [x * size, (+y + 1) * size]; // lower left
    // Use +x to make sure it's a number to avoid inadvertent concatenation.
    var ur = [(+x + 1) * size, y * size]; // upper right
    var bbox = ll(ll_, zoom).concat(ll(ur, zoom));

    // If web mercator requested reproject to 900913.
    if (srs === '900913') {
        return this.convert(bbox, '900913');
    } else {
        return bbox;
    }
};

/* original openstmap_app.js */

//var m = require("openstmap");
var HASWIDGETS = true;
var R;
var fix = {};
var mapVisible = false;
var hasScrolled = false;
var settings = require("Storage").readJSON("openstmap.json",1)||{};
var points;
var startDrag = 0;

// Redraw the whole page
function redraw(qual) {
  if (1) drawAll(qual);
  g.setClipRect(R.x,R.y,R.x2,R.y2);
  if (0) m.draw();
  drawPOI();
  drawMarker();
  // if track drawing is enabled...
  if (settings.drawTrack) {
    if (HASWIDGETS && WIDGETS["gpsrec"] && WIDGETS["gpsrec"].plotTrack) {
      g.setColor("#f00").flip(); // force immediate draw on double-buffered screens - track will update later
      WIDGETS["gpsrec"].plotTrack(m);
    }
    if (HASWIDGETS && WIDGETS["recorder"] && WIDGETS["recorder"].plotTrack) {
      g.setColor("#f00").flip(); // force immediate draw on double-buffered screens - track will update later
      WIDGETS["recorder"].plotTrack(m);
    }
  }
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
}

// Draw the POIs
function drawPOI() {
  if (1) return;
  /* var waypoints = require("waypoints").load();  FIXME */  g.setFont("Vector", 18);
  waypoints.forEach((wp, idx) => { 
    var p = m.latLonToXY(wp.lat, wp.lon);
    var sz = 2;
    g.setColor(0,0,0);
    g.fillRect(p.x-sz, p.y-sz, p.x+sz, p.y+sz);
    g.setColor(0,0,0);
    g.drawString(wp.name, p.x, p.y);
    print(wp.name); 
  })
}



// Draw the marker for where we are
function drawMarker() {
  if (!fix.fix) return;
  var p = m.latLonToXY(fix.lat, fix.lon);
  g.setColor(1,0,0);
  g.fillRect(p.x-2, p.y-2, p.x+2, p.y+2);
}

Bangle.on('GPS',function(f) {
  fix=f;
  if (HASWIDGETS) WIDGETS["sats"].draw(WIDGETS["sats"]);
  if (mapVisible) drawMarker();
});
Bangle.setGPSPower(1, "app");

if (HASWIDGETS) {
  Bangle.loadWidgets();
  WIDGETS["sats"] = { area:"tl", width:48, draw:w=>{
    var txt = (0|fix.satellites)+" Sats";
    if (!fix.fix) txt += "\nNO FIX";
      g.reset().setFont("6x8").setFontAlign(0,0)
        .drawString(txt,w.x+24,w.y+12);
    }
  };
  Bangle.drawWidgets();
}
R = Bangle.appRect;

function showMap() {
  mapVisible = true;
  g.reset().clearRect(R);
  redraw(0);
  emptyMap();
}

function emptyMap() {
  Bangle.setUI({mode:"custom",drag:e=>{
    if (e.b) {
      if (!startDrag)
        startDrag = getTime();
      g.setClipRect(R.x,R.y,R.x2,R.y2);
      g.scroll(e.dx,e.dy);
      m.scroll(e.dx,e.dy);
      g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
      hasScrolled = true;
      print("Has scrolled");
    } else if (hasScrolled) {
      delta = getTime() - startDrag;
      startDrag = 0;
      hasScrolled = false;
      print("Done", delta, e.x, e.y);
      qual = 0;
      if (delta < 0.2) {
        if (e.x < g.getWidth() / 2) {
          if (e.y < g.getHeight() / 2) {
            m.scale /= 2;
          } else {
            m.scale *= 2;
          }
        } else {
          if (e.y < g.getHeight() / 2) {
            qual = 2;
          } else {
            qual = 4;
          }
        }
      }
      g.reset().clearRect(R);
      redraw(qual);
    }
  }, btn: btn=>{
    mapVisible = false;
    var menu = {"":{title:"Map"},
    "< Back": ()=> showMap(),
    /*LANG*/"Zoom In": () =>{
      m.scale /= 2;
      showMap();
    },
    /*LANG*/"Zoom Out": () =>{
      m.scale *= 2;
      showMap();
    },
    /*LANG*/"Draw Track": {
      value : !!settings.drawTrack,
      onchange : v => { settings.drawTrack=v; require("Storage").writeJSON("openstmap.json",settings); }
    },
    /*LANG*/"Center Map": () =>{
      m.lat = m.map.lat;
      m.lon = m.map.lon;
      m.scale = m.map.scale;
      showMap();
    },
    /*LANG*/"Benchmark": () =>{
      m.lat = 50.001;
      m.lon = 14.759;
      m.scale = 2;
      g.reset().clearRect(R);
      redraw(18);
      print("Benchmark done");
    }
    };
    if (fix.fix) menu[/*LANG*/"Center GPS"]=() =>{
      m.lat = fix.lat;
      m.lon = fix.lon;
      showMap();
    };
    E.showMenu(menu);
  }});
}

var gjson = null;

function stringFromArray(data) {
  var count = data.length;
  var str = "";

  for(var index = 0; index < count; index += 1)
    str += String.fromCharCode(data[index]);

  return str;
}

const st = require('Storage');
const hs = require('heatshrink');

function readTarFile(tar, f) {
  let json_off = st.read(tar, 0, 16) * 1;
  if (isNaN(json_off)) {
    print("Don't have archive", tar);
    return undefined;
  }
  while (1) {
    let json_len = st.read(tar, json_off, 6) * 1;
    if (json_len == -1)
      break;
    json_off += 6;
    let json = st.read(tar, json_off, json_len);
    //print("Have directory, ", json.length, "bytes");
    let files = JSON.parse(json);
    let rec = files[f];
    if (rec) {
      let cs = st.read(tar, rec.st, rec.si);
      if (rec.comp == "hs") {
        let d = stringFromArray(hs.decompress(cs));
        //print("Decompressed", d);
        return d;
      }
      return cs;
    }
    json_off += json_len;
  }
  return undefined;
}
function loadVector(name) {
  var t1 = getTime();
  print(".. Read", name);
    //s = require("Storage").read(name);
  var s = readTarFile("world.mtar", name);
  if (s == undefined) {
    print("Don't have file", name);
    return null;
  }
  var r = JSON.parse(s);
  print(".... Read and parse took ", getTime()-t1);
  return r;
}
function drawPoint(a) {   /* FIXME: let... */
  lon = a.geometry.coordinates[0];
  lat = a.geometry.coordinates[1];
  
  var p = m.latLonToXY(lat, lon);
  var sz = 2;
  if (a.properties["marker-color"]) {
    g.setColor(a.properties["marker-color"]);
  }
  if (a.properties.marker_size == "small")
    sz = 1;
  if (a.properties.marker_size == "large")
    sz = 4;
  
  g.fillRect(p.x-sz, p.y-sz, p.x+sz, p.y+sz);
  g.setColor(0,0,0);
  g.setFont("Vector", 18).setFontAlign(-1,-1);
  g.drawString(a.properties.name, p.x, p.y);
  points ++;
}
function drawLine(a, qual) {
  lon = a.geometry.coordinates[0][0];
  lat = a.geometry.coordinates[0][1];
  i = 1;
  step = 1;
  len = a.geometry.coordinates.length;
  step = step * qual;
  var p1 = m.latLonToXY(lat, lon);
  if (a.properties.stroke) {
    g.setColor(a.properties.stroke);
  }
  while (i < len) {  
    lon = a.geometry.coordinates[i][0];
    lat = a.geometry.coordinates[i][1];
    var p2 = m.latLonToXY(lat, lon);

    //print(p1.x, p1.y, p2.x, p2.y);
    g.drawLine(p1.x, p1.y, p2.x, p2.y);
    if (i == len-1)
      break;
    i = i + step;
    if (i>len)
      i = len-1;
    points ++;
    p1 = p2;
  }
}
function drawPolygon(a, qual) {
  lon = a.geometry.coordinates[0][0];
  lat = a.geometry.coordinates[0][1];
  i = 1;
  step = 1;
  len = a.geometry.coordinates.length;
  if (len > 62) {
    step = log2(len) - 5;
    step = 1<<step;
  }
  step = step * qual;
  var p1 = m.latLonToXY(lat, lon);
  let pol = [p1.x, p1.y];
  while (i < len) {  
    lon = a.geometry.coordinates[i][0];
    lat = a.geometry.coordinates[i][1];
    var p2 = m.latLonToXY(lat, lon);

    pol.push(p2.x, p2.y);
    if (i == len-1)
      break;
    i = i + step;
    if (i>len)
      i = len-1;
    points ++;
  }
  if (a.properties.fill) {
    g.setColor(a.properties.fill);
  } else {
    g.setColor(.75, .75, 1);
  }
  g.fillPoly(pol, true);
  if (a.properties.stroke) {
    g.setColor(a.properties.stroke);
  } else {
    g.setColor(0,0,0)
  }
  g.drawPoly(pol, true);
}

function toScreen(tile, xy) {
//  w, s, e, n, (x,y in 0..4096 range)
  let x = xy[0];
  let y = xy[1];
  let r = {};
  r.x = ((x/4096) * (tile[2]-tile[0])) + tile[0];
  r.y = ((1-(y/4096)) * (tile[3]-tile[1])) + tile[1];
  return r;
}
var d_off = 1;
function getBin(bin, i, prev) {
  let x = bin[i*3 + d_off  ]<<4;
  let y = bin[i*3 + d_off+1]<<4;
  //print("Point", x, y, bin);
  return [x, y];
}
function getBinLength(bin) {
  return (bin.length-d_off) / 3;
}
function newPoint(tile, a, rec, bin) {  
  var p = toScreen(tile, getBin(bin, 0, null));
  var sz = 2;
  if (a.properties) {
    if (a.properties["marker-color"]) {
      g.setColor(a.properties["marker-color"]);
    }
    if (a.properties.marker_size == "small")
      sz = 1;
    if (a.properties.marker_size == "large")
      sz = 4;
  }
  
  g.fillRect(p.x-sz, p.y-sz, p.x+sz, p.y+sz);
  if (rec.tags) {
    g.setColor(0,0,0);
    g.setFont("Vector", 18).setFontAlign(-1,-1);
    g.drawString(rec.tags.name, p.x, p.y);
  }
  points ++;
}
function newLine(tile, a, bin) {
  let xy = getBin(bin, 0, null);
  let i = 1;
  let step = 1;
  let len = getBinLength(bin);
  let p1 = toScreen(tile, xy);
  if (a.properties && a.properties.stroke) {
    g.setColor(a.properties.stroke);
  }
  while (i < len) {  
    xy = getBin(bin, i, xy);
    var p2 = toScreen(tile, xy);

    //print(p1.x, p1.y, p2.x, p2.y);
    g.drawLine(p1.x, p1.y, p2.x, p2.y);
    if (i == len-1)
      break;
    i = i + step;
    if (i>len)
      i = len-1;
    points ++;
    p1 = p2;
  }
}
function newPolygon(tile, a, bin) {
  let xy = getBin(bin, 0, null);
  i = 1;
  step = 1;
  len = getBinLength(bin);
  if (len > 62) {
    step = log2(len) - 5;
    step = 1<<step;
  }
  var p1 = toScreen(tile, xy);
  let pol = [p1.x, p1.y];
  while (i < len) {  
    xy = getBin(bin, i, xy); // FIXME... when skipping
    var p2 = toScreen(tile, xy);

    pol.push(p2.x, p2.y);
    if (i == len-1)
      break;
    i = i + step;
    if (i>len)
      i = len-1;
    points ++;
  }
  if (a.properties && a.properties.fill) {
    g.setColor(a.properties.fill);
  } else {
    g.setColor(.75, .75, 1);
  }
  g.fillPoly(pol, true);
  if (a.properties && a.properties.stroke) {
    g.setColor(a.properties.stroke);
  } else {
    g.setColor(0,0,0)
  }
  g.drawPoly(pol, true);
}
function newVector(tile, rec) {
  let bin = E.toUint8Array(atob(rec.b));
  a = meta.attrs[bin[0]];  
  if (a.type == 1) {
    newPoint(tile, a, rec, bin);
  } else if (a.type == 2) {
    newLine(tile, a, bin);
  } else if (a.type == 3) {
    newPolygon(tile, a, bin);
  } else print("Unknown record", a);
  g.flip();
}
function drawVector(gjson, tile, qual) {
  var d = gjson;
  points = 0;
  var t1 = getTime();
  
  let xy1 = m.latLonToXY(tile[1], tile[0]);
  let xy2 = m.latLonToXY(tile[3], tile[2]);
  let t2 = [ xy1.x, xy1.y, xy2.x, xy2.y ];
  print(t2);
  
  for (var a of d) { // d.features for geojson
    g.setColor(0,0,0);
    if (a.type != "Feature") {
      newVector(t2, a);
      continue;
    }
    // marker-size, marker-color, stroke
    if (qual < 32 && a.geometry.type == "Point")
      drawPoint(a);
    if (qual < 8 && a.geometry.type == "LineString")
      drawLine(a, qual);
    if (qual < 8 && a.geometry.type == "Polygon")
      drawPolygon(a, qual);    
  }
  print("....", points, "painted in", getTime()-t1, "sec");
}
function fname(lon, lat, zoom) {
    var bbox = [lon, lat, lon, lat];
    var r = xyz(bbox, 13, false, "WGS84");
    //console.log('fname', r);
    return 'z'+zoom+'-'+r.minX+'-'+r.minY+'.json';
}
function fnames(zoom) {
    var bb = [m.lon, m.lat, m.lon, m.lat];
    var r = xyz(bb, zoom, false, "WGS84");
    let maxt = 16;
    while (1) {
      var bb2 = bbox(r.minX, r.minY, zoom, false, "WGS84");
      var os = m.latLonToXY(bb2[3], bb2[0]);
      if (os.x >= 0)
        r.minX -= 1;
      else if (os.y >= 0)
        r.minY -= 1;
      else break;
      if (!maxt)
        break;
      maxt--;
    }
    while (1) {
      var bb2 = bbox(r.maxX, r.maxY, zoom, false, "WGS84");
      var os = m.latLonToXY(bb2[1], bb2[2]);
      if (os.x <= g.getWidth())
        r.maxX += 1;
      else if (os.y <= g.getHeight())
        r.maxY += 1;
      else break;
      if (!maxt)
        break;
      maxt--;
    }
  if (!maxt)
    print("!!! Too many tiles, not painting some");
  print(".. paint range", r);
  return r;
}
function log2(x) { return Math.log(x) / Math.log(2); }
function getZoom(qual) {
  var z = 16-Math.round(log2(m.scale));
  z += qual;
  z -= 0;
  if (z < meta.min_zoom)
    return meta.min_zoom;
  if (z > meta.max_zoom)
    return meta.max_zoom;
  return z;
}
function drawDebug(text, perc) {
  g.setClipRect(0,0,R.x2,R.y);
  g.reset();
  g.setColor(1,1,1).fillRect(0,0,R.x2,R.y);
  g.setColor(1,0,0).fillRect(0,0,R.x2*perc,R.y);
  g.setColor(0,0,0).setFont("Vector",15);
  g.setFontAlign(0,0)
        .drawString(text,80,10);

  g.setClipRect(R.x,R.y,R.x2,R.y2);
  g.flip();
}
function drawAll(qual) {
  var zoom = getZoom(qual);
  var t1 = getTime();

  drawDebug("Zoom "+zoom, 0);

  print("Draw all", m.scale, "->", zoom, "q", qual, "at", m.lat, m.lon);
  var r = fnames(zoom);
  var tiles = (r.maxY-r.minY+1) * (r.maxY-r.minY+1);
  var num = 0;
  drawDebug("Zoom "+zoom+" tiles "+tiles, 0);
  for (y=r.minY; y<=r.maxY; y++) {
   for (x=r.minX; x<=r.maxX; x++) {
     
    for (cnt=0; cnt<1000; cnt++) {
      var n ='z'+zoom+'-'+x+'-'+y+'-'+cnt+'.json';
      var gjson = loadVector(n);
      if (!gjson) break;
      drawVector(gjson, bbox(x, y, zoom, false, "WGS84"), 1);
    }
    num++;
    drawDebug("Zoom "+zoom+" tiles "+num+"/"+tiles, num/tiles);
   }
  }
  g.flip();
  Bangle.drawWidgets();
  print("Load and paint in", getTime()-t1, "sec");
}

function initVector() {
  var s = readTarFile("delme.mtar", "meta.json");
  meta = JSON.parse(s);

}

function introScreen() {
  g.reset().clearRect(R);
  g.setColor(0,0,0).setFont("Vector",25);
  g.setFontAlign(0,0);
  g.drawString("SpaceWeaver", 85,35);
  g.setColor(0,0,0).setFont("Vector",18);
  g.drawString("Vector maps", 85,55);
  g.drawString("Zoom "+meta.min_zoom+".."+meta.max_zoom, 85,75);
}


m.scale = 76000;
m.lat = 50.001;
m.lon = 14.759;

initVector();
introScreen();
emptyMap();
