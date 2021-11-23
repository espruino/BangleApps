WIDGETS["messages"]={area:"tl",width:0,draw:function() {
  if (!this.width) return;
  var c = (Date.now()-this.t)/1000;
  g.reset().setBgColor((c&1) ? "#0f0" : "#030").setColor((c&1) ? "#000" : "#fff");
  g.clearRect(this.x,this.y,this.x+this.width,this.y+23);
  g.setFont("6x8:1x2").setFontAlign(0,0).drawString("MESSAGES", this.x+this.width/2, this.y+12);
  //if (c<60) Bangle.setLCDPower(1); // keep LCD on for 1 minute
  if (c<120 && (Date.now()-this.l)>4000) {
    this.l = Date.now();
    Bangle.buzz(); // buzz every 4 seconds
  }
  setTimeout(()=>WIDGETS["messages"].draw(), 1000);
},show:function() {
  WIDGETS["messages"].t=Date.now(); // first time
  WIDGETS["messages"].l=Date.now()-10000; // last buzz
  WIDGETS["messages"].width=64;
  Bangle.drawWidgets();
  Bangle.setLCDPower(1);// turns screen on
},hide:function() {
  delete WIDGETS["messages"].t;
  delete WIDGETS["messages"].l;
  WIDGETS["messages"].width=0;
  Bangle.drawWidgets();
}};
