const c = {
  x: g.getWidth()/2,
  y: g.getHeight()/2,
};

const MIN = 940;
const MAX = 1090;
const NUMBER_OF_VALUES = MAX - MIN;
const SCALE_TICK_STEP = 5;
const SCALE_VALUES_STEP = 25;
const NUMBER_OF_LABELS = NUMBER_OF_VALUES / SCALE_VALUES_STEP;
const NUMBER_OF_TICKS = NUMBER_OF_VALUES / SCALE_TICK_STEP;
const ZERO_OFFSET = (Math.PI / 4) * 3;
const SCALE_SPAN = (Math.PI / 2) * 3;

const TICK_LENGTH = 10;

function generatePoly(radius, width, angle){
  const x = c.x + Math.cos(angle) * radius;
  const y = c.y + Math.sin(angle) * radius;
  const d = {
    x: width/2 * Math.cos(angle + Math.PI/2),
    y: width/2 * Math.sin(angle + Math.PI/2),
  };
  
  const poly = [c.x - d.x, c.y - d.y, c.x + d.x, c.y + d.y, x + d.x, y + d.y, x - d.x, y - d.y];
  
  return poly;
}

function drawHand(value){
  const HAND_LENGTH = 45;
  const HAND_WIDTH = 5;

  g.setColor(256, 0, 0);
  
  g.setFontAlign(0,0);
  g.setFont("Vector",15);
  g.drawString(value, c.x, c.y * 2 - 15, true);

  const angle = SCALE_SPAN / NUMBER_OF_VALUES * (value - MIN) + ZERO_OFFSET;
  g.fillPoly(generatePoly(HAND_LENGTH, HAND_WIDTH, angle), true);
  g.fillCircle(c.x ,c.y, 4);
}


function drawTicks(){
  g.setColor(1,1,1);
  for(let i= 0; i <= NUMBER_OF_TICKS; i++){
    const angle = (i * (SCALE_SPAN/NUMBER_OF_TICKS)) + ZERO_OFFSET;

    const tickWidth = i%5==0 ? 5 : 2;
    g.fillPoly(generatePoly(c.x, tickWidth, angle), true);
  }
  
  g.setColor(0,0,0);
  g.fillCircle(c.x,c.y,c.x - TICK_LENGTH);
}


function drawScaleLabels(){
  g.setColor(1,1,1);
  g.setFont("Vector",12);

  let label = MIN;
  for (let i=0;i <= NUMBER_OF_LABELS; i++){
    const angle = (i * (SCALE_SPAN/NUMBER_OF_LABELS)) + ZERO_OFFSET;
    const labelDimensions = g.stringMetrics(label);

    const LABEL_PADDING = 5;
    const radius = c.x - TICK_LENGTH - LABEL_PADDING;
    const x = c.x + Math.cos(angle) * radius;
    const y = c.y + Math.sin(angle) * radius;

    const visualX = x > c.x ? x - labelDimensions.width : x + labelDimensions.width > c.x ? x - (labelDimensions.width / 2) : x;
    const visualY = y >= c.y - labelDimensions.height / 2 ? y - labelDimensions.height / 2 : y;

    g.drawString(label, visualX, visualY);

    label += SCALE_VALUES_STEP;
  }
}


g.setBgColor(0,0,0);
g.clear();

drawTicks();
drawScaleLabels();

const sunIcon = {
  width : 24, height : 24, bpp : 4,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AAkP+ALeA40PAYf/BYv/CYYLBBwIICCQ4ACHI4ICEIgkEAg48GDApcFAoYPBBY5NDBZIjLHZpTLNZiDKTZSzMZZT7iA="))
};
g.drawImage(sunIcon, c.x + 15, c.y - 12);

const sunRainIcon = {
  width : 24, height : 24, bpp : 4,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AB/wBbEPBAoGEDI/wh4jJBQIMJEgUP///IpAJCBgf/+ALCAQRJFAoIHECgI7FIYwSEHAoGBEQwsEDIJdHCYYLLFwwTEQQwGFQQQACYpYpLf0AAEA"))
};
g.drawImage(sunRainIcon, c.x - 12, 30);

const rainIcon = {
  width : 24, height : 24, bpp : 4,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("ADnwBRP/AIQAGh4ZKA4YLLh//EwoTFh4GCCIIfGDAQ5DIQ5bIBbQvII4gAGWLwzBOoarLCw4RKLBAAgA"))
};
g.drawImage(rainIcon, c.x - 44, c.y - 12);

Bangle.getPressure().then(data => {
  drawHand(Math.round(data.pressure));
});

// Show launcher when middle button pressed
Bangle.setUI("clock");
