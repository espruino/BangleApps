#!/bin/node
/*
  Takes language files that have been written with unicode chars that Bangle.js cannot render
  with its built-in fonts, and pre-render them.
*/

//const FONT_SIZE = 18;
//const FONT_NAME = 'Sans';
const FONT_SIZE = 16; // 12pt
const FONT_NAME = '"Unifont Regular"'; // or just 'Sans'

var createCanvas, registerFont;
try {
  createCanvas = require("canvas").createCanvas;
  registerFont = require("canvas").registerFont;
} catch(e) {
  console.log("ERROR: needc canvas library");
  console.log("Try: npm install canvas");
  process.exit(1);
}
// Use font from https://unifoundry.com/unifont/ as it scales well at 16px high
registerFont(__dirname+'/unifont-15.0.01.ttf', { family: 'Unifont Regular' })

var imageconverter  = require(__dirname+"/../webtools/imageconverter.js");

const canvas = createCanvas(200, 20)
const ctx = canvas.getContext('2d')

function renderText(txt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = FONT_SIZE+'px '+FONT_NAME;
  ctx.fillStyle = "white";
  ctx.fillText(txt, 0, FONT_SIZE);
  var str = imageconverter.canvastoString(canvas, { autoCrop:true, output:"raw", mode:"1bit", transparent:true } );
  // for testing: 
//  console.log(txt);
//  console.log("g.drawImage(",imageconverter.canvastoString(canvas, { autoCrop:true, output:"string", mode:"1bit" } ),");");
//  process.exit(1);
  return "\0"+str;
}

function renderLangFile(file) {
  var fileIn = __dirname + "/../lang/unicode-based/"+file;
  var fileOut = __dirname + "/../lang/"+file;
  console.log("Reading",fileIn);
  var inJSON = JSON.parse(require("fs").readFileSync(fileIn));
  var outJSON = { "// created with bin/language_render.js" : ""};
  for (var categoryName in inJSON) {
    if (categoryName.includes("//")) continue;
    var category = inJSON[categoryName];
    outJSON[categoryName] = {};
    for (var english in category) {
      if (english.includes("//")) continue;
      var translated = category[english];
      //console.log(english,"=>",translated);
      outJSON[categoryName][english] = renderText(translated);
    }
  }
  require("fs").writeFileSync(fileOut, JSON.stringify(outJSON,null,2));
  console.log("Written",fileOut);
}


renderLangFile("ja_JA.json");
