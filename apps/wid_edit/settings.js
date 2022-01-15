/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {
  const names = {};
  const settings = require("Storage").readJSON("wid_edit.json", 1) || {};
  if (!('custom' in settings)) settings.custom = {};
  global._WIDGETS = global._WIDGETS || {};
  // Adjust appRect to always have room for widgets while in this app
  Object.assign(Bangle.appRect, {
    y: 24, h: g.getHeight()-25, y2: g.getHeight()-48,
  });
  /**
   * Sort & redraw all widgets
   */
  function redrawWidgets() {
    let W = WIDGETS;
    global.WIDGETS = {};
    Object.keys(W)
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
    // disabled widgets were moved to _WIDGETS and replaced with a dummy {draw}, so don't have area set
    let WIDGET = WIDGETS[id].area ? WIDGETS[id] : _WIDGETS[id],
      def = {area: WIDGET.area, sortorder: WIDGET.sortorder|0}; // default values (disabled is never the default)
    if (WIDGET.area && id in _WIDGETS) Object.assign(def, _WIDGETS[id]); // enabled widgets have defaults saved in _WIDGETS

    const areas = ['tl','tr','bl','br'];
    settings.custom = settings.custom||{};
    let saved = settings.custom[id] || {},
      area = saved.area || def.area,
      sortorder = ("sortorder" in saved) ? saved.sortorder : def.sortorder,
      enabled = !saved.hide;

    /**
     * Draw highlighted widget (if enabled)
     */
    function highlight() {
      if (WIDGET.width && enabled) {
        WIDGET.draw();
        g.setColor(g.theme.fgH)
          .drawRect(WIDGET.x, WIDGET.y, WIDGET.x+WIDGET.width-1, WIDGET.y+23);
      }
    }
    highlight();

    /**
     * Save widget and redraw with new settings
     */
    function save() {
      // we only save non-default values
      saved = {};
      if ((area!==def.area) || (sortorder!==def.sortorder) || !enabled) {
        if (area!==def.area) saved.area = area;
        if (sortorder!==def.sortorder) saved.sortorder = sortorder;
        if (!enabled) saved.hide = true;
        settings.custom = settings.custom || {};
        settings.custom[id] = saved;
      } else if (settings.custom) {
         delete settings.custom[id]
      }
      if (!Object.keys(settings.custom).length) delete settings.custom;
      require("Storage").writeJSON("wid_edit.json", settings);
      delete saved.hide; // no need to save this inside the widget
      Object.assign(WIDGET, def, saved);
      if (WIDGET.sortorder === undefined) delete WIDGET.sortorder; // default can be undefined, but don't put that in the widget
      if (enabled) {
        WIDGETS[id] = WIDGET;
        delete _WIDGETS[id];
        // if we assigned custom values, store defaults in _WIDGETS
        let _W = {};
        if (saved.area) _W.area = def.area;
        if (def.sortorder !== undefined) {
          if ('sortorder' in saved) _W.sortorder = def.sortorder;
        }
        if (Object.keys(_W).length) _WIDGETS[id] = _W;
      } else {
        // disabled: move original widget into _WIDGETS, and place it offscreen
        _WIDGETS[id] = WIDGET;
        WIDGETS[id] = {draw: () => {}}; // in case it tries to call itself
      }
      // drawWidgets won't clear e.g. bottom bar if we just disabled the last bottom widget
      if (WIDGET.width) g.reset().clearRect(WIDGET.x, WIDGET.y, WIDGET.x+WIDGET.width-1, WIDGET.y+23);
      redrawWidgets();

      highlight();
      m.draw();
    }

    const menu = {
      "": {"title": name(id)},
      /*LANG*/"< Back": () => {
        if (WIDGET.width) {
          g.reset().clearRect(WIDGET.x, WIDGET.y, WIDGET.x+WIDGET.width-1, WIDGET.y+23);
          WIDGET.draw();
        }
        mainMenu();
        },
      /*LANG*/"Area": {
        value: areas.indexOf(area),
        min: 0, max: 3, wrap: true,
        format: a => [
          /*LANG*/"Top Left",    /*LANG*/"Top Right",
          /*LANG*/"Bottom Left", /*LANG*/"Bottom Right"
        ][a],
        onchange: a => {
          area = areas[a];
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
      /*LANG*/"Enabled": {
        value: enabled,
        format: e => e ?/*LANG*/"Yes" :/*LANG*/"No",
        onchange: e => {
          enabled = e;
          save();
        }
      },
      /*LANG*/"Reset": () => {
        area = def.area;
        sortorder = def.sortorder;
        enabled = true;
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
      if (!Object.keys(_WIDGETS).length) delete _WIDGETS;
      // adjust appRect for new widget locations
      let a, t=0, b=0;
      for (let WIDGET of WIDGETS) {
        if (a=WIDGET.area) {
          t = t || (a[0]=="t");
          b = b || (a[0]=="b");
        }
      }
      Object.assign(Bangle.appRect, {
        y: t*24,
        h: g.getHeight()-(t+b)*24,
        y2: g.getHeight()-1-b*24
      });
      back();
    };
    const enabled = Object.keys(WIDGETS).filter(id => WIDGETS[id].area);
    enabled.forEach(function(id) {
      menu[name(id)+((id in _WIDGETS) ? " *" : "")] = () => edit(id);
    });
    const disabled = Object.keys(WIDGETS).filter(id => !WIDGETS[id].area);
    if (disabled.length) {
      menu[" == "+/*LANG*/"Disabled"+" == "] = undefined;
      disabled.forEach(function(id) {
        menu[name(id)+" *"] = () => edit(id);
      });
    }
    if (Object.keys(_WIDGETS).length) { // only show reset if there is anything to reset
      menu[/*LANG*/"Reset All"] = () => {
        E.showPrompt(/*LANG*/"Reset all widgets?").then(confirm => {
          if (confirm) {
            delete settings.custom;
            require("Storage").writeJSON("wid_edit.json", settings);
            for(let id in _WIDGETS) {
              if (WIDGETS[id].area) Object.assign(WIDGETS[id], _WIDGETS[id]) // restore defaults
              else WIDGETS[id] = _WIDGETS[id]; // restore widget
            }
            global._WIDGETS = {};
            for(let WIDGET of WIDGETS) {
              // drawWidgets won't clear e.g. bottom bar if there are no bottom widgets because we just moved them away
              // (area has been reset by now, but x/y not yet)
              if (WIDGET.width) g.reset().clearRect(WIDGET.x, WIDGET.y, WIDGET.x+WIDGET.width-1, WIDGET.y+23);
            }
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
