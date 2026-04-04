// This file is part of F3 Widget Tuner.
// Copyright 2026 Matt Marjanovic <maddog@mir.com>
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

function readConfig() {
  return require('Storage').readJSON("f3wgttune.json", true) || {};
}

function writeConfig(config) {
  require('Storage').writeJSON("f3wgttune.json", config);
}

let currentConfig; // Treated as immutable; always fresh objects parsed from JSON.

function reloadCurrentConfig() {
  currentConfig = readConfig();
}

reloadCurrentConfig();


let previewContext = undefined;
let focalWid = undefined;

function getPreviewContext() {
  return previewContext;
}

function setPreviewContext(context) {
  previewContext = context;
}

function setPreviewFocus(wid) {
  focalWid = wid;
}


let context;
let affectsSort = true;  // ...ensures we always do our stable sort initially.

let needSort = false;

function checkContext() {
  if (previewContext) {
    context = previewContext;
    // Preview context will get mutated and we can't really tell what changed,
    // so presume anything and everything.
    affectsSort = true;
    needSort = true;
    return;
  }

  let lastContext = context;
  let cc = currentConfig;
  context = cc[__FILE__] || cc[Bangle.CLOCK ? "*clk" : "*!clk"] || cc["*"] || null;

  // Identical (non-mutating) context --> no changes.
  if (context === lastContext) { return; }

  let lastAffectsSort = affectsSort;
  affectsSort = context && Object.values(context.w).some(v => (v.order !== undefined));
  // If sorting might have possibly changed, then re-sort.
  needSort = lastAffectsSort || affectsSort;
}


let originalSpecs = {};

// If a context overrides a widget's 'area' field, we must write the modified value
// into the field itself, because functions besides drawWidgets() will look at it
// (e.g., Bangle.appRect).
function mutateWidgets() {
  let cw = context ? context.w : {};
  for (const kv of Object.entries(WIDGETS)) {
    let id = kv[0];
    let wd = kv[1];
    let tune = cw[id] || {};

    // Capture original upon first encounter with widget.
    if (!originalSpecs[id]) {
      originalSpecs[id] = {area: wd.area};
    }
    // Neg the area if hiding, to avoid creating a widget bar for invisible widget!
    wd.area = tune.hide ? "" : (tune.area ?? originalSpecs[id].area);
  }
}


let secondOrder;

// Compute a secondary ordinal based on alpha-sort of widget-id.
// NB:  We only do this once; any later, dynamic widgets won't participate.
function _setupSecondOrder() {
  secondOrder = {};
  let i = 0;
  Object.keys(WIDGETS).sort().forEach(k => { secondOrder[k] = i++; });
}


function maybeSortWidgetsByContext() {
  if (! needSort) { return; }
  needSort = false;

  if (! secondOrder) { _setupSecondOrder(); }

  let cw = context ? context.w : {};
  let W = WIDGETS;
  WIDGETS = {};
  // The 'back' widget is **magic** constructed by Bangle.setUI(); if it exists,
  // it must always come first in the widget list.  Pre-assigning, guarantees
  // it will be first and stay first.
  if (W['back']) { WIDGETS['back'] = W['back']; }

  // For each entry (k,w) in W<IDGETS>, we precompute a concrete ordinal o,
  // lookup a secondary ordinal s, and create a quad (o,s,k,w) --- then
  // we sort the quads.  This way, we do all the O(n) key lookups in objects
  // and nested objects only once; and, we can avoid all key lookups while
  // reconstituting WIDGETS.
  //
  // [key, widget] --> [ordinal, secondary, key, widget]
  const toOrderedEntry = kw => {
    let k = kw[0], w = kw[1];
    return [((cw[k] || {}).order ?? w.sortorder ?? 0), (secondOrder[k] ?? 0), k, w];
  };
  Object.entries(W)
    .map(toOrderedEntry)
    .sort((a,b) => (b[0] - a[0]) || (a[1] - b[1]) ) // NB: Reverse-sort on o!
    .forEach( oskw => { WIDGETS[oskw[2]] = oskw[3] } );
}


function applyContext() {
  checkContext();
  mutateWidgets();
  maybeSortWidgetsByContext();
}


function drawWidgetsByContext() {
  let screen_w = g.getWidth();
  let screen_h = g.getHeight();
  let areas = {tl: {x: 0,        y: 0,             wgts: []},
               tc: {x: 0,        y: 0,             wgts: []},
               tr: {x: screen_w, y: 0,             wgts: []},
               bl: {x: 0,        y: screen_h - 24, wgts: []},
               bc: {x: 0,        y: screen_h - 24, wgts: []},
               br: {x: screen_w, y: screen_h - 24, wgts: []},
              };

  // Compute layout:  (x,y) origins for each widget.
  let useTop = false;
  let useBot = false;
  let cw = context ? context.w : {};
  for (const k of Object.keys(WIDGETS)) {
    let wgt = WIDGETS[k];
    let tune = cw[k] || {};

    let a = areas[wgt.area];
    // NB: Stock behavior for !a case is to skip doing *any* layout for
    //     the widget (i.e., x,y are left alone).  We don't do that.
    if (tune.hide || !a) {
      // Place widget off-screen, no matter who calls wgt.draw() later.
      wgt.y = 0;
      wgt.x = screen_w;
      continue;
    }

    let padl = tune.padl ?? 0;
    let padr = tune.padr ?? 0;
    // 0-width widgets are minimizing themselves, so nix padding, too.
    // (BUT, during previews, show padding and promote width to 1.)
    if (!wgt.width) {
      if (!previewContext) {
        padl = padr = 0;
      } else {
        padr += 1;
      }
    }
    let width = padl + wgt.width + padr;
    let rtl = (wgt.area[1] === 'r');  // layout "right-to-left"
    wgt.x = a.x - (rtl * width) + padl;
    wgt.y = a.y;
    a.x += width * (1 - (2 * rtl));
    switch (wgt.area[0]) {
    case "t": useTop = true; break;
    case "b": useBot = true; break;
    }
    a.wgts.push(wgt);
  }

  let doCentering = (l, c, r) => {
    if (!c.x) { return; }
    let o = Math.floor((screen_w - c.x) / 2);
    // Nudge to avoid overlaps, giving TL priority over TR (i.e.,
    // in the case that (l.x + c.x) > r.x).
    o = ((c.x + o) > r.x) ? (r.x - c.x) : o;
    o = (l.x > o) ? l.x : o;
    for (const wgt of c.wgts) { wgt.x += o; }
  }
  doCentering(areas.tl, areas.tc, areas.tr);
  doCentering(areas.bl, areas.bc, areas.br);

  g.reset();
  if (useTop) { g.clearRect(0, 0, screen_w - 1, 23); }
  if (useBot) { g.clearRect(0, screen_h - 24, screen_w - 1, screen_h - 1); }
  for (const wgt of WIDGETS) {
    try { wgt.draw(wgt); } catch(e) { print(e); }
  }

  if (!previewContext) { return; }

  g.reset();
  let focalWidget = focalWid ? WIDGETS[focalWid] : undefined;
  let backWidget = WIDGETS.back;
  for (const wgt of WIDGETS) {
    if (wgt === backWidget) { continue; }  // 'back' is **magic**.
    if (wgt === focalWidget) { g.setColor(1,0,1); } else { g.setColor(0,0,1); }
    let minx = Math.max(0, wgt.width - 1);
    g.drawRect(wgt.x, wgt.y, wgt.x + minx, wgt.y + 23);
  }
}


exports = {
  drawWidgetsByContext,
  readConfig,
  writeConfig,
  reloadCurrentConfig,
  getPreviewContext,
  setPreviewContext,
  setPreviewFocus,
  mutateWidgets,
  originalSpecs,
  applyContext,
};
