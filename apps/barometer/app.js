var center = {
  x: g.getWidth()/2,
  y: g.getHeight()/2,
};

var MIN = 940;
var MAX = 1090;
var NUMBER_OF_VALUES = MAX - MIN;
var SCALE_TICK_STEP = 5;
var SCALE_VALUES_STEP = 25;
var NUMBER_OF_LABELS = NUMBER_OF_VALUES / SCALE_VALUES_STEP;
var NUMBER_OF_TICKS = NUMBER_OF_VALUES / SCALE_TICK_STEP;
var ZERO_OFFSET = (Math.PI / 4) * 3;
var SCALE_SPAN = (Math.PI / 2) * 3;
var TICK_LENGTH = 10;
var HAND_LENGTH = 45;
var HAND_WIDTH = 5;

function generatePoly(radius, width, angle){
  var x = center.x + Math.cos(angle) * radius;
  var y = center.y + Math.sin(angle) * radius;
  var d = {
    x: width/2 * Math.cos(angle + Math.PI/2),
    y: width/2 * Math.sin(angle + Math.PI/2),
  };
  
  var poly = [center.x - d.x, center.y - d.y, center.x + d.x, center.y + d.y, x + d.x, y + d.y, x - d.x, y - d.y];
  
  return poly;
}

function drawHand(value){
  g.setColor(g.theme.fg2);
  
  g.setFontAlign(0,0);
  g.setFont("Vector",15);
  g.drawString(value, center.x, center.y * 2 - 15, true);

  var angle = SCALE_SPAN / NUMBER_OF_VALUES * (value - MIN) + ZERO_OFFSET;
  g.fillPoly(generatePoly(HAND_LENGTH, HAND_WIDTH, angle), true);
  g.fillCircle(center.x ,center.y, 4);
}


function drawTicks(){
  g.setColor(g.theme.fg);
  for(let i= 0; i <= NUMBER_OF_TICKS; i++){
    var angle = (i * (SCALE_SPAN/NUMBER_OF_TICKS)) + ZERO_OFFSET;

    var tickWidth = i%5==0 ? 5 : 2;
    g.fillPoly(generatePoly(center.x, tickWidth, angle), true);
  }
  
  g.setColor(g.theme.bg);
  g.fillCircle(center.x,center.y,center.x - TICK_LENGTH);
}


function drawScaleLabels(){
  g.setColor(g.theme.fg);
  g.setFont("Vector",12);
  g.setFontAlign(-1,-1);

  let label = MIN;
  for (let i=0;i <= NUMBER_OF_LABELS; i++){
    var angle = (i * (SCALE_SPAN/NUMBER_OF_LABELS)) + ZERO_OFFSET;
    var labelDimensions = g.stringMetrics(label);

    var LABEL_PADDING = 5;
    var radius = center.x - TICK_LENGTH - LABEL_PADDING;
    var x = center.x + Math.cos(angle) * radius;
    var y = center.y + Math.sin(angle) * radius;

    var visualX = x > center.x ? x - labelDimensions.width : x + labelDimensions.width > center.x ? x - (labelDimensions.width / 2) : x;
    var visualY = y >= center.y - labelDimensions.height / 2 ? y - labelDimensions.height / 2 : y;

    g.drawString(label, visualX, visualY);

    label += SCALE_VALUES_STEP;
  }
}

function drawIcons() {
  var sunIcon = {
    width : 24, height : 24, bpp : 1,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("gEYAQ0IgEQjkAnEMv0wgH/gEB4eAgcA4EHgHgg0AsHmgFnAQQICBwQUCDQQgCEwQsCGQQ+IA"))
  };
  g.drawImage(sunIcon, center.x + 15, center.y - 12);
  
  var sunRainIcon = {
    width : 24, height : 24, bpp : 1,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("AAeAAQmEgEQhEAhIIBg1ggEEj8AhEw4HokFAglAnEGoEGgHAgcRgEBkQCBgQCBgcAgUBwARBv/4HAcgiAFDCoIAC"))
  };
  g.drawImage(sunRainIcon, center.x - 12, 30);
  
  var rainIcon = {
    width : 24, height : 24, bpp : 1,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("AA0gAQPMgEBgUAgQCCgPwAgMYj0AhkQgEECwICGBYMIj//+ArFgURwAqBB4NEgEQghAJ"))
  };
  g.drawImage(rainIcon, center.x - 44, center.y - 12);
}

g.setBgColor(g.theme.bg);

try {
  function baroHandler(data) {
    g.clear();

    drawTicks();
    drawScaleLabels();
    drawIcons();
    if (data!==undefined) {
      drawHand(Math.round(data.pressure));
    }
  }
  Bangle.getPressure().then(baroHandler);
  setInterval(() => Bangle.getPressure().then(baroHandler), 1000);
} catch(e) {
  if (e !== undefined) {
    print(e.message);
  }
  print("barometer not supported, show a demo value");
  drawHand(MIN);
}

Bangle.setUI({
  mode : "custom",
  back : function() {load();}
});
