let settings;

exports.reload = function() {
  //let t = Date.now();
  settings = Object.assign({
    style : "randomcolor",
    colors : ["#F00","#0F0","#00F"]
  },require("Storage").readJSON("clockbg.json",1)||{});
  if (settings.style=="image")
    settings.img = require("Storage").read(settings.fn);
  else if (settings.style=="randomcolor") {
    settings.style = "color";
    let n = (0|(Math.random()*settings.colors.length)) % settings.colors.length;
    settings.color = settings.colors[n];
  } else if (settings.style=="rings") { // 45 ms
    settings.style = "image";
    let bg = Graphics.createArrayBuffer(g.getWidth(),g.getHeight(),1,{msb:true});
    var x,y,r,ri=Math.randInt,s=bg.getWidth()-20;
    for (var i=0;i<10;i++) {
      x = 10+ri(s);y=10+ri(s);r=10+ri(40);
      bg.drawCircle(x,y,r).drawCircle(x,y,r-1).drawCircle(x,y,r-2).drawCircle(x,y,r-3);
    }
    bg.palette = new Uint16Array([g.toColor(settings.colors[0]),g.toColor(settings.colors[1])]);
    settings.img = bg;
    settings.imgOpt = {};
  } else if (settings.style=="tris") { // 58ms
    settings.style = "image";
    let cols = settings.colors, ri = Math.randInt, r = ri(settings.colors.length), bpp = (cols.length>4)?4:2;
    cols = cols.slice(r).concat(cols.slice(0,r)); // rotate palette
    let bg = Graphics.createArrayBuffer(88,88,bpp,{msb:true});
    bg.palette = new Uint16Array(1<<bpp);
    bg.palette.set(cols.map(c=>g.toColor(c)));
    let c = cols.length-1, rp = (function(r){"ram";return r()-10}).bind(null,ri.bind(null,bg.getWidth()+20)), a = [0,0,0,0,0,0];
    for (var i=1;i<9;i++) bg.setColor(1+ri(c)).fillPoly(a.map(rp));
    settings.img = bg;
    settings.imgOpt = {scale:g.getWidth()/88};
  } else if (settings.style=="squares") { // 32ms
    settings.style = "image";
    let bpp = (settings.colors.length>4)?4:2;
    let bg = Graphics.createArrayBuffer(11,11,bpp,{msb:true});
    let u32 = new Uint32Array(bg.buffer); // faster to do 1/4 of the ops of E.mapInPlace(bg.buffer, bg.buffer, ()=>Math.random()*256);
    if (Math.randInt) E.mapInPlace(u32, u32, Math.randInt); // random pixels
    else E.mapInPlace(u32, u32, function(r,n){"ram";return r()*n}.bind(null,Math.random,0x100000000)); // random pixels
    bg.buffer[bg.buffer.length-1]=Math.random()*256; // 11x11 isn't a multiple of 4 bytes - we need to set the last one!
    bg.palette = new Uint16Array(1<<bpp);
    bg.palette.set(settings.colors.map(c=>g.toColor(c)));
    settings.img = bg;
    settings.imgOpt = {scale:g.getWidth()/11};
  } else if (settings.style=="plasma") { // ~47ms
    settings.style = "image";
    let bg = Graphics.createArrayBuffer(16,16,4,{msb:true});
    let u32 = new Uint32Array(bg.buffer); // faster to do 1/4 of the ops of E.mapInPlace(bg.buffer, bg.buffer, ()=>Math.random()*256);
    if (Math.randInt) E.mapInPlace(u32, u32, Math.randInt); // random pixels
    else E.mapInPlace(u32, u32, function(r,n){"ram";return r()*n}.bind(null,Math.random,0x100000000)); // random pixels
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
    settings.imgOpt = {scale:g.getWidth()/16};
  }
  delete settings.colors; // not needed now
  //console.log("bg",Date.now()-t);
};

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

// load background
exports.reload();

//exports.fillRect(Bangle.appRect); // testing