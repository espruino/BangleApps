/* Utilities for handling widgets - mainly showing/hiding */

/// hide any visible widgets
exports.hide = function() {
  if (!global.WIDGETS) return;
  g.reset(); // reset colors
  for (var w of global.WIDGETS) {
    if (w._draw) return; // already hidden
    w._draw = w.draw;
    w.draw = () => {};
    w._area = w.area;
    w.area = "";
    if (w.x!=undefined) g.clearRect(w.x,w.y,w.x+w.width-1,w.y+23);
  }
};

/// Show any hidden widgets
exports.show = function() {
  if (!global.WIDGETS) return;
  for (var w of global.WIDGETS) {
    if (!w._draw) return; // not hidden
    w.draw = w._draw;
    w.area = w._area;
    delete w._draw;
    delete w._area;
    w.draw(w);
  }
};
