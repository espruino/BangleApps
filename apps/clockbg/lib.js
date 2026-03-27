let settings;

exports.reload = function() {
  //let t = Date.now();
  settings = Object.assign({
    style : "randomcolor",
    colors : ["#00f","#0bf","#0f7","#3f0","#ff0","#f30","#f07","#b0f"]
  },require("Storage").readJSON("clockbg.json",1)||{});
  // if an array of arrays then we select one at random
  if (settings.colors && settings.colors[0] instanceof Array)
    settings.colors = settings.colors[Math.randInt(settings.colors.length)];
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
  } else if (settings.style=="blobs") { // ~25ms
    settings.style = "image";
    const S=11; // image size
    const Z=88,W=Z/S,H=Z/S;
/*
function rotate(img,n) {
  var res = [],r = Graphics.createArrayBuffer(S,S,1);
  n=n||4;
  for (var i=0;i<n;i++) {
    r.setRotation(i);
    r.clear().drawImage(img);
    r.setRotation(0);
    res.push(r.asImage("string"));
  }
  return res;
}
const IM_ANGLE = rotate(Graphics.createImage(`




        ###
      #####
    ######
    ###
    ###
    ###
    ###
`)), IM_STRAIGHT = rotate(Graphics.createImage(`




###########
###########
###########
`),2), IM_DOUBLE = rotate(Graphics.createImage(`
    ###
    ###
    ###
  ###
######  ###
##### #####
###  ######
    ###
    ####
    ###
    ###
`),2), IM_BLANK = "\1\1\2\0";*/
    const IM_ANGLE = [
      "\v\v\1\0\0\0\0\0\0\x0E\7\xC1\xF88\x0E\1\xC08\0",
      "\v\v\1\0\0\0\0\0\x0E\1\xF0?\0\xE0\x0E\1\xC08\0",
      "\v\v\1\x0E\1\xC08\x0E\x0F\xC1\xF08\0\0\0\0\0\0\0",
      "\v\v\1\x0E\1\xC08\3\x80~\7\xC08\0\0\0\0\0\0"
    ], IM_STRAIGHT = [
      "\v\v\1\0\0\0\0\0\x0F\xFF\xFF\xFF\xF8\0\0\0\0\0\0",
      "\v\v\1\x0E\1\xC08\7\0\xE0\x1C\3\x80p\x0E\1\xC08\0"
    ], IM_DOUBLE = [
      "\v\v\1\x0E\1\xC08\x0E\x0F\xCF\xF7\xF9\xF88\x0F\1\xC08\0",
      "\v\v\1\x0E\1\xC08\3\x8E\x7F\xF7\xFF9\xE0\x0E\1\xC08\0"
    ], IM_BLANK = "\1\1\2\0";
    const IM = { // [ TL TR BL BR ]
      "0000" : IM_BLANK,
      "1000" : IM_ANGLE[2],
      "0100" : IM_ANGLE[3],
      "1100" : IM_STRAIGHT[0],
      "0010" : IM_ANGLE[1],
      "1010" : IM_STRAIGHT[1],
      "0110" : IM_DOUBLE[1],
      "1110" : IM_ANGLE[0],
      "0001" : IM_ANGLE[0],
      "1001" : IM_DOUBLE[0],
      "0101" : IM_STRAIGHT[1],
      "1101" : IM_ANGLE[1],
      "0011" : IM_STRAIGHT[0],
      "1011" : IM_ANGLE[3],
      "0111" : IM_ANGLE[2],
      "1111" : IM_BLANK,
    };

    let bg = Graphics.createArrayBuffer(Z,Z,2);
    bg.palette = new Uint16Array(4);
    bg.palette.set(settings.colors.map(c=>g.toColor(c)));
    let m = new Uint8Array(W*(H+1)+1);
    E.mapInPlace(m,m,Math.randInt.bind(Math,2));
    let n,x,y;
    for (y=n=0;y<Z;y+=S)
      for (x=0;x<Z;x+=S) bg.drawImage(IM[""+m[n]+m[n+1]+m[n+W]+m[++n+W]],x,y);
    let c=0
    for (y=n=0;y<Z;y+=S)
      for (x=0;x<Z;x+=S)
        if (m[n++] && !bg.getPixel(x,y))
          bg.floodFill(x,y,1+(c=!c));
    settings.img = bg;
    settings.imgOpt = {scale:2};
  }
  delete settings.colors; // not needed now
  //console.log("bg",Date.now()-t);
};

/// Will load settings if they haven't already been loaded
exports.load = function() {
  if (settings===undefined)
    exports.reload();
}

/// Remove settings and free memory - .load() must be called before drawing again
exports.unload = function() {
  settings = undefined;
}

// Fill a rectangle with the current background style, rect = {x,y,w,h}
// eg require("clockbg").fillRect({x:10,y:10,w:50,h:50})
//    require("clockbg").fillRect(Bangle.appRect)
exports.fillRect = function(rect,y,x2,y2) {
  if (!settings) return;
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