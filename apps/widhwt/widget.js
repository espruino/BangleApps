/* jshint esversion: 6 */
(() => {
  var icon = require("heatshrink").decompress(atob("jEYwIKHgwCBhwCBh4CEggPCkACBmAXDBwVZ+EB+F4gEsjl8EgMP+EChk/gEMh+ehkA+YIBxwxBnF/4HggH/wEAj0AA=="));
  var color = 0x4A69;

  function draw() {
    g.reset().setColor(color).drawImage(icon, this.x + 1, 0);
  }

  WIDGETS["widhwt"] = { area: "tr", width: 26, draw: draw };

  Bangle.on('swipe', function() {
    color = 0x41f;
    Bangle.buzz();
    Bangle.drawWidgets();
    setTimeout(() => {
      color = 0x4A69;
      Bangle.buzz(1E3, 1);
      Bangle.drawWidgets();
    }, 35E3);

  });
})();