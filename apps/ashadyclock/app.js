let drawTimeout;
// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

let images = new Array(10);
for (i=0;i<10;i++) {
  let image = 
  {
    width : 98, height : 100, bpp : 3,
    transparent: 4,
    buffer : require("Storage").read("ashadyclock." + i + ".bin")
  };
  images[i] = image;
}

let palBottom =  new Uint16Array(E.toArrayBuffer(E.toFlatString(new Uint16Array([
  g.toColor("#000"),
  g.toColor("#000"),
  g.toColor("#F00"),
  g.toColor("#FF0"),
  g.toColor("#00F"),
  g.toColor("#000"),
  g.toColor("#FF0"),
  g.toColor("#000")
  ]).buffer)));

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

function draw() {

  // work out how to display the current time
  let d = new Date();
  
  g.setColor(0,0,0);
  g.fillRect(0,0,g.getWidth(),g.getHeight());

  let xOffset = (g.getWidth() - 176) / 2;
  let yOffset = (g.getWidth() - 176) / 2;
  
  let imgUR = images[d.getMinutes() % 10];
  let imgUL = images[Math.floor(d.getMinutes()/10)];  
  imgUR.palette = palBottom;
  imgUL.palette = palBottom; 
  g.drawImage(imgUR, 75 + xOffset, 77 + yOffset);
  g.drawImage(imgUL, 0 + xOffset, 77 + yOffset);
  
  let imgOR = images[d.getHours() % 10];
  let imgOL = images[Math.floor(d.getHours()/10)]; 
  imgOR.palette = palTop;
  imgOL.palette = palTop;   
  g.drawImage(imgOR, 75  + xOffset, 0 + yOffset);
  g.drawImage(imgOL, 0  + xOffset, 0 + yOffset);

  queueDraw();
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();

// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
