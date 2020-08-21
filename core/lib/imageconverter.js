/* Copyright 2020 Gordon Williams, gw@pur3.co.uk
   https://github.com/espruino/EspruinoWebTools
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['b'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('b'));
    } else {
        // Browser globals (root is window)
        root.imageconverter = factory(root.heatshrink);
    }
}(typeof self !== 'undefined' ? self : this, function (heatshrink) {

  const PALETTE = {
   VGA: [0x000000, 0x0000a8, 0x00a800, 0x00a8a8, 0xa80000, 0xa800a8, 0xa85400, 0xa8a8a8, 0x545454, 0x5454fc, 0x54fc54, 0x54fcfc, 0xfc5454, 0xfc54fc, 0xfcfc54, 0xfcfcfc, 0x000000, 0x141414, 0x202020, 0x2c2c2c, 0x383838, 0x444444, 0x505050, 0x606060, 0x707070, 0x808080, 0x909090, 0xa0a0a0, 0xb4b4b4, 0xc8c8c8, 0xe0e0e0, 0xfcfcfc, 0x0000fc, 0x4000fc, 0x7c00fc, 0xbc00fc, 0xfc00fc, 0xfc00bc, 0xfc007c, 0xfc0040, 0xfc0000, 0xfc4000, 0xfc7c00, 0xfcbc00, 0xfcfc00, 0xbcfc00, 0x7cfc00, 0x40fc00, 0x00fc00, 0x00fc40, 0x00fc7c, 0x00fcbc, 0x00fcfc, 0x00bcfc, 0x007cfc, 0x0040fc, 0x7c7cfc, 0x9c7cfc, 0xbc7cfc, 0xdc7cfc, 0xfc7cfc, 0xfc7cdc, 0xfc7cbc, 0xfc7c9c, 0xfc7c7c, 0xfc9c7c, 0xfcbc7c, 0xfcdc7c, 0xfcfc7c, 0xdcfc7c, 0xbcfc7c, 0x9cfc7c, 0x7cfc7c, 0x7cfc9c, 0x7cfcbc, 0x7cfcdc, 0x7cfcfc, 0x7cdcfc, 0x7cbcfc, 0x7c9cfc, 0xb4b4fc, 0xc4b4fc, 0xd8b4fc, 0xe8b4fc, 0xfcb4fc, 0xfcb4e8, 0xfcb4d8, 0xfcb4c4, 0xfcb4b4, 0xfcc4b4, 0xfcd8b4, 0xfce8b4, 0xfcfcb4, 0xe8fcb4, 0xd8fcb4, 0xc4fcb4, 0xb4fcb4, 0xb4fcc4, 0xb4fcd8, 0xb4fce8, 0xb4fcfc, 0xb4e8fc, 0xb4d8fc, 0xb4c4fc, 0x000070, 0x1c0070, 0x380070, 0x540070, 0x700070, 0x700054, 0x700038, 0x70001c, 0x700000, 0x701c00, 0x703800, 0x705400, 0x707000, 0x547000, 0x387000, 0x1c7000, 0x007000, 0x00701c, 0x007038, 0x007054, 0x007070, 0x005470, 0x003870, 0x001c70, 0x383870, 0x443870, 0x543870, 0x603870, 0x703870, 0x703860, 0x703854, 0x703844, 0x703838, 0x704438, 0x705438, 0x706038, 0x707038, 0x607038, 0x547038, 0x447038, 0x387038, 0x387044, 0x387054, 0x387060, 0x387070, 0x386070, 0x385470, 0x384470, 0x505070, 0x585070, 0x605070, 0x685070, 0x705070, 0x705068, 0x705060, 0x705058, 0x705050, 0x705850, 0x706050, 0x706850, 0x707050, 0x687050, 0x607050, 0x587050, 0x507050, 0x507058, 0x507060, 0x507068, 0x507070, 0x506870, 0x506070, 0x505870, 0x000040, 0x100040, 0x200040, 0x300040, 0x400040, 0x400030, 0x400020, 0x400010, 0x400000, 0x401000, 0x402000, 0x403000, 0x404000, 0x304000, 0x204000, 0x104000, 0x004000, 0x004010, 0x004020, 0x004030, 0x004040, 0x003040, 0x002040, 0x001040, 0x202040, 0x282040, 0x302040, 0x382040, 0x402040, 0x402038, 0x402030, 0x402028, 0x402020, 0x402820, 0x403020, 0x403820, 0x404020, 0x384020, 0x304020, 0x284020, 0x204020, 0x204028, 0x204030, 0x204038, 0x204040, 0x203840, 0x203040, 0x202840, 0x2c2c40, 0x302c40, 0x342c40, 0x3c2c40, 0x402c40, 0x402c3c, 0x402c34, 0x402c30, 0x402c2c, 0x40302c, 0x40342c, 0x403c2c, 0x40402c, 0x3c402c, 0x34402c, 0x30402c, 0x2c402c, 0x2c4030, 0x2c4034, 0x2c403c, 0x2c4040, 0x2c3c40, 0x2c3440, 0x2c3040, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0xFFFFFF],
  WEB : [0x000000,0x000033,0x000066,0x000099,0x0000cc,0x0000ff,0x003300,0x003333,0x003366,0x003399,0x0033cc,0x0033ff,0x006600,0x006633,0x006666,0x006699,0x0066cc,0x0066ff,0x009900,0x009933,0x009966,0x009999,0x0099cc,0x0099ff,0x00cc00,0x00cc33,0x00cc66,0x00cc99,0x00cccc,0x00ccff,0x00ff00,0x00ff33,0x00ff66,0x00ff99,0x00ffcc,0x00ffff,0x330000,0x330033,0x330066,0x330099,0x3300cc,0x3300ff,0x333300,0x333333,0x333366,0x333399,0x3333cc,0x3333ff,0x336600,0x336633,0x336666,0x336699,0x3366cc,0x3366ff,0x339900,0x339933,0x339966,0x339999,0x3399cc,0x3399ff,0x33cc00,0x33cc33,0x33cc66,0x33cc99,0x33cccc,0x33ccff,0x33ff00,0x33ff33,0x33ff66,0x33ff99,0x33ffcc,0x33ffff,0x660000,0x660033,0x660066,0x660099,0x6600cc,0x6600ff,0x663300,0x663333,0x663366,0x663399,0x6633cc,0x6633ff,0x666600,0x666633,0x666666,0x666699,0x6666cc,0x6666ff,0x669900,0x669933,0x669966,0x669999,0x6699cc,0x6699ff,0x66cc00,0x66cc33,0x66cc66,0x66cc99,0x66cccc,0x66ccff,0x66ff00,0x66ff33,0x66ff66,0x66ff99,0x66ffcc,0x66ffff,0x990000,0x990033,0x990066,0x990099,0x9900cc,0x9900ff,0x993300,0x993333,0x993366,0x993399,0x9933cc,0x9933ff,0x996600,0x996633,0x996666,0x996699,0x9966cc,0x9966ff,0x999900,0x999933,0x999966,0x999999,0x9999cc,0x9999ff,0x99cc00,0x99cc33,0x99cc66,0x99cc99,0x99cccc,0x99ccff,0x99ff00,0x99ff33,0x99ff66,0x99ff99,0x99ffcc,0x99ffff,0xcc0000,0xcc0033,0xcc0066,0xcc0099,0xcc00cc,0xcc00ff,0xcc3300,0xcc3333,0xcc3366,0xcc3399,0xcc33cc,0xcc33ff,0xcc6600,0xcc6633,0xcc6666,0xcc6699,0xcc66cc,0xcc66ff,0xcc9900,0xcc9933,0xcc9966,0xcc9999,0xcc99cc,0xcc99ff,0xcccc00,0xcccc33,0xcccc66,0xcccc99,0xcccccc,0xccccff,0xccff00,0xccff33,0xccff66,0xccff99,0xccffcc,0xccffff,0xff0000,0xff0033,0xff0066,0xff0099,0xff00cc,0xff00ff,0xff3300,0xff3333,0xff3366,0xff3399,0xff33cc,0xff33ff,0xff6600,0xff6633,0xff6666,0xff6699,0xff66cc,0xff66ff,0xff9900,0xff9933,0xff9966,0xff9999,0xff99cc,0xff99ff,0xffcc00,0xffcc33,0xffcc66,0xffcc99,0xffcccc,0xffccff,0xffff00,0xffff33,0xffff66,0xffff99,0xffffcc,0xffffff],
  MAC16 : [
  0x000000, 0x444444, 0x888888, 0xBBBBBB,
  0x996633, 0x663300, 0x006600, 0x00aa00,
  0x0099ff, 0x0000cc, 0x330099, 0xff0099,
  0xdd0000, 0xff6600, 0xffff00, 0xffffff
],
lookup : function(palette,r,g,b,a, no_transparent) {
if (!no_transparent && a<128) return TRANSPARENT_8BIT;
var maxd = 0xFFFFFF;
var c = 0;
palette.forEach(function(p,n) {
  var pr=p>>16;
  var pg=(p>>8)&255;
  var pb=p&255;
  var dr = r-pr;
  var dg = g-pg;
  var db = b-pb;
  var d = dr*dr + dg*dg + db*db;
  if (d<maxd) {
    c = n;
    maxd=d;
  }
});
return c;
}
};
  var TRANSPARENT_8BIT = 254;


  var COL_BPP = {
    "1bit":1,
    "2bitbw":2,
    "4bit":4,
    "4bitmac":4,
    "vga":8,
    "web":8,
    "rgb565":16
  };


  var COL_FROM_RGB = {
    "1bit":function(r,g,b) {
      var c = (r+g+b) / 3;
      var thresh = 128;
      return c>thresh;
    },
    "2bitbw":function(r,g,b) {
      var c = (r+g+b) / 3;
      c += 31; // rounding
      if (c>255)c=255;
      return c>>6;
    },
    "4bit":function(r,g,b,a) {
      var thresh = 128;
      return (
        ((r>thresh)?1:0) |
        ((g>thresh)?2:0) |
        ((b>thresh)?4:0) |
        ((a>thresh)?8:0));
    },
    "4bitmac":function(r,g,b,a) {
      return PALETTE.lookup(PALETTE.MAC16,r,g,b,a, true /* no transparency */);
    },
    "vga":function(r,g,b,a) {
      return PALETTE.lookup(PALETTE.VGA,r,g,b,a);
    },
    "web":function(r,g,b,a) {
      return PALETTE.lookup(PALETTE.WEB,r,g,b,a);
    },
    "rgb565":function(r,g,b,a) {
      return (
        ((r&0xF8)<<8) |
        ((g&0xFC)<<3) |
        ((b&0xF8)>>3));
    },
  };
  var COL_TO_RGB = {
    "1bit":function(c) {
      return c ? 0xFFFFFFFF : 0xFF000000;
    },
    "2bitbw":function(c) {
      c = c&3;
      c = c | (c<<2) | (c<<4) | (c<<6);
      return 0xFF000000|(c<<16)|(c<<8)|c;
    },
    "4bit":function(c) {
      if (!(c&8)) return 0;
      return ((c&1 ? 0xFF0000 : 0xFF000000) |
              (c&2 ? 0x00FF00 : 0xFF000000) |
              (c&4 ? 0x0000FF : 0xFF000000));
    },
    "4bitmac":function(c) {
      return 0xFF000000|PALETTE.MAC16[c];
    },
    "vga":function(c) {
      if (c==TRANSPARENT_8BIT) return 0;
      return 0xFF000000|PALETTE.VGA[c];
    },
    "web":function(c) {
      if (c==TRANSPARENT_8BIT) return 0;
      return 0xFF000000|PALETTE.WEB[c];
    },
    "rgb565":function(c) {
      var r = (c>>8)&0xF8;
      var g = (c>>3)&0xFC;
      var b = (c<<3)&0xF8;
      return 0xFF000000|(r<<16)|(g<<8)|b;
    },
  };
  // What Espruino uses by default
  var BPP_TO_COLOR_FORMAT = {
    1 : "1bit",
    2 : "2bitbw",
    4 : "4bitmac",
    8 : "web",
    16 : "rgb565"
  };

  function clip(x) {
    if (x<0) return 0;
    if (x>255) return 255;
    return x;
  }


  /*
  See 'getOptions' for possible options
  */
  function RGBAtoString(rgba, options) {
    options = options||{};
    if (!rgba) throw new Error("No dataIn specified");
    if (!options.width) throw new Error("No Width specified");
    if (!options.height) throw new Error("No Height specified");
    if ("string"!=typeof options.diffusion)
      options.diffusion = "none";
    options.compression = options.compression || false;
    options.brightness = options.brightness | 0;
    options.mode = options.mode || "1bit";
    options.output = options.output || "object";
    options.inverted = options.inverted || false;
    options.transparent = !!options.transparent;
    var transparentCol = undefined;
    if (options.transparent) {
      if (options.mode=="4bit")
        transparentCol=0;
      if (options.mode=="vga" || options.mode=="web")
        transparentCol=TRANSPARENT_8BIT;
    }
    var bpp = COL_BPP[options.mode];
    var bitData = new Uint8Array(((options.width*options.height)*bpp+7)/8);

    function readImage() {
      var pixels = new Int32Array(options.width*options.height);
      var n = 0;
      var er=0,eg=0,eb=0;
      for (var y=0; y<options.height; y++) {
        for (var x=0; x<options.width; x++) {
          var r = rgba[n*4];
          var g = rgba[n*4+1];
          var b = rgba[n*4+2];
          var a = rgba[n*4+3];

          if (options.diffusion == "random1" ||
              options.diffusion == "errorrandom") {
            er += Math.random()*48 - 24;
            eg += Math.random()*48 - 24;
            eb += Math.random()*48 - 24;
          } else if (options.diffusion == "random2") {
            er += Math.random()*128 - 64;
            eg += Math.random()*128 - 64;
            eb += Math.random()*128 - 64;
          }
          if (options.inverted) {
            r=255-r;
            g=255-g;
            b=255-b;
          }
          r = clip(r + options.brightness + er);
          g = clip(g + options.brightness + eg);
          b = clip(b + options.brightness + eb);
          var isTransparent = a<128;

          var c = COL_FROM_RGB[options.mode](r,g,b,a);
          if (isTransparent && options.transparent && transparentCol===undefined) {
            c = -1;
            a = 0;
          }
          pixels[n] = c;
          // error diffusion
          var cr = COL_TO_RGB[options.mode](c);
          var oa = cr>>>24;
          var or = (cr>>16)&255;
          var og = (cr>>8)&255;
          var ob = cr&255;
          if (options.diffusion.startsWith("error") && a>128) {
            er = r-or;
            eg = g-og;
            eb = b-ob;
          } else {
            er = 0;
            eg = 0;
            eb = 0;
          }

          n++;
        }
      }
      return pixels;
    }
    function writeImage(pixels) {
      var n = 0;
      for (var y=0; y<options.height; y++) {
        for (var x=0; x<options.width; x++) {
          var c = pixels[n];
          // Write image data
          if (bpp==1) bitData[n>>3] |= c ? 128>>(n&7) : 0;
          else if (bpp==2) bitData[n>>2] |= c<<((3-(n&3))*2);
          else if (bpp==4) bitData[n>>1] |= c<<((n&1)?0:4);
          else if (bpp==8) bitData[n] = c;
          else if (bpp==16) { bitData[n<<1] = c>>8; bitData[1+(n<<1)] = c&0xFF; }
          else throw new Error("Unhandled BPP");
          // Write preview
          var cr = COL_TO_RGB[options.mode](c);
          if (c===transparentCol)
            cr = ((((x>>2)^(y>>2))&1)?0xFFFFFF:0); // pixel pattern
          var oa = cr>>>24;
          var or = (cr>>16)&255;
          var og = (cr>>8)&255;
          var ob = cr&255;
          if (options.rgbaOut) {
            options.rgbaOut[n*4] = or;
            options.rgbaOut[n*4+1]= og;
            options.rgbaOut[n*4+2]= ob;
            options.rgbaOut[n*4+3]=255;
          }
          n++;
        }
      }
    }

    var pixels = readImage();
    if (options.transparent && transparentCol===undefined && bpp<=16) {
      // we have no fixed transparent colour - pick one that's unused
      var colors = new Uint32Array(1<<bpp);
      // how many colours?
      for (var i=0;i<pixels.length;i++)
        if (pixels[i]>=0)
          colors[pixels[i]]++;
      // find an empty one
      for (var i=0;i<colors.length;i++)
        if (colors[i]==0) {
          transparentCol = i;
          break;
        }
      if (transparentCol===undefined) {
        console.log("No unused colour found - using 0 for transparency");
        for (var i=0;i<pixels.length;i++)
          if (pixels[i]<0)
            pixels[i]=0;
      } else {
        for (var i=0;i<pixels.length;i++)
          if (pixels[i]<0)
            pixels[i]=transparentCol;
      }
    }
    writeImage(pixels);

    var strCmd;
    if ((options.output=="string") || (options.output=="raw")) {
      var transparent = transparentCol!==undefined;
      var headerSize = transparent?4:3;
      var imgData = new Uint8Array(bitData.length + headerSize);
      imgData[0] = options.width;
      imgData[1] = options.height;
      imgData[2] = bpp + (transparent?128:0);
      if (transparent) imgData[3] = transparentCol;
      imgData.set(bitData, headerSize);
      bitData = imgData;
    }
    if (options.compression) {
      bitData = heatshrink.compress(bitData);
      strCmd = 'require("heatshrink").decompress';
    } else {
      strCmd = 'E.toArrayBuffer';
    }
    var str = "";
    for (n=0; n<bitData.length; n++)
      str += String.fromCharCode(bitData[n]);
    var imgstr;
    if (options.output=="raw") {
      imgstr = str;
    } else if (options.output=="object") {
      imgstr = "{\n";
      imgstr += "  width : "+options.width+", height : "+options.height+", bpp : "+bpp+",\n";
      if (transparentCol!==undefined) imgstr += "  transparent : "+transparentCol+",\n";
      imgstr += '  buffer : '+strCmd+'(atob("'+btoa(str)+'"))\n';
      imgstr += "}";
    } else if (options.output=="string") {
      imgstr = strCmd+'(atob("'+btoa(str)+'"))';
    } else {
      throw new Error("Unknown output style");
    }
    return imgstr;
  }

  /* Add a checkerboard background to any transparent areas and
  make everything nontransparent. expects width/height in optuons */
  function RGBAtoCheckerboard(rgba, options) {
    var n=0;
    for (var y=0; y<options.height; y++) {
      for (var x=0; x<options.width; x++) {
        var na = rgba[n*4+3]/255;
        var a = 1-na;
        var chequerboard = ((((x>>2)^(y>>2))&1)?0xFFFFFF:0);
        rgba[n*4]   = rgba[n*4]*na + chequerboard*a;
        rgba[n*4+1] = rgba[n*4+1]*na + chequerboard*a;
        rgba[n*4+2] = rgba[n*4+2]*na + chequerboard*a;
        rgba[n*4+3] = 255;
        n++;
      }
    }
  }

  /* RGBAtoString options, PLUS:

  updateCanvas: update canvas with the quantized image
  */
  function canvastoString(canvas, options) {
    options = options||{};
    options.width = canvas.width;
    options.height = canvas.height;
    var ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, options.width, options.height);
    var rgba = imageData.data;
    if (options.updateCanvas)
      options.rgbaOut = rgba;
    var str = RGBAtoString(rgba, options);
    if (options.updateCanvas)
      ctx.putImageData(imageData,0,0);
    return str;
  }

  /* RGBAtoString options, PLUS:

  */
  function imagetoString(img, options) {
    options = options||{};
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);
    return canvastoString(canvas, options);
  }

  function getOptions() {
    return {
      width : "int",
      height : "int",
      rgbaOut : "Uint8Array", //  to store quantised data
      diffusion : ["none"],
      compression : "bool",
      transparent : "bool",
      brightness : "int",
      mode : Object.keys(COL_BPP),
      output : ["object","string","raw"],
      inverted : "bool",
    }
  }

  /* Decode an Espruino image string into a URL, return undefined if it's not valid.
  options =  {
    transparent : bool // should the image be transparent, or just chequered where transparent?
  } */
  function stringToImageURL(data, options) {
    options = options||{};
    var p = 0;
    var width = 0|data.charCodeAt(p++);
    var height = 0|data.charCodeAt(p++);
    var bpp = 0|data.charCodeAt(p++);
    var transparentCol = -1;
    if (bpp&128) {
      bpp &= 127;
      transparentCol = 0|data.charCodeAt(p++);
    }
    var mode = BPP_TO_COLOR_FORMAT[bpp];
    if (!mode) return undefined; // unknown format
    var bitmapSize = ((width*height*bpp)+7) >> 3;
    // If it's the wrong length, it's not a bitmap or it's corrupt!
    if (data.length != p+bitmapSize)
      return undefined;
    // Ok, build the picture
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, width, height);
    var rgba = imageData.data;
    var no = 0;
    var nibits = 0;
    var nidata = 0;
    for (var i=0;i<width*height;i++) {
      while (nibits<bpp) {
        nidata = (nidata<<8) | data.charCodeAt(p++);
        nibits += 8;
      }
      var c = (nidata>>(nibits-bpp)) & ((1<<bpp)-1);
      nibits -= bpp;
      var cr = COL_TO_RGB[mode](c);
      if (c == transparentCol)
        cr = cr & 0xFFFFFF;
      rgba[no++] = (cr>>16)&255; // r
      rgba[no++] = (cr>>8)&255; // g
      rgba[no++] = cr&255; // b
      rgba[no++] = cr>>>24; // a
    }
    if (!options.transparent)
      RGBAtoCheckerboard(rgba, {width:width, height:height});
    ctx.putImageData(imageData,0,0);
    return canvas.toDataURL();
  }

// decode an Espruino image string into an HTML string, return undefined if it's not valid. See stringToImageURL
  function stringToImageHTML(data, options) {
    var url = stringToImageURL(data, options);
    if (!url) return undefined;
    return '<img src="'+url+'"\>';
  }

  // =======================================================
  return {
    RGBAtoString : RGBAtoString,
    RGBAtoCheckerboard : RGBAtoCheckerboard,
    canvastoString : canvastoString,
    imagetoString : imagetoString,
    getOptions : getOptions,

    stringToImageHTML : stringToImageHTML,
    stringToImageURL : stringToImageURL
  };
}));
