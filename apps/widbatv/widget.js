Bangle.on('charging',function(charging) {
  if(charging) Bangle.buzz();
  WIDGETS["batv"].draw();
});
setInterval(()=>WIDGETS["batv"].draw(), 60000);
Bangle.on('lcdPower', function(on) {
  if (on) WIDGETS["batv"].draw(); // refresh at power on
});
WIDGETS["batv"]={area:"tr",width:14,draw:function() {
  var x = this.x, y = this.y;
  g.reset();
  if (Bangle.isCharging()) {
    g.setColor("#0f0").drawImage(atob("DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),x,y);
  } else {
    g.clearRect(x,y,x+14,y+23);
    g.setColor(g.theme.fg).fillRect(x+2,y+2,x+12,y+22).clearRect(x+4,y+4,x+10,y+20).fillRect(x+5,y+1,x+9,y+2);
    var battery = E.getBattery();
    if (battery < 20) {g.setColor("#f00");}
    else if (battery < 40) {g.setColor(g.theme.dark ? "#ff0" : "#f80");}
    else {g.setColor("#0f0");}
    g.fillRect(x+4,y+20-(E.getBattery()*16/100),x+10,y+20);
  }
}};
