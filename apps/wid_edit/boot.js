Bangle.loadWidgets = function() {
  global.WIDGETS={}; global._WIDGETS={};
  require("Storage").list(/\.wid\.js$/)
    .forEach(widget=>{
      try { eval(require("Storage").read(widget)); }
      catch (e) {print(widget,e);}
    });
  const o = require("Storage").readJSON("wid_edit.json", 1) || {},
    c = o.custom || {};
  for (const w in c){
    if (!(w in WIDGETS)) continue;
    let _W = {};
    // store default area/sortorder in _WIDGETS
    if (c[w].area) _W.area = WIDGETS[w].area;
    if ('sortorder' in c[w]) _W.sortorder = WIDGETS[w].sortorder;
    Object.assign(WIDGETS[w], c[w]);
    _WIDGETS[w] = _W;
  }
  if (!Object.keys(_WIDGETS).length) delete _WIDGETS; // no need for this
  const W = WIDGETS;
  WIDGETS = {};
  Object.keys(W)
    .sort((a, b) => (0|W[b].sortorder)-(0|W[a].sortorder))
    .forEach(k => WIDGETS[k] = W[k]);
}