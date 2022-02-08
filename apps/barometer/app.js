const center = {
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
const HAND_LENGTH = 45;
const HAND_WIDTH = 5;

function generatePoly(radius, width, angle){
  const x = center.x + Math.cos(angle) * radius;
  const y = center.y + Math.sin(angle) * radius;
  const d = {
    x: width/2 * Math.cos(angle + Math.PI/2),
    y: width/2 * Math.sin(angle + Math.PI/2),
  };
  
  const poly = [center.x - d.x, center.y - d.y, center.x + d.x, center.y + d.y, x + d.x, y + d.y, x - d.x, y - d.y];
  
  return poly;
}

function drawHand(value){
  g.setColor(256, 0, 0);
  
  g.setFontAlign(0,0);
  g.setFont("Vector",15);
  g.drawString(value, center.x, center.y * 2 - 15, true);

  const angle = SCALE_SPAN / NUMBER_OF_VALUES * (value - MIN) + ZERO_OFFSET;
  g.fillPoly(generatePoly(HAND_LENGTH, HAND_WIDTH, angle), true);
  g.fillCircle(center.x ,center.y, 4);
}


function drawTicks(){
  g.setColor(1,1,1);
  for(let i= 0; i <= NUMBER_OF_TICKS; i++){
    const angle = (i * (SCALE_SPAN/NUMBER_OF_TICKS)) + ZERO_OFFSET;

    const tickWidth = i%5==0 ? 5 : 2;
    g.fillPoly(generatePoly(center.x, tickWidth, angle), true);
  }
  
  g.setColor(0,0,0);
  g.fillCircle(center.x,center.y,center.x - TICK_LENGTH);
}


function drawScaleLabels(){
  g.setColor(1,1,1);
  g.setFont("Vector",12);

  let label = MIN;
  for (let i=0;i <= NUMBER_OF_LABELS; i++){
    const angle = (i * (SCALE_SPAN/NUMBER_OF_LABELS)) + ZERO_OFFSET;
    const labelDimensions = g.stringMetrics(label);

    const LABEL_PADDING = 5;
    const radius = center.x - TICK_LENGTH - LABEL_PADDING;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;

    const visualX = x > center.x ? x - labelDimensions.width : x + labelDimensions.width > center.x ? x - (labelDimensions.width / 2) : x;
    const visualY = y >= center.y - labelDimensions.height / 2 ? y - labelDimensions.height / 2 : y;

    g.drawString(label, visualX, visualY);

    label += SCALE_VALUES_STEP;
  }
}

function drawIcons() {
  const sunIcon = {
    width : 24, height : 24, bpp : 4,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("AAkP+ALeA40PAYf/BYv/CYYLBBwIICCQ4ACHI4ICEIgkEAg48GDApcFAoYPBBY5NDBZIjLHZpTLNZiDKTZSzMZZT7iA="))
  };
  g.drawImage(sunIcon, center.x + 15, center.y - 12);
  
  const sunRainIcon = {
    width : 24, height : 24, bpp : 4,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("AB/wBbEPBAoGEDI/wh4jJBQIMJEgUP///IpAJCBgf/+ALCAQRJFAoIHECgI7FIYwSEHAoGBEQwsEDIJdHCYYLLFwwTEQQwGFQQQACYpYpLf0AAEA"))
  };
  g.drawImage(sunRainIcon, center.x - 12, 30);
  
  const rainIcon = {
    width : 24, height : 24, bpp : 4,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("ADnwBRP/AIQAGh4ZKA4YLLh//EwoTFh4GCCIIfGDAQ5DIQ5bIBbQvII4gAGWLwzBOoarLCw4RKLBAAgA"))
  };
  g.drawImage(rainIcon, center.x - 44, center.y - 12);
}

g.setBgColor(0,0,0);
g.clear();

drawTicks();
drawScaleLabels();
drawIcons();

try {
  Bangle.getPressure().then(data => {
    drawHand(Math.round(data.pressure));
  });
} catch(e) {
  print(e.message);
  print("barometer not supporter, show a demo value");
  drawHand(MIN);
}
