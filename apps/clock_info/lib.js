/* See the README for more info... */

let storage = require("Storage");
let stepGoal = undefined;
// Load step goal from health app and pedometer widget
let d = storage.readJSON("health.json", true) || {};
stepGoal = d.stepGoal;
if (stepGoal == undefined) {
  d = storage.readJSON("wpedom.json", true) || {};
  stepGoal = d != undefined && d.settings != undefined ? d.settings.goal : 10000;
}

// Load the settings, with defaults
exports.loadSettings = function() {
  return Object.assign({
      hrmOn : 0, // 0(Always), 1(Tap)
      defocusOnLock : true,
      maxAltitude : 3000,
      apps : {}
    },
    require("Storage").readJSON("clock_info.json",1)||{}
  );
};

exports.load = function() {
  var settings = exports.loadSettings();
  delete settings.apps; // keep just the basic settings in memory
  // info used for drawing...
  var hrm = 0;
  var alt = "--";
  // callbacks (needed for easy removal of listeners)
  function batteryUpdateHandler() { bangleItems[0].emit("redraw"); }
  function stepUpdateHandler() { bangleItems[1].emit("redraw"); }
  function hrmUpdateHandler(e) {
    if (e && e.confidence>60) hrm = Math.round(e.bpm);
    bangleItems[2].emit("redraw");
  }
  function altUpdateHandler() {
    try {
      Bangle.getPressure().then(data=>{
        if (!data) return;
        alt = Math.round(data.altitude) + "m";
        bangleItems[3].emit("redraw");
      });
    } catch (e) {
      print("Caught "+e+"\n in function altUpdateHandler in module clock_info");
      bangleItems[3].emit('redraw');}
  }
  // actual menu
  var menu = [{
    name: "Bangle",
    img: atob("GBiBAAD+AAH+AAH+AAH+AAH/AAOHAAYBgAwAwBgwYBgwYBgwIBAwOBAwOBgYIBgMYBgAYAwAwAYBgAOHAAH/AAH+AAH+AAH+AAD+AA=="),
    items: [
    { name : "Battery",
      hasRange : true,
      get : () => { let v = E.getBattery(); return {
        text : v + "%", v : v, min:0, max:100,
        img : atob(Bangle.isCharging() ? "GBiBAAABgAADwAAHwAAPgACfAAHOAAPkBgHwDwP4Hwf8Pg/+fB//OD//kD//wD//4D//8D//4B//QB/+AD/8AH/4APnwAHAAACAAAA==" : "GBiBAAAAAAAAAAAAAAAAAAAAAD//+P///IAAAr//Ar//Ar//A7//A7//A7//A7//Ar//AoAAAv///D//+AAAAAAAAAAAAAAAAAAAAA==")
      }},
      show : function() { this.interval = setInterval(()=>this.emit('redraw'), 60000); Bangle.on("charging", batteryUpdateHandler); batteryUpdateHandler(); },
      hide : function() { clearInterval(this.interval); delete this.interval; Bangle.removeListener("charging", batteryUpdateHandler); },
    },
    { name : "Steps",
      hasRange : true,
      get : () => { let v = Bangle.getHealthStatus("day").steps; return {
          text : v, v : v, min : 0, max : stepGoal,
        img : atob("GBiBAAcAAA+AAA/AAA/AAB/AAB/gAA/g4A/h8A/j8A/D8A/D+AfH+AAH8AHn8APj8APj8AHj4AHg4AADAAAHwAAHwAAHgAAHgAADAA==")
      }},
      show : function() { Bangle.on("step", stepUpdateHandler); stepUpdateHandler(); },
      hide : function() { Bangle.removeListener("step", stepUpdateHandler); },
    },
    { name : "HRM",
      hasRange : true,
      get : () => { return {
        text : (hrm||"--") + " bpm", v : hrm, min : 40, max : 200,
        img : atob("GBiBAAAAAAAAAAAAAAAAAAAAAADAAADAAAHAAAHjAAHjgAPngH9n/n82/gA+AAA8AAA8AAAcAAAYAAAYAAAAAAAAAAAAAAAAAAAAAA==")
      }},
      run : function() {
        Bangle.setHRMPower(1,"clkinfo");
        if (settings.hrmOn==1/*Tap*/) {
          /* turn off after 1 minute. If Health HRM monitoring is
          enabled we will still get HRM events every so often */
          this.timeout = setTimeout(function() {
            this.timeout = undefined;
            Bangle.setHRMPower(0,"clkinfo");
          }, 60000);
        }
      },
      show : function() {
        Bangle.on("HRM", hrmUpdateHandler);
        hrm = Math.round(Bangle.getHealthStatus().bpm||Bangle.getHealthStatus("last").bpm); hrmUpdateHandler();
        this.run(); // start HRM
      },
      hide : function() {
        Bangle.setHRMPower(0,"clkinfo");
        Bangle.removeListener("HRM", hrmUpdateHandler);
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = undefined;
        }
        hrm = 0;
      },
    }
  ],
  }];
  var bangleItems = menu[0].items;

  if (Bangle.getPressure){  // Altimeter may not exist
    bangleItems.push({ name : "Altitude",
      hasRange : true,
      get : () => ({
        text : alt, v : parseInt(alt),
        min : 0, max : settings.maxAltitude,
        img : atob("GBiBAAAAAAAAAAAAAAAAAAAAAAACAAAGAAAPAAEZgAOwwAPwQAZgYAwAMBgAGBAACDAADGAABv///////wAAAAAAAAAAAAAAAAAAAA==")
      }),
      show : function() { this.interval = setInterval(altUpdateHandler, 60000); alt = "--"; altUpdateHandler(); },
      hide : function() { clearInterval(this.interval); delete this.interval; },
    });
  }

  // In case there exists already a menu object b with the same name as the next
  // object a, we append the items. Otherwise we add the new object a to the list.
  require("Storage").list(/clkinfo.js$/).forEach(fn => {
    try{
      var a = eval(require("Storage").read(fn))();
      var b = menu.find(x => x.name === a.name)
      if(b) b.items = b.items.concat(a.items);
      else menu = menu.concat(a);
    } catch(e){
      console.log("Could not load clock info "+E.toJS(fn))
    }
  });

  // return it all!
  return menu;
};


/** Adds an interactive menu that could be used on a clock face by swiping.
Simply supply the menu data (from .load) and a function to draw the clock info.

options = {
  app : "str",                // optional: app ID used when saving clock_info positions
                              // if defined, your app will remember its own positions,
                              // otherwise all apps share the same ones
  x : 20, y: 20, w: 80, h:80, // dimensions of area used for clock_info
  draw : (itm, info, options) // draw function
}

For example:

let clockInfoItems = require("clock_info").load();
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, {
  x : 20, y: 20, w: 80, h:80, // dimensions of area used for clock_info
  draw : (itm, info, options) => {
    g.reset().clearRect(options.x, options.y, options.x+options.w-2, options.y+options.h-1);
    if (options.focus) g.drawRect(options.x, options.y, options.x+options.w-2, options.y+options.h-1); // show if focused
    var midx = options.x+options.w/2;
    if (info.img) g.drawImage(info.img, midx-12,options.y+4);
    g.setFont("6x8:2").setFontAlign(0,1).drawString(info.text, midx,options.y+44);
  }
});
// then when clock 'unloads':
clockInfoMenu.remove();
delete clockInfoMenu;

Then if you need to unload the clock info so it no longer
uses memory or responds to swipes, you can call clockInfoMenu.remove()
and delete clockInfoMenu

clockInfoMenu is the 'options' parameter, with the following added:

* `index` : int - which instance number are we? Starts at 0
* `menuA` : int - index in 'menu' of showing clockInfo item
* `menuB` : int - index in 'menu[menuA].items' of showing clockInfo item
* `remove` : function - remove this clockInfo item
* `redraw` : function - force a redraw
* `focus` : function - bool to show if menu is focused or not

You can have more than one clock_info at once as well, for instance:

let clockInfoDraw = (itm, info, options) => {
  g.reset().setBgColor(options.bg).setColor(options.fg).clearRect(options.x, options.y, options.x+options.w-2, options.y+options.h-1);
  if (options.focus) g.drawRect(options.x, options.y, options.x+options.w-2, options.y+options.h-1)
  var midx = options.x+options.w/2;
  if (info.img) g.drawImage(info.img, midx-12,options.y);
  g.setFont("6x15").setFontAlign(0,1).drawString(info.text, midx,options.y+41);
};
let clockInfoItems = require("clock_info").load();
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, { x:126, y:24, w:50, h:40, draw : clockInfoDraw, bg : g.theme.bg, fg : g.theme.fg });
let clockInfoMenu2 = require("clock_info").addInteractive(clockInfoItems, { x:0, y:120, w:50, h:40, draw : clockInfoDraw, bg : bgColor, fg : g.theme.bg});

*/
exports.addInteractive = function(menu, options) {
  if (!menu.length || !menu[0].items.length) return; // no infos - can't load a clock_info
  if ("function" == typeof options) options = {draw:options}; // backwards compatibility
  options.index = 0|exports.loadCount;
  exports.loadCount = options.index+1;
  options.focus = options.index==0 && options.x===undefined; // focus if we're the first one loaded and no position has been defined
  const appName = (options.app||"default")+":"+options.index;

  // load the currently showing clock_infos
  let settings = exports.loadSettings()
  if (settings.apps[appName]) {
    let a = settings.apps[appName].a|0;
    let b = settings.apps[appName].b|0;
    if (menu[a] && menu[a].items[b]) { // all ok
      options.menuA = a;
      options.menuB = b;
    }
  }

  if (options.menuA===undefined) options.menuA = 0;
  if (options.menuB===undefined) options.menuB = Math.min(exports.loadCount, menu[options.menuA].items.length)-1;
  function drawItem(itm) {
    options.draw(itm, itm.get(), options);
  }
  function menuShowItem(itm) {
    options.redrawHandler = ()=>drawItem(itm);
    itm.on('redraw', options.redrawHandler);
    itm.uses = (0|itm.uses)+1;
    if (itm.uses==1) itm.show();
    itm.emit("redraw");
  }
  function menuHideItem(itm) {
    itm.removeListener('redraw',options.redrawHandler);
    delete options.redrawHandler;
    itm.uses--;
    if (!itm.uses)
      itm.hide();
  }
  // handling for swipe between menu items
  function swipeHandler(lr,ud){
    if (!options.focus) return; // ignore if we're not focussed
    var oldMenuItem;
    if (ud) {
      if (menu[options.menuA].items.length==1) return; // 1 item - can't move
      oldMenuItem = menu[options.menuA].items[options.menuB];
      options.menuB += ud;
      if (options.menuB<0) options.menuB = menu[options.menuA].items.length-1;
      if (options.menuB>=menu[options.menuA].items.length) options.menuB = 0;
    } else if (lr) {
      if (menu.length==1) return; // 1 item - can't move
      oldMenuItem = menu[options.menuA].items[options.menuB];
      do {
        options.menuA += lr;
        if (options.menuA<0) options.menuA = menu.length-1;
        if (options.menuA>=menu.length) options.menuA = 0;
        options.menuB = 0;
        //get the next one if the menu is empty
        //can happen for dynamic ones (alarms, events)
        //in the worst case we come back to 0
      } while(menu[options.menuA].items.length==0);
    }
    if (oldMenuItem) {
      menuHideItem(oldMenuItem);
      oldMenuItem.removeAllListeners("draw");
      menuShowItem(menu[options.menuA].items[options.menuB]);
    }
    // save the currently showing clock_info
    let settings = exports.loadSettings();
    settings.apps[appName] = {a:options.menuA,b:options.menuB};
    require("Storage").writeJSON("clock_info.json",settings);
  }
  Bangle.on("swipe",swipeHandler);
  let touchHandler, lockHandler;
  if (options.x!==undefined && options.y!==undefined && options.w && options.h) {
    touchHandler = function(_,e) {
      if (e.x<options.x || e.y<options.y ||
          e.x>(options.x+options.w) || e.y>(options.y+options.h)) {
        if (options.focus) {
          options.focus=false;
          delete Bangle.CLKINFO_FOCUS;
          options.redraw();
        }
        return; // outside area
      }
      if (!options.focus) {
        options.focus=true; // if not focussed, set focus
        Bangle.CLKINFO_FOCUS=true;
        options.redraw();
      } else if (menu[options.menuA].items[options.menuB].run) {
        Bangle.buzz(100, 0.7);
        menu[options.menuA].items[options.menuB].run(); // allow tap on an item to run it (eg home assistant)
      } else {
        options.focus=true;
        Bangle.CLKINFO_FOCUS=true;
      }
    };
    Bangle.on("touch",touchHandler);
    if (settings.defocusOnLock) {
      lockHandler = function() {
        if(options.focus) {
          options.focus=false;
          delete Bangle.CLKINFO_FOCUS;
          options.redraw();
        }
      };
      Bangle.on("lock", lockHandler);
    }
  }
  // draw the first item
  menuShowItem(menu[options.menuA].items[options.menuB]);
  // return an object with info that can be used to remove the info
  options.remove = function() {
    Bangle.removeListener("swipe",swipeHandler);
    if (touchHandler) Bangle.removeListener("touch",touchHandler);
    if (lockHandler) Bangle.removeListener("lock", lockHandler);
    delete Bangle.CLKINFO_FOCUS;
    menuHideItem(menu[options.menuA].items[options.menuB]);
    exports.loadCount--;
  };
  options.redraw = function() {
    drawItem(menu[options.menuA].items[options.menuB]);
  };
  options.setItem = function (menuA, menuB) {
    if (!menu[menuA] || !menu[menuA].items[menuB] || (options.menuA == menuA && options.menuB == menuB)) {
      // menuA or menuB did not exist or did not change
      return false;
    }

    const oldMenuItem = menu[options.menuA].items[options.menuB];
    if (oldMenuItem) {
      menuHideItem(oldMenuItem);
      oldMenuItem.removeAllListeners("draw");
    }
    options.menuA = menuA;
    options.menuB = menuB;
    menuShowItem(menu[options.menuA].items[options.menuB]);

    return true;
  }

  delete settings; // don't keep settings in RAM - save space
  return options;
};

// Code for testing (plots all elements from first list)
/*
g.clear();
var menu = exports.load(); // or require("clock_info").load()
var items = menu[0].items;
items.forEach((itm,i) => {
  var y = i*24;
  console.log("Starting", itm.name);
  function draw() {
    var info = itm.get();
    g.reset().setFont("6x8:2").setFontAlign(-1,0);
    g.clearRect(0,y,g.getWidth(),y+23);
    g.drawImage(info.img, 0,y);
    g.drawString(info.text, 48,y+12);
  }
  itm.on('redraw', draw); // ensures we redraw when we need to
  itm.show();
  draw();
});
*/
