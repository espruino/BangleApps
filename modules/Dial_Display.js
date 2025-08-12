let dialDisplayGenerator = function(options) {
  "ram";
  const SCREEN_W = g.getWidth();
  const SCREEN_H = g.getHeight();

  options = Object.assign(
    { stepsPerWholeTurn : 7, // 7 chosen as it felt the best in use.
      dialRect : {
        x: 0,
        y: 0,
        w: SCREEN_W,
        h: SCREEN_H,
      },
    }, options);

  const DIAL_RECT = options.dialRect;

  const CENTER = {
    x: DIAL_RECT.x + DIAL_RECT.w / 2,
    y: DIAL_RECT.y + DIAL_RECT.h / 2,
  };

  let dialDisplay = function(step, value) {
    let prevValue = this.value;
    if (value) this.value = value;
    if (!this.value) this.value = 0;
    if (this.isFirstDraw===undefined) this.isFirstDraw = true;
    this.value += step;
    //g.setFont("Vector:30");
    //g.drawString(this.value);

    let drawCircle = (value, R, G, B, rad, isFill)=>{
      let x = CENTER.x+27*Math.sin(value*(2*Math.PI/options.stepsPerWholeTurn));
      let y = CENTER.y-27*Math.cos(value*(2*Math.PI/options.stepsPerWholeTurn));
      g.setColor(R,G,B)
      if (!isFill) g.drawCircle(x, y, rad);
      if (isFill) g.fillCircle(x, y, rad);
    }
    if (this.isFirstDraw) {
      g.clear();
      g.setColor(1,1,1).drawCircle(CENTER.x, CENTER.y, 25);
      for (let i=0; i<options.stepsPerWholeTurn; i++) {
        drawCircle(i, 1, 1, 1, 1, true);
      }
      this.isFirstDraw = false;
    }

    //drawCircle(this.value, 1, 1, 1, 2, false);
    //drawCircle(prevValue, 0, 0, 0, 2, false);
    g.setColor(1,1,1).drawLine(CENTER.x, CENTER.y, CENTER.x+23*Math.sin(this.value*(2*Math.PI/options.stepsPerWholeTurn)), CENTER.y-23*Math.cos(this.value*(2*Math.PI/options.stepsPerWholeTurn)));
    g.setColor(0,0,0).drawLine(CENTER.x, CENTER.y, CENTER.x+23*Math.sin(prevValue*(2*Math.PI/options.stepsPerWholeTurn)), CENTER.y-23*Math.cos(prevValue*(2*Math.PI/options.stepsPerWholeTurn)));
    g.setColor(0,0,0).fillCircle(CENTER.x, CENTER.y, 9);

    return this.value;
  }
  return dialDisplay;
}

exports = dialDisplayGenerator;
