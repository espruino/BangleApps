/* jshint esversion: 6 */
(() => {
  var id = NRF.getAddress().substr().substr(12).split(":");

  // draw your widget at xpos
  function draw() {
    g.reset().setColor(0, 0.5, 1).setFont("6x8", 1);
    g.drawString(id[0], this.x+2, this.y+4, true);
    g.drawString(id[1], this.x+2, this.y+14, true);
  }
  WIDGETS["widid"] = { area:"tr", width:16, draw: draw };
})();
