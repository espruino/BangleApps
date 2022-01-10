/* jshint esversion: 6 */
(() => {
  var color = 0x4A69;

  function draw() {
    g.reset().setColor(color).drawImage(require("heatshrink").decompress(atob("jEYwIKHgwCBhwCBh4CEggPCkACBmAXDBwVZ+EB+F4gEsjl8EgMP+EChk/gEMh+ehkA+YIBxwxBnF/4HggH/wEAj0AA==")), this.x + 1, 0);
  }

  function startTimer() {
    color = 0x41f;
    Bangle.buzz();
    Bangle.drawWidgets();
    setTimeout(() => {
      color = 0x4A69;
      Bangle.buzz(1E3, 1);
      Bangle.drawWidgets();
    }, 35E3);
  }

  if (process.env.HWVERSION == 1) {
      WIDGETS["widhwt"] = {
          area: "tr",
          width: 26,
          draw: draw,
      };
      Bangle.on('swipe', startTimer);
  }
})();
