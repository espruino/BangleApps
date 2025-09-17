WIDGETS["webai"] = { area:"tl", width : 54, sortorder : 20,
draw : function() {
  g.reset().setFont("17");
  g.drawString("#",this.x+2,this.y+8).drawString("WebAI",this.x+12,this.y+5);
}};