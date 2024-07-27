#!/usr/bin/node
// Used for apps/fontsall/etc
// Needs 'npm install pngjs'

var FONTFILE = "unifont-15.1.05.png";

console.log("Espruino Font Creator");
console.log("---------------------");
console.log("");

let fontconverter = require("../webtools/fontconverter.js");
let charCodeRanges = fontconverter.getRanges();
console.log("Available char code ranges\n  - "+Object.keys(charCodeRanges).join("\n  - "));


if (process.argv.length!=4) {
  console.log(process.argv,"");
  console.log("USAGE:");
  console.log("  font_creator 'CharCodeRange' outputfile.pbf");
  process.exit(1);
}
let charCodeRange = process.argv[2];
let outputFile = process.argv[3];

if (!(charCodeRange in charCodeRanges)) {
  console.log("Char code range "+charCodeRange+" not found");
  process.exit(1);
}

if (!require("fs").existsSync(FONTFILE)) {
  console.log("Unifont file "+FONTFILE+" not found!")
  console.log("Download from https://unifoundry.com/unifont/index.html and convert to png")
  process.exit(1);
}

// load a unifont PNG file
let font = fontconverter.load({
  fn : FONTFILE,
  mapWidth : 256, mapHeight : 256,
  mapOffsetX : 32, mapOffsetY : 64,
  height : 16, // actual used height of font map
  range : charCodeRanges[charCodeRange].range
});
/*let font = fontconverter.load({
  fn : "fontname.bdf",
});*/
font.removeUnifontPlaceholders();
// quick hack as space looks too long
font.glyphs[32].width -= 4;
font.glyphs[32].xEnd -= 4;
font.glyphs[32].advance -= 4;

/* Another hack - because these are centered in the image
they often don't start at the beginning of the char space.
Move them all back and add 1px at the end */
font.glyphs.forEach(g => {
  if (g.xStart>0) {
    var shift = g.xStart;
    g.xStart -= shift;
    g.xEnd -= shift;
    g.advance = g.xEnd+2;
    g.oldGetPixel = g.getPixel;
    g.getPixel = (x,y) => g.oldGetPixel(x+shift,y);
    //g.debug();
    //console.log(g);
    console.log();
  }
});

/*var g = font.glyphs[":".charCodeAt()];
g.debug();
console.log(g);*/
font.debugChars();
require("fs").writeFileSync(outputFile, Buffer.from(font.getPBF()));
//console.log(font.getJS());
