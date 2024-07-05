var settings = Object.assign({
  // default values
  showWidgets: false,
  alternativeColor: false,
}, require('Storage').readJSON("ashadyclock.json", true) || {});

let drawTimeout;
// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

let palBottom;
if (settings.alternativeColor) {
  palBottom =  new Uint16Array(E.toArrayBuffer(E.toFlatString(new Uint16Array([
    g.toColor("#000"),
    g.toColor("#000"),
    g.toColor("#0FF"),
    g.toColor("#0FF"),
    g.toColor("#00F"),
    g.toColor("#000"),
    g.toColor("#00F"),
    g.toColor("#000")
    ]).buffer)));
} else {
  palBottom =  new Uint16Array(E.toArrayBuffer(E.toFlatString(new Uint16Array([
    g.toColor("#000"),
    g.toColor("#000"),
    g.toColor("#F00"),
    g.toColor("#FF0"),
    g.toColor("#00F"),
    g.toColor("#000"),
    g.toColor("#FF0"),
    g.toColor("#000")
    ]).buffer)));
}

let palTop = new Uint16Array(E.toArrayBuffer(E.toFlatString(new Uint16Array([
  g.toColor("#FFF"),
  g.toColor("#000"),
  g.toColor("#FFF"),
  g.toColor("#FFF"),
  g.toColor("#00F"),
  g.toColor("#000"),
  g.toColor("#FFF"),
  g.toColor("#000"),
  ]).buffer)));

let xOffset = (g.getWidth() - 176) / 2;
let yOffset = (g.getHeight() - 176) / 2;

function drawTop(d0, d1) {  
  if (settings.showWidgets && g.getHeight()<=176) {
    drawNumber(d1, 82  + xOffset, 24 + yOffset, palTop, {scale: 0.825});
    drawNumber(d0, 13  + xOffset, 24 + yOffset, palTop, {scale: 0.825});
  } else {
    drawNumber(d1, 80, 0, palTop);
    drawNumber(d0, -1, 0, palTop);    
  }  
}

function drawBottom(d0, d1) {  
  if (settings.showWidgets && g.getHeight()<=176) {
    drawNumber(d1, 82  + xOffset, 92 + yOffset, palBottom, {scale: 0.825});
    drawNumber(d0, 13  + xOffset, 92 + yOffset, palBottom, {scale: 0.825});
  } else {
    drawNumber(d1, 80, 75, palBottom);
    drawNumber(d0, -1, 75, palBottom);    
  }   
}

function drawNumber(number, x, y, palette, options) {
  let image = 
  {
    width : 98, height : 100, bpp : 3,
    transparent: 4,
    buffer : require("Storage").read("ashadyclock." + number +".bin")
  };
  image.palette = palette;
  g.drawImage(image, x, y, options);
}

function draw() {
  let d = new Date();  
  g.clearRect(0, settings.showWidgets ? 24 : 0, g.getWidth(),g.getHeight());

  drawBottom(Math.floor(d.getMinutes()/10), d.getMinutes() % 10);
  drawTop(Math.floor(d.getHours()/10), d.getHours() % 10);

  queueDraw();
}

g.clear();
// draw immediately at first
draw();

// Show launcher when middle button pressed
Bangle.setUI("clock");

if(settings.showWidgets) {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
