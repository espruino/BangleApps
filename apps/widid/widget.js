WIDGETS["widid"] = { area:"tr", width:16, draw() {
  var id = NRF.getAddress().substr().substr(12).split(":");
  g.reset("widget").setColor(g.theme.dark ? "#0ff" : "#00f").setFont("6x8", 1).drawString(id[0], this.x+2, this.y+4, true).drawString(id[1], this.x+2, this.y+14, true);
},remove() { delete WIDGETS["widid"]; }
};