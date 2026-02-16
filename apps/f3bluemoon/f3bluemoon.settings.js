// This file is part of F3 Blue Moon Widget.
// Copyright 2026 Matt Marjanovic <maddog@mir.com>
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

(function(back) {

  Bangle.loadWidgets();  // Ensure we have access to our widget!
  Bangle.drawWidgets();

  let config = WIDGETS["f3bluemoon"].loadConfig();

  function saveConfig() {
    require('Storage').writeJSON("f3bluemoon.json", config);
  }

  function redrawWidget() {
    let w = WIDGETS["f3bluemoon"];
    if (!w) { return; }
    w.setConfig(config);
    setTimeout(w.draw.bind(w), 0); // ...defer drawing until idle.
  }

  const colorNames = {null: "default",
                      r__: "R--",
                      rg_: "RG-",
                      _g_: "-G-",
                      _gb: "-GB",
                      __b: "--B",
                      r_b: "R-B",
                      rgb: "RGB",
                     };
  const colorSequence = [null, "r__", "rg_", "_g_", "_gb", "__b", "r_b", "rgb"];

  E.showMenu({
    "": { title: "Blue Moon options",
          back: back,
        },
    "Hemisphere": {
      value: config.hemisphere,
      min: -1,
      max: 1,
      noList: true,
      wrap: true,
      format: function (v, context) {
        // Update widget as user flips through options, OR ensure sync of
        // value/widget if returning to menu without making selection.
        if (context !== 1) {
          config.hemisphere = v;
          redrawWidget();
        }
        return ["Southern", "default\n(try My Location)", "Northern"][v + 1];
      },
      onchange: v => {
        config.hemisphere = v;
        redrawWidget();
        saveConfig();
      }
    },
    "Color": {
      value: (()=>{ let i = colorSequence.indexOf(config.color);
                    if (i < 0) { i = 0; }
                    return i; })(),
      min: 0,
      max: colorSequence.length - 1,
      noList: true,
      wrap: true,
      format: function (i, context) {
        let tag = colorSequence[i];
        // Update widget as user flips through options, OR ensure sync of
        // value/widget if returning to menu without making selection.
        if (context !== 1) {
          config.color = tag;
          redrawWidget();
        }
        return colorNames[tag];
      },
      onchange: i => {
        config.color = colorSequence[i];
        redrawWidget();
        saveConfig();
      }
    },
  });
})
