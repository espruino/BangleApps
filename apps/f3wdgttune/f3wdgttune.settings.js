// This file is part of F3 Widget Tuner.
// Copyright 2026 Matt Marjanovic <maddog@mir.com>
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

(function(topLevelBack) {
  const WT = require("f3wdgttune.lib.js");

  // Use a fresh copy of the config (so we do not mutate lib's currentConfig).
  const config = WT.readConfig();


  function saveConfig() {
    WT.writeConfig(config);
    WT.reloadCurrentConfig();
    // NB: As long as a Menu.enter(), etc, follows saveConfig(), we expect
    //     widgets to get redrawn by the implicit Bangle.setUI() call.
  }


  // Utility functions

  // Simple check for structural equality of nested objects.
  function recursiveMatch(a, b) {
    if (a === b) { return (a !== undefined); }
    if ((typeof a !== 'object') || (typeof b !== 'object')) { return false; }
    let ka = Object.keys(a);
    if (ka.length != Object.keys(b).length) { return false; }
    return ka.every( (k) => recursiveMatch(a[k], b[k]) );
  }

  // Simple deep copy of nested objects.
  function recursiveCopy(o) {
    if (typeof o !== 'object') { return o; }
    let r = {}
    Object.entries(o).forEach( kv => { r[kv[0]] = recursiveCopy(kv[1]); } );
    return r;
  }

  // Replace contents of dst with deep copy of contents of src.
  function copyInto(src, dst) {
    Object.keys(dst).forEach( k => { delete dst[k]; } );
    Object.entries(src).forEach( kv => { dst[kv[0]] = recursiveCopy(kv[1]); } );
  }

  // Check if object or array is empty (no key/value entries).
  function isEmpty(o) {
    for (const e of o) { return false; }
    return true;
  }

  // Remove a value from an array.
  function remove(a, v) {
    let i = a.indexOf(v);
    if (i < 0) { return; }
    a.splice(i, 1);
  }

  // Given two arrays, compare the first element of each.
  function compareElement0(a, b) {
    return (a[0] < b[0]) ? -1 : (a[0] > b[0]) ? 1 : 0;
  }


  // For all known widgets (i.e., the currently instantiated ones,
  // the only ones we can know), a map from id to name, sorted by
  // case-insensitive name.
  //
  // ...does not include the "back" widget, which we leave untouch(ed/able).
  const widgetNames = (()=>{
    let wn = {};
    Object.keys(WIDGETS)
      .filter( id => (id !== "back") ) // Skip the magical "back" button.
      .map( id => {
        let n = (require("Storage").readJSON(id + ".info") || {}).name ?? id;
        return [n.toLowerCase(), id, n]; } )
      .sort(compareElement0)
      .forEach( uin => { wn[uin[1]] = uin[2]; } );
    return wn;
  })();


  // For all known/possible contexts, a map from key to descriptive name.
  // - key is either an app's .app.js filename, or a special magic string;
  // - map is sorted by case-insensitive descriptive name, with special
  //   magic entries always coming first.
  const contextNames = {"*": "[any app]",
                        "*clk": "[any clock]",
                        "*!clk": "[any non-clock]",
                       };
  const S = require("Storage");
  S.list(/\.info$/)
    .map(infoFile => { let info = S.readJSON(infoFile, true);
                       if (info && (!info.type
                                    || info.type == "app"
                                    || info.type == "clock"
                                    || info.type == "launch"
                                   )) {
                         return [ info.name.toLowerCase(),
                                  info.src,
                                  info.name ];
                       }
                       return undefined;
                     })
    .sort(compareElement0)
    .forEach( i => { if (i) { contextNames[i[1]] = i[2]; } });


  // Functions to keep contexts/tunings sorted as entries are added.
  //
  // We just keep entries sorted in the config itself, so that we don't
  // need to do any sorting when we construct menus.
  function _addNewSorted(newId, newValue, obj, names) {
    obj[newId] = newValue;
    Object.entries(obj)
      .map( kv => [(names[kv[0]] ?? kv[0]).toLowerCase(), kv[0], kv[1]] )
      .sort(compareElement0)
      .forEach( niv => { delete obj[niv[1]];
                         obj[niv[1]] = niv[2]; } );
  }

  function addNewContextInOrder(newId, contexts) {
    _addNewSorted(newId, {w: {}}, contexts, contextNames);
  }

  function addNewTuningInOrder(newId, tunings) {
    _addNewSorted(newId, {}, tunings, widgetNames);
  }


  function _bttf() {
    Bangle.setUI();
    E.showMessage("Marty, I'm sorry.\nBut the only power source capable of generating 1.21 gigawatts of electricity is a bolt of lightning.");
  }


  // Base class for all UI menus.
  class Menu {
    // Top of stack is always the current/last-shown menu.
    static uiStack = [];

    // finalBack - 'back' function when exiting the last menu on the stack
    constructor(finalBack) {
      this.finalBack = finalBack ?? _bttf;
    }

    // Show menu (set up the Bangle UI), and push it onto stack.
    // Menu is possibly scrolled to same position from previous showing.
    enter() {
      let menu = {};
      this.build(menu);
      if (this.m && this.m.scroller) {
        menu[""] = Object.assign(menu[""] ?? {},
                                 {scroll: this.m.scroller.scroll});
      }
      this.m = E.showMenu(menu);
      Menu.uiStack.push(this);
    }

    // Re-construct/re-show this already-current menu.
    reenter() {
      this.pop();
      this.enter();
    }

    // Discard top (current) menu from stack.
    pop() {
      let p = Menu.uiStack.pop();
      if (p !== this) { print("BAD POP:", p, this); }
    }

    // Pop top (current) menu off stack, and re-show the prior menu.
    exit() {
      this.pop();
      let top = Menu.uiStack.pop();
      // If no menus are left, we are completely done here... bye-bye!
      if (!top) { return this.finalBack(); }
      delete this.m;
      top.enter();
    }

    // title - title for this menu
    build(menu, title) {
      menu[""] = {title: title,
                  back: ()=>{ this.exit(); }
                 };
    }
  }


  // Nested Menu Hierarchy
  //
  // Contexts
  //   |
  //   +--> DeleteContext
  //   |
  //   +--> AddContext --\
  //   |                  \
  //   +----------------------> EditContext
  //                              |
  //                              +--> DeleteTuning
  //                              |
  //                              +--> AddTuning --\
  //                              |                 \
  //                              +---------------------> EditTuning

  class Contexts extends Menu {
    constructor(contexts, finalBack) {
      super(finalBack);
      this.contexts = contexts;
    }

    build(menu) {
      super.build(menu, "Contexts:");

      const contexts = this.contexts;

      function actionEditContext(key) {
        return ()=>{ (new EditContext(contexts[key], contextNames[key])).enter(); };
      }

      let unused = Object.keys(contextNames);
      let hasEntries = false;
      Object.keys(contexts).forEach( key => {
        menu[contextNames[key] ?? key] = actionEditContext(key);
        hasEntries = true;
        remove(unused, key);
      } );
      if (! isEmpty(unused)) {
        menu["<Add context>"] = ()=>{ (new AddContext(contexts)).enter(); };
      }
      if (hasEntries) {
        menu["<Delete context>"] = ()=>{ (new DeleteContext(contexts)).enter(); };
      }
    }
  }


  class AddContext extends Menu {
    constructor(contexts) {
      super();
      this.contexts = contexts;
    }

    build(menu) {
      super.build(menu, "Add context for:");

      const contexts = this.contexts;

      const actionAddContext = (key, name) => {
        return ()=>{ addNewContextInOrder(key, contexts);
                     saveConfig();
                     this.pop();  // After editing, go back directly to Contexts menu.
                     (new EditContext(contexts[key], name)).enter();
                   };
      }
      Object.entries(contextNames)
        .filter( e => !contexts[e[0]] ) // Skip entries that already have a context.
        .forEach( e => { menu[e[1]] = actionAddContext(e[0], e[1]); } );
    }
  }


  class DeleteContext extends Menu {
    constructor(contexts) {
      super();
      this.contexts = contexts;
    }

    build(menu) {
      super.build(menu, "Delete context:");
      const contexts = this.contexts;

      const actionDeleteContext = (key, name) => {
        return ()=>{
          E.showPrompt("Delete context for " + name + "?",
                       {buttons: {"Yes, delete!": true, "No, cancel.": false}})
            .then( r => {
              if (r) {
                delete contexts[key];
                saveConfig();
              }
              this.exit();
            } );
        };
      }

      Object.keys(contexts)
        .forEach( key => { let name = contextNames[key] ?? key;
                           menu[name] = actionDeleteContext(key, name);
                         } );
    }
  }


  function setLivePreview(context) {
    WT.setPreviewContext(context);
    WT.setPreviewFocus(undefined);
    Bangle.drawWidgets();
  }

  class EditContext extends Menu {
    static live = true;  // "show live preview?"

    constructor(context, contextName) {
      super();
      this.context = context;
      this.originalContext = recursiveCopy(context);
      this.contextName = contextName;
    }

    enter() {
      setLivePreview(this.constructor.live ? this.context : undefined);
      super.enter();
    }

    exit() {
      setLivePreview(undefined);
      super.exit();
    }

    build(menu) {
      const context = this.context;
      const contextName = this.contextName;

      super.build(menu, "Ctxt: " + contextName);

      if (! recursiveMatch(context, this.originalContext)) {
        // Override default back operation with a "discard changes?" prompt.
        menu[""].back = ()=> {
          E.showPrompt("Discard changes to context for " + contextName + "?",
                       {title: "Unsaved Changes!",
                        buttons: {"Yes, discard!": true, "No, keep editing.": false}})
            .then( r => {
              if (r) {  // discard
                copyInto(this.originalContext, context);
                this.exit();
              } else {
                this.reenter();
              }
            } );
        };
        // Add an explicit "save changes?" option.
        menu["<Save changes>"] = ()=>{
          E.showPrompt("Save changes to context for " + this.contextName + "?",
                       {buttons: {"Yes, save.": true, "No, cancel.": false}})
            .then( r => {
              if (r) { // Yes, save it!
                saveConfig();
                this.originalContext = recursiveCopy(this.context);
              }
              this.reenter();
            } );
        }
      }

      const onTuningExit = (wid)=>{
        // If the tuning is empty, remove it.
        if (isEmpty(context.w[wid])) { delete context.w[wid]; }
      };
      const actionTuning = (wid, name) => {
        return ()=>{ (new EditTuning(wid, name, context.w[wid], onTuningExit)).enter(); };
      };

      let unused = Object.keys(widgetNames);
      let hasWidgets = false;
      for (const id of Object.keys(context.w)) {
        let name = widgetNames[id];
        menu[name] = actionTuning(id, name);
        hasWidgets = true;
        remove(unused, id);
      }
      if (! isEmpty(unused)) {
        menu["<Add tuning>"] = ()=>{ (new AddTuning(context, onTuningExit)).enter(); };
      }
      if (hasWidgets) {
        menu["<Delete tuning>"] = ()=> { (new DeleteTuning(context)).enter(); };
      }
      menu["<Live preview?>"] = {
        value: this.constructor.live,
        onchange: v => { this.constructor.live = v;
                         // Reconstruct UI, in case widget zones have changed existence.
                         this.reenter();
                       }
      };
    }
  }


  class AddTuning extends Menu {
    constructor(context, onExit) {
      super();
      this.context = context;
      this.onExit = onExit;
    }

    build(menu) {
      super.build(menu, "Add tuning for:");
      let context = this.context;
      let onExit = this.onExit;

      const actionAddTuning = (wid, name) => {
        return ()=>{ this.pop();  // After editing, return to EditContext.
                     addNewTuningInOrder(wid, context.w);
                     (new EditTuning(wid, name, context.w[wid], onExit)).enter();
                   };
      };
      for (const kv of Object.entries(widgetNames)) {
        if (context.w[kv[0]]) { continue; } // Skip existing items.
        menu[kv[1]] = actionAddTuning(kv[0], kv[1]);
      }
    }
  }


  class DeleteTuning extends Menu {
    constructor(context) {
      super();
      this.context = context;
    }

    build(menu) {
      super.build(menu, "Delete tuning:");
      let context = this.context;

      const actionDeleteTuning = (wid, name) => {
        return ()=>{ delete context.w[wid];
                     this.exit();
                   };
      };
      Object.keys(context.w)
        .forEach( wid => { let name = widgetNames[wid];
                           menu[name] = actionDeleteTuning(wid, name);
                         } );
    }
  }


  function setFocalWidget(wid) {
    WT.setPreviewFocus(wid);
    Bangle.drawWidgets();
  }

  function safelyDraw() {
    if (! WT.getPreviewContext()) { return; }
    // Update any widget mutations immediately...
    WT.mutateWidgets();
    // ...but defer graphics operations until idle.
    setTimeout(Bangle.drawWidgets, 0);
  }

  function areaIcon(a, large) {
    const scale = large ? 12 : 6;
    const L = 3 * scale;
    const render =  s => "\0" + Graphics
          .createArrayBuffer(L, L, 1)
          .drawImage(Graphics.createImage(s), 0, 0, {scale: scale})
          .drawRect(0, 0, L-1, L-1)
          .asImage("string");
    switch (a) {
    case "tl": return render("X  \n   \n   ");
    case "tc": return render(" X \n   \n   ");
    case "tr": return render("  X\n   \n   ");
    case "bl": return render("   \n   \nX  ");
    case "bc": return render("   \n   \n X ");
    case "br": return render("   \n   \n  X");
    }
    return undefined;
  }

  class EditTuning extends Menu {
    constructor(widgetId, widgetName, tune, onExit) {
      super();
      this.widgetId = widgetId;
      this.widgetName = widgetName;
      this.tune = tune;
      this.onExit = onExit;
    }

    enter() {
      setFocalWidget(this.widgetId);
      super.enter();
    }

    exit() {
      setFocalWidget(undefined);
      if (this.onExit) { this.onExit(this.widgetId); }
      super.exit();
    }

    build(menu) {
      let widgetId = this.widgetId;
      let widgetName = this.widgetName;
      let tune = this.tune;
      let onChange = ()=>{ safelyDraw(); };

      let areaSequence = [null, "tl", "tc", "tr", "br", "bc", "bl"];
      let defaultArea = (WT.originalSpecs[widgetId] ?? {}).area;

      super.build(menu, "Tune: " + widgetName);

      const setOrDelete = (k, v) => { if (v) { tune[k] = v; } else { delete tune[k]; } };

      menu["hide"] = {
        value: tune.hide || false,
        onchange: v => { setOrDelete("hide", v);
                         onChange();
                         this.reenter(); // ...in case widget bar visibility changes.
                       }
      };
      menu["location"] = {
        value: (()=>{ let i = areaSequence.indexOf(tune.area ?? null);
                      if (i < 0) { i = 0; }
                      return i; })(),
        min: 0, max: areaSequence.length - 1,
        noList: true, wrap: true,
        format: function (i, context) {
          let tag = areaSequence[i];
          if (context != 1) {
            setOrDelete("area", tag);
            onChange();
          }
          if (tag === null) {
            return "default>" + (areaIcon(defaultArea, false/*small*/) ??
                                 (defaultArea ? defaultArea : "??"));
          }
          let isLarge = (context == 2);  // In the up/down spinner, large icons.
          return areaIcon(tag, isLarge);
        },
        onchange: i => {
          let area = areaSequence[i];
          setOrDelete("area", area);
          onChange();
        }
      };
      menu["priority"] = {
        // NB: If sortorder is ever mutated, will need to use originalSpecs!
        value: tune.order ?? WIDGETS[widgetId].sortorder ?? 0,
        min: -20, max: 20,
        noList: true, wrap: true,
        format: function (v, context) {
          if ((context === undefined) && (tune.order === undefined)) {
            return "default (" + v + ")";
          }
          if (context === 2) { tune.order = v; onChange(); }
          return v;
        },
        onchange: v => { let rebuild = (menu["<Reset order>"] === undefined);
                         tune.order = v;
                         if (rebuild) { this.reenter(); }  // ...to show "Reset order"
                         onChange();
                       }
      };
      if (tune.order !== undefined) {
        menu["<Reset priority>"] = ()=>{ delete tune.order;
                                         this.reenter(); // ...to remove "Reset" option
                                         onChange();
                                       };
      }
      menu["pad left"] = {
        value: tune.padl ?? 0,
        min: -12, max: 12,
        noList: true, wrap: false,
        format: function (v, context) {
          if (context === 2) { tune.padl = v; onChange(); }
          return v;
        },
        onchange: v => { setOrDelete("padl", v);
                         onChange();
                       }
      };
      menu["pad right"] = {
        value: tune.padr ?? 0,
        min: -12, max: 12,
        noList: true, wrap: false,
        format: function (v, context) {
          if (context === 2) { tune.padr = v; onChange(); }
          return v;
        },
        onchange: v => { setOrDelete("padr", v);
                         onChange();
                       }
      };
    }
  }


  let splash = eval(require("Storage").read("f3wdgttune.splash.js"))
      || (()=>Promise.resolve());

  splash().then(()=> {
    Bangle.drawWidgets();
    (new Contexts(config, topLevelBack)).enter();
    });
})
