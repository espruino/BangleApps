// PALETTES ---------------------------
E.showMessage("Precomputing\npalettes\n\nPlease wait...\n0 / 3");
(function() { "jit" // fire
  for (var i=0;i<256;i++) {
    var r = Math.min(i*6,240);
    var g = Math.min(i*3,240);
    var b = E.clip((i-192)*8,0,240);
    pal[i] = (b>>3) | ((g&0xFC)<<3) | ((r&0xF8)<<8);
  }pal[255] = 65535;
})()
require("Storage").write("geissclk.0.pal",pal.buffer);
E.showMessage("Precomputing\npalettes\n\nPlease wait...\n1 / 3");
(function() { "jit" // gunge
  for (var i=0;i<256;i++) {
    var r = 0;
    var g = Math.min(i*3,255);
    var b = Math.min(i,255);
    pal[i] = (b>>3) | ((g&0xFC)<<3) | ((r&0xF8)<<8);
  }pal[255] = 65535;
})()
require("Storage").write("geissclk.1.pal",pal.buffer);
E.showMessage("Precomputing\npalettes\n\nPlease wait...\n2 / 3");
(function() { "jit" // rainbow
  for (var i=0;i<256;i++) {
    var cl = E.HSBtoRGB((48+i)/128,1,Math.min(i/16,0.9),true);
    var r = cl[0];
    var g = cl[1];
    var b = cl[2];
    pal[i] = (b>>3) | ((g&0xFC)<<3) | ((r&0xF8)<<8);
  }pal[255] = 65535;pal[255] = 65535;
})()
require("Storage").write("geissclk.2.pal",pal.buffer);


// MAPS ----------------------------------------------
E.showMessage("Precomputing\nmaps\n\nPlease wait...\n0 / 5");
// straight out
(function() { "jit"; var n = 0; for (var y=0;y<H;y++) {
  for (var x=0;x<W;x++) {
    var dx = x-(W/2);
    var dy = y-(H/2);
    var d = Math.sqrt(dx*dx + dy*dy);
    var s = -2 + Math.sin(d*0.5);
    dx = dx*s/d;
    dy = dy*s/d;
    map[n++] = ((dx*2 + 8) & 0x0F) | (((dy*2 + 8) & 0x0F)<<4);
  }
}})();
require("Storage").write("geissclk.0.map",map);
E.showMessage("Precomputing\nmaps\n\nPlease wait...\n1 / 5");
// ripple out
(function() { "jit";  var n = 0; for (var y=0;y<H;y++) {
  for (var x=0;x<W;x++) {
    var dx = x-(W/2);
    var dy = y-(H/2);
    var d = Math.sqrt(dx*dx + dy*dy);
    var s = -2 + Math.sin(d*0.5)/2;
    dx = dx*s/d;
    dy = dy*s/d;
    map[n++] = ((dx*3 + 8) & 0x0F) | (((dy*3 + 8) & 0x0F)<<4);
  }
}})();
require("Storage").write("geissclk.1.map",map);
E.showMessage("Precomputing\nmaps\n\nPlease wait...\n2 / 5");
// twisty outwards
(function() { "jit";  var n = 0; for (var y=0;y<H;y++) {
  for (var x=0;x<W;x++) {
    var dx = x-(W/2);
    var dy = y-(H/2);
    var d = Math.sqrt(dx*dx + dy*dy);
    dx = (-dx/d) + (((y&7)>3)?0.5:-0.5);
    dy = (-dy/d) + (((x&7)>3)?0.5:-0.5);
    map[n++] = ((dx*3 + 8) & 0x0F) | (((dy*3 + 8) & 0x0F)<<4);
  }
}})()
require("Storage").write("geissclk.2.map",map);
E.showMessage("Precomputing\nmaps\n\nPlease wait...\n3 / 5");
// spiral
(function() { "jit";  var n = 0; for (var y=0;y<H;y++) {
  for (var x=0;x<W;x++) {
    var dx = x-(W/2);
    var dy = y-(H/2);
    var d = Math.sqrt(dx*dx + dy*dy);
    var cx = (2*dy-dx)/(2*d);
    var cy = (-2*dx-dy)/(2*d);
    map[n++] = ((cx*3 + 8) & 0x0F) | (((cy*3 + 8) & 0x0F)<<4);
  }
}})();
require("Storage").write("geissclk.3.map",map);
E.showMessage("Precomputing\nmaps\n\nPlease wait...\n4 / 5");
// blur down
(function() { "jit";  var n=0; for (var y=0;y<H;y++) {
  for (var x=0;x<W;x++) {
    map[n++] = 136 - 6*16 + (y&1)*8-4;
  }
}})()
require("Storage").write("geissclk.4.map",map);
E.showMessage("Precomputing\nmaps\n\nPlease wait...\n5 / 5");
// twisty
(function() { "jit";  var n=0; for (var y=0;y<H;y++) {
  for (var x=0;x<W;x++) {
    dx = Math.sin(y*0.2);
    dy = Math.cos(x*0.2);
    map[n++] = ((dx*6 + 8) & 0x0F) | (((dy*6 + 8) & 0x0F)<<4);
  }
}})()
require("Storage").write("geissclk.5.map",map)
E.showMessage("Finished!");
