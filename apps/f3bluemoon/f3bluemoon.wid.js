// This file is part of F3 Blue Moon Widget.
// Copyright 2026 Matt Marjanovic <maddog@mir.com>
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

(() => {
  let isDownUnder, moonColor;  // configuration variables

  function setConfig(c) {
    let hemi = c.hemisphere;  // NB: Avoid mutating c!
    if (hemi === 0) {
      // Default to using latitude from "My Location" app, with fallback
      // to "northern hemisphere".
      let location = require("Storage").readJSON("mylocation.json", true) || {"lat": 1};
      hemi = (location.lat >= 0) ? 1 : -1;
    }
    isDownUnder = (hemi < 0);

    moonColor = {r__: g.toColor(1,0,0),
                 rg_: g.toColor(1,1,0),
                 _g_: g.toColor(0,1,0),
                 _gb: g.toColor(0,1,1),
                 __b: g.toColor(0,0,1),
                 r_b: g.toColor(1,0,1),
                 rgb: g.toColor(1,1,1),
                }[c.color] || g.toColor(0,1,1);
  }

  function loadConfig() {
    let c = Object.assign({hemisphere: 0, // -1: S, 0: def, +1: N
                           color: null,   // see colorNames in settings.js
                          },
                          require('Storage').readJSON("f3bluemoon.json", true));
    setConfig(c);
    return c;
  }

  function drawMoon(tl_x, tl_y, left, right) {
    g.reset();

    let x0 = tl_x + 12;
    let y0 = tl_y + 12;
    let shadow = g.blendColor(0, moonColor, 0.25);

    // Quarter-circle, radius 11 pixels, expressed as 11 row lengths
    let dx_list = new Uint8Array([11, 11, 11, 10, 10, 9, 9, 8, 7, 5, 3]);

    let dy = 0;
    for (const dx of dx_list) {
      // Draw a complete "shadow moon" first.
      g.setColor(shadow);
      g.drawLine(x0     - dx, y0 - 1 - dy,
                 x0 - 1 + dx, y0 - 1 - dy);
      g.drawLine(x0     - dx, y0     + dy,
                 x0 - 1 + dx, y0     + dy);

      // Draw the partial "lit moon" on top.
      let ldx = Math.round(-left * dx);
      let rdx = Math.round(right * dx) - 1;
      if (ldx <= rdx) {
        g.setColor(moonColor);
        g.drawLine(x0 + ldx, y0 - 1 - dy,
                   x0 + rdx, y0 - 1 - dy);
        g.drawLine(x0 + ldx, y0     + dy,
                   x0 + rdx, y0     + dy);
      }
      ++dy;
    }

    // Superimpose the man-in-the-moon during full moon (< 1% occlusion).
    if ((left > 0.99) && (right > 0.99)) {
      print("Full Moon!");
      g.setBgColor(0, 0, 0);
      g.drawImage(
        atob("GBiBAf////////////////9///r1f/f///16//q1f/Xbv/q1f/16////7+/3///rt/3X///////9f/6qv/9V/////////////////w=="),
        tl_x, tl_y);
    }
  }

  function moonPhase(unixSeconds) {
    // See https://en.wikipedia.org/wiki/Julian_day (ignoring leap seconds?)
    let jd = (unixSeconds / 86400) + 2440587.5;  // Julian date
    // Julian centuries, relative to J2000.0 epoch
    let T = (jd - 2451545) / 36525;

    // Moon math adapted from https://github.com/pjain03/moon_phases, which was
    // adapted from "Astronomical Algorithms (2nd Ed)", Jean Meeus (1999).
    //
    // L_prime = light_time_moon(T)
    // D = mean_elongation_moon(T)
    // M_prime = mean_anomaly_moon(T)
    // F = mean_latitude_moon(T)
    let L_prime = (3.81034102 + 8399.70911 * T);
    let D       = (5.19846674 + 7771.37714 * T);
    let M_prime = (2.35555589 + 8328.69142 * T);
    let F       = (1.62790523 + 8433.46615 * T);

    // sl = kepler_coeff_longitude(D, M, M_prime, F, E, A1, A2, L_prime)
    // sb = kepler_coeff_latitude(D, M, M_prime, F, E, L_prime, A3, A1)
    let sl = (   1.09759812e-1 * Math.sin(M_prime)
               + 2.22359659e-2 * Math.sin(2 * D - M_prime)
               + 1.14897468e-2 * Math.sin(2 * D)
             );
    let sb = 8.95026133e-2 * Math.sin(F);

    // Lo = mean_longitude_sun(T)
    // M = mean_anomaly_sun(T)
    // C = center_of_sun(T, M)
    // L = true_longitude_sun(Lo, C)
    let Lo = (4.89506299 + 628.33196678 * T);
    let M =  (6.24005996 + 628.30195532 * T);
    let C =  (3.34160738e-2 - 8.40725100e-05 * T) * Math.sin(M);
    let L = Lo + C;

    // l_moon = apparent_longitude_moon(L_prime, sl)
    // al = apparent_longitude_sun(L, T)
    let l_moon = L_prime + sl;
    let b_moon = sb;
    let l_sun = L;

    let l_sun_to_moon = (l_moon - l_sun) % (2 * Math.PI);

    // phi here is Sun-Earth-Moon angle --- not Sun-Moon-Earth,
    // but close enough since Sun is so much farther away.
    let cosPhi = Math.cos(b_moon) * Math.cos(l_sun_to_moon);

    return { seconds: unixSeconds,
             jd: jd,
             fraction: (1 - cosPhi) / 2,
             isLeadingSun: l_sun_to_moon > Math.PI,
           };
  }

  const width = 24;
  const height = 24;
  let moon = {};  // cached calculated moon state
  let forceSeconds = 0;

  function drawWidget() {
    // Recalculate moon state hourly-ish.
    let nowSeconds = forceSeconds || getTime();
    if (!moon.seconds || ((nowSeconds - moon.seconds) >= 3600)) {
      moon = moonPhase(nowSeconds);
    }

    let left = (2 * moon.fraction) - 1;
    let right = 1;
    if (moon.isLeadingSun ^ isDownUnder) {
      let t = left; left = right; right = t;
    }
    drawMoon(this.x, this.y, left, right);
  }

  function drawTest() {
    // sanitycheck.js does not want to see "g.reset().clear" in widgets,
    // but here, in test code, it should be ok, so cheekily obfuscate it.
    const insaniG = g; //
    insaniG.reset().clear().setColor(1,0,0).fillRect(0,0, 175,175);

    let x = 8;
    let y = 4;
    let draw = (p) => {
      let left = (p >= 0) ? (2 * p) - 1 : 1;
      let right = (p < 0) ? (2 * -p) - 1 : 1;
      drawMoon(x, y, left, right, false);
      g.setFont("4x6").setColor(0).drawString(p, x + 20, y + 20);
      y += 24;
    }
    let nextColumn = () => { y = 4; x += 40; }

    for (let p of [0.0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5]) { draw(p); }
    nextColumn();
    for (let p of [1.0, 0.95, 0.9, 0.8, 0.7, 0.6]) { draw(p); }
    nextColumn();
    for (let p of [-1.0, -0.95, -0.9, -0.8, -0.7, -0.6]) { draw(p); }
    nextColumn();
    for (let p of [0.0, -0.05, -0.1, -0.2, -0.3, -0.4, -0.5]) { draw(p) }
  }

  function dumpIcon() {
    // Draw some moons in top-left corner.
    g.reset().setColor(0);
    g.fillRect(0, 0, 2 * width - 1, 2 * height - 1);
    setConfig({hemisphere: 1, color: null});
    drawMoon(0,          0, -0.9, 1);
    drawMoon(width,      0, -0.5, 1);
    drawMoon(0,     height,  0.2, 1);
    drawMoon(width, height,  0.8, 1);
    // Extract and dump.
    let G = Graphics.createArrayBuffer(48, 48, 4);
    G.drawImage(g.asImage({x: 0, y:0, w: 48, h: 48}));
    G.dump();
  }

  loadConfig();

  WIDGETS["f3bluemoon"] = {
    area: "tr",
    width: width,
    draw: drawWidget,
    setConfig: setConfig,
    loadConfig: loadConfig,
    // For testing/development:
    forceSeconds: function (s) { forceSeconds = s; this.draw(); },
    drawTest: drawTest,
    dumpIcon: dumpIcon
  };
})();
