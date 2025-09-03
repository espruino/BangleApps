(() => {
  function draw() {
    const BANGLEJS2 = process.env.HWVERSION==2;
    g.reset();
    var m = process.memory();
    var percent = Math.round(m.usage*100/m.total);
    g.drawImage(atob("BwgBqgP////AVQ=="), this.x+(24-7)/2, this.y+4);
    if (!BANGLEJS2)
      g.setColor(percent>70 ? "#ff0000" : (percent>50 ? "#ffff00" : "#ffffff"));
    else
      
      g.setColor(percent>70 ? "#f00" : (percent>50 ? (g.theme.dark ? "#0ff" : "#00f") : "#0f0"));
    g.setFont("6x8").setFontAlign(0,0).drawString(percent+"%", this.x+12, this.y+20, true/*solid*/);
  }
  var ramInterval;
  Bangle.on('lcdPower', function(on) {
    if (on) {
      WIDGETS["ram"].draw();
      if (!ramInterval) ramInterval = setInterval(()=>WIDGETS["ram"].draw(), 10000);
    } else {
      if (ramInterval) {
        clearInterval(ramInterval);
        ramInterval = undefined;
      }
    }
  });
  WIDGETS["ram"]={area:"tl",width: 24,draw:draw};
})();
