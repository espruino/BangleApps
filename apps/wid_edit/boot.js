Bangle.loadWidgets = function() {
  global.WIDGETS={};
  require("Storage").list(/\.wid\.js$/)
    .forEach(w=>{
      try { eval(require("Storage").read(w)); }
      catch (e) { print(w, e); }
    });
  const s = require("Storage").readJSON("wid_edit.json", 1) || {},
    c = s.custom || {};
  for (const w in c){
    if (!(w in WIDGETS)) continue; // widget no longer exists
    // store defaults of customized values in _WIDGETS
    global._WIDGETS=global._WIDGETS||{};
    _WIDGETS[w] = {};
    Object.keys(c[w]).forEach(k => _WIDGETS[w][k] = WIDGETS[w][k]);
    Object.assign(WIDGETS[w], c[w]);
  }
  const W = WIDGETS;
  WIDGETS = {};
  Object.keys(W)
    .sort()
    .sort((a, b) => (0|W[b].sortorder)-(0|W[a].sortorder))
    .forEach(k => WIDGETS[k] = W[k]);
}