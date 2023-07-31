Bangle.loadWidgets = (o => ()=>{
  o();
  const s = require("Storage").readJSON("wid_edit.json", 1) || {};
  const c = s.custom || {};
  for (const w in c){
    if (!(w in WIDGETS)) continue; // widget no longer exists
    // store defaults of customized values in _WIDGETS
    if (!global._WIDGETS) global._WIDGETS = {};
    if (!global._WIDGETS[w]) global._WIDGETS[w] = {};
    Object.keys(c[w]).forEach(k => global._WIDGETS[w][k] = global.WIDGETS[w][k]);
    //overide values in widget with configured ones
    Object.assign(global.WIDGETS[w], c[w]);
  }
  const W = global.WIDGETS;
  global.WIDGETS = {};
  Object.keys(W)
    .sort() // sort alphabetically. the next sort is stable and preserves this if sortorder matches
    .sort((a, b) => (0|W[b].sortorder)-(0|W[a].sortorder))
    .forEach(k => global.WIDGETS[k] = W[k]);
})(Bangle.loadWidgets);
