// This file is part of F3 Widget Tuner.
// Copyright 2026 Matt Marjanovic <maddog@mir.com>

(function() {
  let stockLoadWidgets = Bangle.loadWidgets;

  Bangle.loadWidgets = function () {
    stockLoadWidgets();
    require("f3wdgttune.lib.js").applyContext();
  };

  Bangle.drawWidgets = function () {
    if (! global.WIDGETS) { return; }
    let WT = require("f3wdgttune.lib.js");
    WT.applyContext();
    WT.drawWidgetsByContext();
  };
})()
