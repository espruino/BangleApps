// This file is part of F3 Widget Tuner.
// Copyright 2026 Matt Marjanovic <maddog@mir.com>
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

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
