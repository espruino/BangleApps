Bangle.loadWidgets = function() {
  global.WIDGETS={}; global._WIDGETS={};
  require("Storage").list(/\.wid\.js$/)
    .forEach(widget=>{
      try { eval(require("Storage").read(widget)); }
      catch (e) {print(widget,e);}
    });
  const o = require("Storage").readJSON("wid_edit.json", 1) || {},
    c = o.custom || {};
    let _W;
  for (const w in c){
    if (!(w in WIDGETS)) continue;
    _W= {};
    if (c[w].hide) {
      // disabled: move widget to _WIDGETS, and place it way offscreen (in case it tries to draw itself anyway)
      _W = WIDGETS[w]; _W.x = 1000; _W.y = 1000;
      WIDGETS[w] = {draw:()=>{}}; // in case it tries to call itself
    }
    else {
      // enabled: store default area/sortorder in _WIDGETS (only if changed)
      if (c[w].area) _W.area = WIDGETS[w].area;
      if ('sortorder' in c[w]) _W.sortorder = WIDGETS[w].sortorder;
      Object.assign(WIDGETS[w], c[w]);
    }
    if (Object.keys(_W).length) _WIDGETS[w] = _W;
  }
  if (!Object.keys(_WIDGETS).length) delete _WIDGETS; // no need for this
  const W = WIDGETS;
  WIDGETS = {};
  let a, t=0, b=0;
  Object.keys(W)
    .sort((a, b) => (0|W[b].sortorder)-(0|W[a].sortorder))
    .forEach(k => {
      WIDGETS[k] = W[k];
      if (a=W[k].area) {
        t = t || (a[0]=="t");
        b = b || (a[0]=="b");
      }
    });
  Bangle.appRect = {
    x: 0, y: t*24,
    w: g.getWidth(), h: g.getHeight()-1-(t+b)*24,
    x2: g.getWidth()-1, y2: g.getHeight()-1-b*24
  }
}