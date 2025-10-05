function DialDisplay(options) {
  const SCREEN_W = g.getWidth();
  const SCREEN_H = g.getHeight();

  this.options = Object.assign(
    {
      stepsPerWholeTurn : 7, // 7 chosen as it felt the best in use.
      dialRect : {
        x: 0,
        y: 0,
        w: SCREEN_W,
        h: SCREEN_H,
      },
    }, options);

  this.value = 0;
  this.isFullDraw = true;
}

DialDisplay.prototype.queueRedraw = function() {
  this.isFullDraw = true;
  this.prevDrawnValue = null;
};

DialDisplay.prototype.set = function(value) {
  this.value = value;
};

DialDisplay.prototype.step = function(step) {
  "ram";
  this.value += step;
  //g.setFont("Vector:30");
  //g.drawString(this.value);

  const DIAL_RECT = this.options.dialRect;

  const CENTER = {
    x: DIAL_RECT.x + DIAL_RECT.w / 2,
    y: DIAL_RECT.y + DIAL_RECT.h / 2,
  };

  let drawCircle = (value, R, G, B, rad, isFill)=>{
    let x = CENTER.x+27*Math.sin(value*(2*Math.PI/this.options.stepsPerWholeTurn));
    let y = CENTER.y-27*Math.cos(value*(2*Math.PI/this.options.stepsPerWholeTurn));
    g.setColor(R,G,B)
    if (!isFill) g.drawCircle(x, y, rad);
    if (isFill) g.fillCircle(x, y, rad);
  }
  if (this.isFullDraw) {
    g.setColor(0,0,0).fillCircle(CENTER.x, CENTER.y, 25);
    g.setColor(1,1,1).drawCircle(CENTER.x, CENTER.y, 25);
    for (let i=0; i<this.options.stepsPerWholeTurn; i++) {
      drawCircle(i, 1, 1, 1, 1, true);
    }
    this.isFullDraw = false;
  }

  //drawCircle(this.value, 1, 1, 1, 2, false);
  //drawCircle(prevValue, 0, 0, 0, 2, false);
  g.setColor(0,0,0).drawLine(CENTER.x, CENTER.y, CENTER.x+23*Math.sin(this.prevDrawnValue*(2*Math.PI/this.options.stepsPerWholeTurn)), CENTER.y-23*Math.cos(this.prevDrawnValue*(2*Math.PI/this.options.stepsPerWholeTurn)));
  g.setColor(1,1,1).drawLine(CENTER.x, CENTER.y, CENTER.x+23*Math.sin(this.value*(2*Math.PI/this.options.stepsPerWholeTurn)), CENTER.y-23*Math.cos(this.value*(2*Math.PI/this.options.stepsPerWholeTurn)));
  g.setColor(0,0,0).fillCircle(CENTER.x, CENTER.y, 9);

  this.prevDrawnValue = this.value;
};

exports = DialDisplay;
