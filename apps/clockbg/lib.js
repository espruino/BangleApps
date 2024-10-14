let settings;

exports.reload = function() {
  settings = Object.assign({
    style : "randomcolor",
    colors : ["#F00","#0F0","#00F"]
  },require("Storage").readJSON("clockbg.json")||{});
  if (settings.style=="image")
    settings.img = require("Storage").read(settings.fn);
  else if (settings.style=="randomcolor") {
    settings.style = "color";
    let n = (0|(Math.random()*settings.colors.length)) % settings.colors.length;
    settings.color = settings.colors[n];
    delete settings.colors;
  } else if (settings.style=="squares") { // 32ms
    settings.style = "image";
    let bpp = (settings.colors.length>4)?4:2;
    let bg = Graphics.createArrayBuffer(11,11,bpp,{msb:true});
    let u32 = new Uint32Array(bg.buffer); // faster to do 1/4 of the ops of E.mapInPlace(bg.buffer, bg.buffer, ()=>Math.random()*256);
    E.mapInPlace(u32, u32, function(r,n){"ram";return r()*n}.bind(null,Math.random,0x100000000)); // random pixels
    bg.buffer[bg.buffer.length-1]=Math.random()*256; // 11x11 isn't a multiple of 4 bytes - we need to set the last one!
    bg.palette = new Uint16Array(1<<bpp);
    bg.palette.set(settings.colors.map(c=>g.toColor(c)));
    settings.img = bg;
    settings.imgOpt = {scale:16};
    delete settings.colors;
  } else if (settings.style=="plasma") { // ~47ms
    settings.style = "image";
    let bg = Graphics.createArrayBuffer(16,16,4,{msb:true});
    let u32 = new Uint32Array(bg.buffer); // faster to do 1/4 of the ops of E.mapInPlace(bg.buffer, bg.buffer, ()=>Math.random()*256);
    E.mapInPlace(u32, u32, function(r,n){"ram";return r()*n}.bind(null,Math.random,0x100000000)); // random pixels
    bg.filter([ // a gaussian filter to smooth out
        1, 4, 7, 4, 1,
        4,16,26,16, 4,
        7,26,41,26, 7,
        4,16,26,16, 4,
        1, 4, 7, 4, 1
    ], { w:5, h:5, div:120, offset:-800 });
    bg.palette = new Uint16Array(16);
    bg.palette.set(settings.colors.map(c=>g.toColor(c)));
    settings.img = bg;
    settings.imgOpt = {scale:11};
    delete settings.colors;
  }
};
exports.reload();

// Fill a rectangle with the current background style, rect = {x,y,w,h}
// eg require("clockbg").fillRect({x:10,y:10,w:50,h:50})
//    require("clockbg").fillRect(Bangle.appRect)
exports.fillRect = function(rect,y,x2,y2) {
  if ("object"!=typeof rect) rect = {x:rect,y:y,w:1+x2-rect,h:1+y2-y};
  if (settings.img) {
    g.setClipRect(rect.x, rect.y, rect.x+rect.w-1, rect.y+rect.h-1).drawImage(settings.img,0,0,settings.imgOpt).setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
  } else if (settings.style == "color") {
    g.setBgColor(settings.color).clearRect(rect);
  } else {
    console.log("clockbg: No background set!");
    g.setBgColor(g.theme.bg).clearRect(rect);
  }
};