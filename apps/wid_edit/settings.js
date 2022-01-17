/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const names = {};
  const settings = require("Storage").readJSON("wid_edit.json", 1) || {};
  if (!('custom' in settings)) settings.custom = {};
  global._WIDGETS = global._WIDGETS || {};

  let cleanup = false;
  for (const id in settings.custom) {
    if (!(id in WIDGETS)) {
      // widget which no longer exists
      cleanup = true;
      delete settings.custom[id];
    }
  }
  if (cleanup) {
    if (!Object.keys(settings.custom).length) delete settings.custom;
    require("Storage").writeJSON("wid_edit.json", settings);
  }

  /**
   * Sort & redraw all widgets
   */
  function redrawWidgets() {
    let W = WIDGETS;
    global.WIDGETS = {};
    Object.keys(W)
      .sort()
      .sort((a, b) => (0|W[b].sortorder)-(0|W[a].sortorder))
      .forEach(k => {WIDGETS[k] = W[k]});
    Bangle.drawWidgets();
  }

    /**
   * Try to find app name for widget
   * @param {string} widget WIDGETS key
   * @return {string} widget name
   */
  function name(widget) {
    if (!(widget in names)) {
      let infoFile = widget+".info";
      // widget names don't always correspond to appid :-(
      // so we try both with and without 'wid'-prefix
      if (!require("Storage").list(new RegExp(`^${infoFile}$`)).length) {
        infoFile = (widget.substr(0, 3)==="wid") ? infoFile.substr(3) : ("wid"+infoFile);
      }
      names[widget] = (require("Storage").readJSON(infoFile, 1) || {}).name || widget;
    }
    return names[widget];
  }

  function edit(id) {
    let WIDGET = WIDGETS[id],
      def = {area: WIDGET.area, sortorder: WIDGET.sortorder|0}; // default values
    Object.assign(def, _WIDGETS[id]||{}); // defaults were saved in _WIDGETS

    settings.custom = settings.custom||{};
    let saved = settings.custom[id] || {},
      area = saved.area || def.area,
      sortorder = ("sortorder" in saved) ? saved.sortorder : def.sortorder;

    /**
     * Draw highlighted widget
     */
    function highlight() {
      if (WIDGET.width > 0) {
        // draw widget, then draw a highlighted border on top
        WIDGET.draw();
        g.setColor(g.theme.fgH)
          .drawRect(WIDGET.x, WIDGET.y, WIDGET.x+WIDGET.width-1, WIDGET.y+23);
      } else {
        // hidden widget: fake a width and provide our own draw()
        const draw = WIDGET.draw, width = WIDGET.width;
        WIDGET.width = 24;
        WIDGET.draw = function() {
          g.setColor(g.theme.bgH).setColor(g.theme.fgH)
            .clearRect(this.x, this.y, this.x+23, this.y+23)
            .drawRect(this.x, this.y, this.x+23, this.y+23)
            .drawLine(this.x, this.y, this.x+23, this.y+23)
            .drawLine(this.x, this.y+23, this.x+23, this.y);
        };
        // re-layout+draw all widgets with our placeholder in between
        redrawWidgets();
        // and restore original values
        WIDGET.draw = draw;
        WIDGET.width = width;
      }
    }
    highlight();

    /**
     * Save widget and redraw with new settings
     */
    function save() {
      // we only save non-default values
      saved = {};
      if ((area!==def.area) || (sortorder!==def.sortorder)) {
        if (area!==def.area) saved.area = area;
        if (sortorder!==def.sortorder) saved.sortorder = sortorder;
        settings.custom = settings.custom || {};
        settings.custom[id] = saved;
      } else if (settings.custom) {
         delete settings.custom[id]
      }
      if (!Object.keys(settings.custom).length) delete settings.custom;
      require("Storage").writeJSON("wid_edit.json", settings);
      Object.assign(WIDGET, def, saved);
      if (WIDGET.sortorder === undefined) delete WIDGET.sortorder; // default can be undefined, but don't put that in the widget
      // if we assigned custom values, store defaults in _WIDGETS
      let _W = {};
      if (saved.area) _W.area = def.area;
      if ('sortorder' in saved) _W.sortorder = def.sortorder;
      if (Object.keys(_W).length) _WIDGETS[id] = _W;
      else delete _WIDGETS[id];

      // drawWidgets won't clear e.g. bottom bar if we just disabled the last bottom widget
      redrawWidgets();

      highlight();
      m.draw();
    }

    const menu = {
      "": {"title": name(id)},
      /*LANG*/"< Back": () => {
        redrawWidgets();
        mainMenu();
      },
      /*LANG*/"Side": {
        value: (area === 'tl'),
        format: tl => tl ? /*LANG*/"Left" : /*LANG*/"Right",
        onchange: tl => {
          area = tl ? "tl" : "tr";
          save();
        }
      },
      /*LANG*/"Sort Order": {
        value: sortorder,
        onchange: o => {
          sortorder = o;
          save();
        }
      },
      /*LANG*/"Reset": () => {
        area = def.area;
        sortorder = def.sortorder;
        save();
        mainMenu(); // changing multiple values made the rest of the menu wrong, so take the easy out
      }
    }

    let m = E.showMenu(menu);
  }


  function mainMenu() {
    let menu = {
      "": {"title": /*LANG*/"Widgets"},
    };
    menu[/*LANG*/"< Back"] = ()=>{
      if (!Object.keys(_WIDGETS).length) delete _WIDGETS; // no defaults to remember
      back();
    };
    Object.keys(WIDGETS).forEach(id=>{
      // mark customized widgets with asterisk
      menu[name(id)+((id in _WIDGETS) ? " *" : "")] = () => edit(id);
    });
    if (Object.keys(_WIDGETS).length) { // only show reset if there is anything to reset
      menu[/*LANG*/"Reset All"] = () => {
        E.showPrompt(/*LANG*/"Reset all widgets?").then(confirm => {
          if (confirm) {
            delete settings.custom;
            require("Storage").writeJSON("wid_edit.json", settings);
            for(let id in _WIDGETS) {
              Object.assign(WIDGETS[id], _WIDGETS[id]) // restore defaults
            }
            global._WIDGETS = {};
            redrawWidgets();
          }
          mainMenu(); // reload with reset widgets
        })
      }
    }

    E.showMenu(menu);
  }
  mainMenu();
});
