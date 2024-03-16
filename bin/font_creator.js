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
font.removeUnifontPlaceholders();
// quick hack as space looks too long
font.glyphs[32].width -= 3;
font.glyphs[32].xEnd -= 3;
font.glyphs[32].advance -= 3;
//font.debugChars();
require("fs").writeFileSync(outputFile, Buffer.from(font.getPBF()));