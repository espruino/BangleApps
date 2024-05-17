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

/// How many times has addInteractive been called?
exports.loadCount = 0;
/// A list of all the instances returned by addInteractive
exports.clockInfos = [];

/// Load the settings, with defaults
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

/// Load a list of ClockInfos - this does not cache and reloads each time
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
      get : () => { let v = E.getBattery();
        var img;
        if (!Bangle.isCharging()) {
          var s=24, g=Graphics.createArrayBuffer(24,24,1,{msb:true});
          g.fillRect(0,6,s-3,18).clearRect(2,8,s-5,16).fillRect(s-2,10,s,15).fillRect(3,9,3+v*(s-9)/100,15);
          g.transparent=0; // only works on 2v18+, ignored otherwise (makes image background transparent)
          img = g.asImage("string");
        } else img=atob("GBiBAAABgAADwAAHwAAPgACfAAHOAAPkBgHwDwP4Hwf8Pg/+fB//OD//kD//wD//4D//8D//4B//QB/+AD/8AH/4APnwAHAAACAAAA==");
        return {
          text : v + "%", v : v, min:0, max:100, img : img
        };
      },
      show : function() { this.interval = setInterval(()=>this.emit('redraw'), 60000); Bangle.on("charging", batteryUpdateHandler); batteryUpdateHandler(); },
      hide : function() { clearInterval(this.interval); delete this.interval; Bangle.removeListener("charging", batteryUpdateHandler); },
    },
    { name : "Steps",
      hasRange : true,
      get : () => { let v = Bangle.getHealthStatus("day").steps; return {
          text : v, v : v, min : 0, max : stepGoal,
        img : atob("GBiBAAcAAA+AAA/AAA/AAB/AAB/gAA/g4A/h8A/j8A/D8A/D+AfH+AAH8AHn8APj8APj8AHj4AHg4AADAAAHwAAHwAAHgAAHgAADAA==")
      };},
      show : function() { Bangle.on("step", stepUpdateHandler); stepUpdateHandler(); },
      hide : function() { Bangle.removeListener("step", stepUpdateHandler); },
    },
    { name : "HRM",
      hasRange : true,
      get : () => { return {
        text : (hrm||"--") + " bpm", v : hrm, min : 40, max : 200,
        img : atob("GBiBAAAAAAAAAAAAAAAAAAAAAADAAADAAAHAAAHjAAHjgAPngH9n/n82/gA+AAA8AAA8AAAcAAAYAAAYAAAAAAAAAAAAAAAAAAAAAA==")
      };},
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
      var b = menu.find(x => x.name === a.name);
      if(b) b.items = b.items.concat(a.items);
      else menu = menu.concat(a);
    } catch(e){
      console.log("Could not load clock info "+E.toJS(fn)+": "+e);
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
  exports.clockInfos[options.index] = options;
  options.focus = options.index==0 && options.x===undefined; // focus if we're the first one loaded and no position has been defined
  const appName = (options.app||"default")+":"+options.index;

  // load the currently showing clock_infos
  let settings = exports.loadSettings();
  if (settings.apps[appName]) {
    let a = settings.apps[appName].a|0;
    let b = settings.apps[appName].b|0;
    if (menu[a] && menu[a].items[b]) { // all ok
      options.menuA = a;
      options.menuB = b;
    }
  }
  const save = () => {
    // save the currently showing clock_info
    const settings = exports.loadSettings();
    settings.apps[appName] = {a:options.menuA, b:options.menuB};
    require("Storage").writeJSON("clock_info.json",settings);
  };
  E.on("kill", save);

  if (options.menuA===undefined) options.menuA = 0;
  if (options.menuB===undefined) options.menuB = Math.min(exports.loadCount, menu[options.menuA].items.length)-1;
  function drawItem(itm) {
    options.draw(itm, itm.get(), options);
  }
  function menuShowItem(itm) {
    options.redrawHandler = ()=>drawItem(itm);
    itm.on('redraw', options.redrawHandler);
    itm.uses = (0|itm.uses)+1;
    if (itm.uses==1) itm.show(options);
    itm.emit("redraw");
  }
  function menuHideItem(itm) {
    itm.removeListener('redraw',options.redrawHandler);
    delete options.redrawHandler;
    itm.uses--;
    if (!itm.uses)
      itm.hide(options);
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
      // When we change, ensure we don't display the same thing as another clockinfo if we can avoid it
      while ((options.menuB < menu[options.menuA].items.length) &&
             exports.clockInfos.some(m => (m!=options) && m.menuA==options.menuA && m.menuB==options.menuB))
          options.menuB++;
    }
    if (oldMenuItem) {
      menuHideItem(oldMenuItem);
      oldMenuItem.removeAllListeners("draw");
      menuShowItem(menu[options.menuA].items[options.menuB]);
    }
    // On 2v18+ firmware we can stop other event handlers from being executed since we handled this
    E.stopEventPropagation&&E.stopEventPropagation();
  }
  if (Bangle.prependListener) {Bangle.prependListener("swipe",swipeHandler);} else {Bangle.on("swipe",swipeHandler);}
  const blur = () => {
    options.focus=false;
    Bangle.CLKINFO_FOCUS--;
    const itm = menu[options.menuA].items[options.menuB];
    let redraw = true;
    if (itm.blur && itm.blur(options) === false)
      redraw = false;
    if (redraw) options.redraw();
  };
  const focus = () => {
    let redraw = true;
    Bangle.CLKINFO_FOCUS = (0 | Bangle.CLKINFO_FOCUS) + 1;
    if (!options.focus) {
      options.focus=true;
      const itm = menu[options.menuA].items[options.menuB];
      if (itm.focus && itm.focus(options) === false)
        redraw = false;
    }
    if (redraw) options.redraw();
  };
  let touchHandler, lockHandler;
  if (options.x!==undefined && options.y!==undefined && options.w && options.h) {
    touchHandler = function(_,e) {
      if (e.x<options.x || e.y<options.y ||
          e.x>(options.x+options.w) || e.y>(options.y+options.h)) {
        if (options.focus)
          blur();
        return; // outside area
      }
      if (!options.focus) {
        focus();
      } else if (menu[options.menuA].items[options.menuB].run) {
        Bangle.buzz(100, 0.7);
        menu[options.menuA].items[options.menuB].run(options); // allow tap on an item to run it (eg home assistant)
      }
    };
    Bangle.on("touch",touchHandler);
    if (settings.defocusOnLock) {
      lockHandler = function() {
        if(options.focus)
          blur();
      };
      Bangle.on("lock", lockHandler);
    }
  }
  // draw the first item
  menuShowItem(menu[options.menuA].items[options.menuB]);
  // return an object with info that can be used to remove the info
  options.remove = function() {
    save();
    E.removeListener("kill", save);
    Bangle.removeListener("swipe",swipeHandler);
    if (touchHandler) Bangle.removeListener("touch",touchHandler);
    if (lockHandler) Bangle.removeListener("lock", lockHandler);
    Bangle.CLKINFO_FOCUS--;
    menuHideItem(menu[options.menuA].items[options.menuB]);
    exports.loadCount--;
    delete exports.clockInfos[options.index];
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
  };
  if (options.focus) focus();
  delete settings; // don't keep settings in RAM - save space
  return options;
};

/* clockinfos usually return a 24x24 image. This draws that image but
recolors it such that it is transparent, with the middle of the image as background
and the image itself as foreground. options is passed to g.drawImage */
exports.drawFilledImage = function(img,x,y,options) {
  if (!img) return;
  if (!g.floodFill/*2v18+*/) return g.drawImage(img,x,y,options);
  let gfx = exports.imgGfx;
  if (!gfx) {
    gfx = exports.imgGfx = Graphics.createArrayBuffer(26, 26, 2, {msb:true});
    gfx.transparent = 3;
    gfx.palette = new Uint16Array([g.theme.bg, g.theme.fg, g.toColor("#888"), g.toColor("#888")]);
  }
  /* img is (usually) a black and white transparent image. But we really would like the bits in
  the middle of it to be white. So what we do is we draw a slightly bigger rectangle in white,
  draw the image, and then flood-fill the rectangle back to the background color. floodFill
  was only added in 2v18 so we have to check for it and fallback if not. */
  gfx.clear(1).setColor(1).drawImage(img, 1,1).floodFill(0,0,3);
  var scale = (options && options.scale) || 1;
  return g.drawImage(gfx, x-scale,y-scale,options);
};

/* clockinfos usually return a 24x24 image. This creates a 26x26 gfx of the image but
recolors it such that it is transparent, with the middle and border of the image as background
and the image itself as foreground. options is passed to g.drawImage */
exports.drawBorderedImage = function(img,x,y,options) {
  if (!img) return;
  if (!g.floodFill/*2v18+*/) return g.drawImage(img,x,y,options);
  let gfx = exports.imgGfxB;
  if (!gfx) {
    gfx = exports.imgGfxB = Graphics.createArrayBuffer(28, 28, 2, {msb:true});
    gfx.transparent = 3;
    gfx.palette = new Uint16Array([g.theme.bg, g.theme.fg, g.theme.bg/*border*/, g.toColor("#888")]);
  }
  gfx.clear(1).setColor(2).drawImage(img, 1,1).drawImage(img, 3,1).drawImage(img, 1,3).drawImage(img, 3,3); // border
  gfx.setColor(1).drawImage(img, 2,2); // main image
  gfx.floodFill(27,27,3); // flood fill edge to transparent
  var o = ((options && options.scale) || 1)*2;
  return g.drawImage(gfx, x-o,y-o,options);
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
