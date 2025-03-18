(() => {
  const h=24, // widget height
        w=3,  // width of single bar
        bars=3; // number of bars

  // Note: HRM/temperature are commented out (they didn't seem very useful)
  //       If re-adding them, also adjust `bars`

  // ==HRM start==
  // // We show HRM if available, but don't turn it on
  // let bpm,rst,con=10; // always ignore HRM with confidence below 10%
  // function noHrm() { // last value is no longer valid
  //   if (rst) clearTimeout(rst);
  //   rst=bpm=undefined; con=10;
  //   WIDGETS["bars"].draw();
  // }
  // Bangle.on('HRM', hrm=>{
  //   if (hrm.confidence>con || hrm.confidence>=80) {
  //     bpm=hrm.confidence;
  //     con=hrm.confidence;
  //     WIDGETS["bars"].draw();
  //     if (rst) clearTimeout(rst);
  //     rst = setTimeout(noHrm, 10*60*1000); // forget HRM after 10 minutes
  //   }
  // });
  // ==HRM end==

  /**
   * Draw a bar
   *
   * @param {int} x left
   * @param {int} y top (of full bar)
   * @param {string} col Color
   * @param {number} f Fraction of bar to draw
   */
  function bar(x,y, col,f) {
    if (!f)  f = 0; // for f=NaN: set it to 0 -> don't even draw the bottom pixel
    if (f>1) f = 1;
    if (f<0) f = 0;
    const top = Math.round((h-1)*(1-f));
    // use Math.min/max to make sure we stay within widget boundaries for f=0/f=1
    if (top) g             .clearRect(x,y,     x+w-1,y+top-1); // erase above bar
    if (f)   g.setColor(col).fillRect(x,y+top, x+w-1,y+h-1);   // even for f=0.001 this is still 1 pixel high
  }
  let batColor=Bangle.isCharging()?'#ff0':'#0f0';
  function draw() {
    g.reset();
    const x = this.x, y = this.y,
      m = process.memory(false);
    let b=0;
    // ==HRM==         bar(x+(w*b++),y,'#f00'/*red    */,bpm/200); // >200 seems very unhealthy; if we have no valid bpm this will just be empty space
    // ==Temperature== bar(x+(w*b++),y,'#ff0'/*yellow */,E.getTemperature()/50); // you really don't want to wear a watch that's hotter than 50°C
    bar(x+(w*b++),y,g.theme.dark?'#0ff':'#00f'/*cyan/blue*/,1-(require('Storage').getFree() / process.env.STORAGE));
    bar(x+(w*b++),y,'#f0f'/*magenta*/,m.usage/m.total);
    bar(x+(w*b++),y,batColor,E.getBattery()/100);
  }

  let redraw;
  Bangle.on('charging', function(charging) {
    batColor=charging?'#ff0':'#0f0';
    WIDGETS["bars"].draw();
  });
  
  Bangle.on('lcdPower', on => {
    if (redraw) clearInterval(redraw)
    redraw = undefined;
    if (on) {
      WIDGETS["bars"].draw();
      redraw = setInterval(()=>WIDGETS["bars"].draw, 10*1000); // redraw every 10 seconds
    }
  });
  WIDGETS["bars"]={area:"tr",width: bars*w,draw:draw};
})()
