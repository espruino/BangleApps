Bangle.loadWidgets = (o => ()=>{
  o();
  const s = require("Storage").readJSON("wid_edit.json", 1) || {};
  const c = s.custom || {};
  for (const w in c){
    if (!(w in WIDGETS)) continue; // widget no longer exists
    // store defaults of customized values in _WIDGETS
    if (!globalThis._WIDGETS) globalThis._WIDGETS = {};
    if (!globalThis._WIDGETS[w]) globalThis._WIDGETS[w] = {};
    Object.keys(c[w]).forEach(k => globalThis._WIDGETS[w][k] = globalThis.WIDGETS[w][k]);
    //overide values in widget with configured ones
    Object.assign(globalThis.WIDGETS[w], c[w]);
  }
  const W = globalThis.WIDGETS;
  globalThis.WIDGETS = {};
  Object.keys(W)
    .sort() // sort alphabetically. the next sort is stable and preserves this if sortorder matches
    .sort((a, b) => (0|W[b].sortorder)-(0|W[a].sortorder))
    .forEach(k => globalThis.WIDGETS[k] = W[k]);
})(Bangle.loadWidgets);
