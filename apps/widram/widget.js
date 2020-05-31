(() => {
  function draw() {
    g.reset();
    var m = process.memory();
    var pc = Math.round(m.usage*100/m.total);
    g.drawImage(atob("BwgBqgP////AVQ=="), this.x+(24-7)/2, this.y+4);
    g.setColor(pc>70 ? "#ff0000" : (pc>50 ? "#ffff00" : "#ffffff"));
    g.setFont("6x8").setFontAlign(0,0).drawString(pc+"%", this.x+12, this.y+20, true/*solid*/);
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
})()
