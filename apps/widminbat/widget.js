(function(){
  function getWidth() {
    return E.getBattery() <= 30 ? 40 : 0;
  }
  WIDGETS.minbat={area:"tr",width:getWidth(),draw:function() {
    if(this.width < 40) return;
    var s = 39;
    var bat = E.getBattery();
    var x = this.x, y = this.y;
    g.reset();
    g.setColor(g.theme.fg).fillRect(x,y+2,x+s-4,y+21).clearRect(x+2,y+4,x+s-6,y+19).fillRect(x+s-3,y+10,x+s,y+14);
    var barWidth = bat*(s-12)/100;
    var color = bat < 15 ? "#f00" : "#f80";
    g.setColor(color).fillRect(x+4,y+6,x+4+barWidth,y+17);
  },updateWidth: function() {
    var newWidth = getWidth();
    if(newWidth != this.width) {
      this.width = newWidth;
      Bangle.drawWidgets();
    }
  }};
  setInterval(()=>{
    var widget = WIDGETS.minbat;
    if(widget) {widget.updateWidth();}
  }, 10*60*1000);
})();

