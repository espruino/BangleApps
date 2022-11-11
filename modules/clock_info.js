var exports = {};
/* Module that allows for loading of clock 'info' displays
that can be scrolled through on the clock face.

`load()` returns an array of menu objects, where each object contains a list of menu items:
* 'name' : text to display and identify menu object (e.g. weather)
* 'img' : a 24x24px image
* 'items' : menu items such as temperature, humidity, wind etc.

Note that each item is an object with:

* 'item.name' : friendly name to identify an item (e.g. temperature)
* 'item.hasRange' : if `true`, `.get` returns `v/min/max` values (for progress bar/guage)
* 'item.get' : function that resolves with:
  {
    'text' : the text to display for this item
    'img' : a 24x24px image to display for this item
    'v' : (if hasRange==true) a numerical value
    'min','max' : (if hasRange==true) a minimum and maximum numerical value (if this were to be displayed as a guage)
  }
* 'item.show' : called when item should be shown. Enables updates. Call BEFORE 'get'
* 'item.hide' : called when item should be hidden. Disables updates.
* .on('redraw', ...) : event that is called when 'get' should be called again (only after 'item.show')
* 'item.run' : (optional) called if the info screen is tapped - can perform some action. Return true if the caller should feedback the user.

See the bottom of this file for example usage...

example.clkinfo.js :

(function() {
  return {
    name: "Bangle",
    img: atob("GBiBAAD+AAH+AAH+AAH+AAH/AAOHAAYBgAwAwBgwYBgwYBgwIBAwOBAwOBgYIBgMYBgAYAwAwAYBgAOHAAH/AAH+AAH+AAH+AAD+AA==") }),
    items: [
      { name : "Item1",
        get : () => ({ text : "TextOfItem1", v : 10, min : 0, max : 100,
                      img : atob("GBiBAAD+AAH+AAH+AAH+AAH/AAOHAAYBgAwAwBgwYBgwYBgwIBAwOBAwOBgYIBgMYBgAYAwAwAYBgAOHAAH/AAH+AAH+AAH+AAD+AA==") }),
        show : () => {},
        hide : () => {}
      }
    ]
  };
}) // must not have a semi-colon!

*/


exports.load = function() {
  // info used for drawing...
  var hrm = "--";
  var alt = "--";
  // callbacks (needed for easy removal of listeners)
  function batteryUpdateHandler() { bangleItems[0].emit("redraw"); }
  function stepUpdateHandler() { bangleItems[1].emit("redraw"); }
  function hrmUpdateHandler() { bangleItems[2].emit("redraw"); }
  function altUpdateHandler() {
    Bangle.getPressure().then(data=>{
      if (!data) return;
      alt = Math.round(data.altitude) + "m";
      bangleItems[3].emit("redraw");
    });
  }
  // actual menu
  var menu = [{
    name: "Bangle",
    img: atob("GBiBAf8B//4B//4B//4B//4A//x4//n+f/P/P+fPn+fPn+fP3+/Px+/Px+fn3+fzn+f/n/P/P/n+f/x4//4A//4B//4B//4B//8B/w=="),
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
          text : v, v : v, min : 0, max : 10000, // TODO: do we have a target step amount anywhere?
        img : atob("GBiBAAcAAA+AAA/AAA/AAB/AAB/gAA/g4A/h8A/j8A/D8A/D+AfH+AAH8AHn8APj8APj8AHj4AHg4AADAAAHwAAHwAAHgAAHgAADAA==")
      }},
      show : function() { Bangle.on("step", stepUpdateHandler); stepUpdateHandler(); },
      hide : function() { Bangle.removeListener("step", stepUpdateHandler); },
    },
    { name : "HRM",
      hasRange : true,
      get : () => { let v =  Math.round(Bangle.getHealthStatus("last").bpm); return {
        text : v + " bpm", v : v, min : 40, max : 200,
        img : atob("GBiBAAAAAAAAAAAAAAAAAAAAAADAAADAAAHAAAHjAAHjgAPngH9n/n82/gA+AAA8AAA8AAAcAAAYAAAYAAAAAAAAAAAAAAAAAAAAAA==")
      }},
      show : function() { Bangle.setHRMPower(1,"clkinfo"); Bangle.on("HRM", hrmUpdateHandler); hrm = Math.round(Bangle.getHealthStatus("last").bpm); hrmUpdateHandler(); },
      hide : function() { Bangle.setHRMPower(0,"clkinfo"); Bangle.removeListener("HRM", hrmUpdateHandler); hrm = "--"; },
    }
  ],
  }];
  var bangleItems = menu[0].items;

  if (Bangle.getPressure){  // Altimeter may not exist
    bangleItems.push({ name : "Altitude",
      get : () => ({
        text : alt, v : alt,
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
      console.log("Could not load clock info.")
    }
  });

  // return it all!
  return menu;
};

/** Adds an interactive menu that could be used on a clock face by swiping.
Simply supply the menu data (from .load) and a function to draw the clock info.

For example:

var clockInfoMenu = require("clock_info").addInteractive(require("clock_info").load(), (itm, info) => {
  var y = 0;
  g.reset().setFont("6x8:2").setFontAlign(-1,0);
  g.clearRect(0,y,g.getWidth(),y+23);
  g.drawImage(info.img, 0,y);
  g.drawString(info.text, 48,y+12);
});

Then if you need to unload the clock info so it no longer
uses memory or responds to swipes, you can call clockInfoMenu.remove()
and delete clockInfoMenu
*/
exports.addInteractive = function(menu, drawFn) {
  if (!menu.length || !menu[0].items.length) return; // no info
  var menuA = 0, menuB = 0;
  function menuShowItem(itm) {
    itm.on('redraw', ()=>drawFn(itm, itm.get()));
    itm.show();
    itm.emit("redraw");
  }
  // handling for swipe between menu items
  function swipeHandler(lr,ud){
    var oldMenuItem;
    if (ud) {
      if (menu[menuA].items.length==1) return; // 1 item - can't move
      oldMenuItem = menu[menuA].items[menuB];
      menuB += ud;
      if (menuB<0) menuB = menu[menuA].items.length-1;
      if (menuB>=menu[menuA].items.length) menuB = 0;
    } else if (lr) {
      if (menu.length==1) return; // 1 item - can't move
      oldMenuItem = menu[menuA].items[menuB];
      menuA += ud;
      if (menuA<0) menuA = menu.length-1;
      if (menuA>=menu.length) menuA = 0;
      menuB = 0;
    }
    if (oldMenuItem) {
      oldMenuItem.hide();
      oldMenuItem.removeAllListeners("draw");
      menuShowItem(menu[menuA].items[menuB]);
    }
  }
  Bangle.on("swipe",swipeHandler);
  // draw the first item
  menuShowItem(menu[menuA].items[menuB]);
  // return an object with info that can be used to remove the info
  return {
    remove : function() {
      Bangle.removeListener("swipe",swipeHandler);
      menu[menuA].items[menuB].hide();
    }
  };
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
