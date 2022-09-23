var exports = {};
/* Module that allows for loading of clock 'info' displays
that can be scrolled through on the clock face.

`load()` returns an array of menu objects, where each object contains a list of menu items:
* 'name' : text to display and identify menu object (e.g. weather)
* 'img' : a 24x24px image
* 'items' : menu items such as temperature, humidity, wind etc.

Note that each item is an object with:

* 'item.name' : friendly name to identify an item (e.g. temperature)
* 'item.get' : function that resolves with:
  {
    'text' : the text to display for this item
    'img' : a 24x24px image to display for this item
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
        get : () => ({ text : "TextOfItem1",
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
      get : () => ({
        text : E.getBattery() + "%",
        img : atob(Bangle.isCharging() ? "GBiBAAABgAADwAAHwAAPgACfAAHOAAPkBgHwDwP4Hwf8Pg/+fB//OD//kD//wD//4D//8D//4B//QB/+AD/8AH/4APnwAHAAACAAAA==" : "GBiBAAAAAAAAAAAAAAAAAAAAAD//+P///IAAAr//Ar//Ar//A7//A7//A7//A7//Ar//AoAAAv///D//+AAAAAAAAAAAAAAAAAAAAA==") }),
      show : function() { this.interval = setInterval(()=>this.emit('redraw'), 60000); Bangle.on("charging", batteryUpdateHandler); batteryUpdateHandler(); },
      hide : function() { clearInterval(this.interval); delete this.interval; Bangle.removeListener("charging", batteryUpdateHandler); },
    },
    { name : "Steps", get : () => ({
        text : Bangle.getHealthStatus("day").steps,
        img : atob("GBiBAAcAAA+AAA/AAA/AAB/AAB/gAA/g4A/h8A/j8A/D8A/D+AfH+AAH8AHn8APj8APj8AHj4AHg4AADAAAHwAAHwAAHgAAHgAADAA==") }),
      show : function() { Bangle.on("step", stepUpdateHandler); stepUpdateHandler(); },
      hide : function() { Bangle.removeListener("step", stepUpdateHandler); },
    },
    { name : "HRM", get : () => ({
        text : Math.round(Bangle.getHealthStatus("last").bpm) + " bpm",
        img : atob("GBiBAAAAAAAAAAAAAAAAAAAAAADAAADAAAHAAAHjAAHjgAPngH9n/n82/gA+AAA8AAA8AAAcAAAYAAAYAAAAAAAAAAAAAAAAAAAAAA==") }),
      show : function() { Bangle.setHRMPower(1,"clkinfo"); Bangle.on("HRM", hrmUpdateHandler); hrm = Math.round(Bangle.getHealthStatus("last").bpm); hrmUpdateHandler(); },
      hide : function() { Bangle.setHRMPower(0,"clkinfo"); Bangle.removeListener("HRM", hrmUpdateHandler); hrm = "--"; },
    }
  ],
  }];
  var bangleItems = menu[0].items;

  if (Bangle.getPressure){  // Altimeter may not exist
    bangleItems.push({ name : "Altitude", get : () => ({
        text : alt,
        img : atob("GBiBAAAAAAAAAAAAAAAAAAAAAAACAAAGAAAPAAEZgAOwwAPwQAZgYAwAMBgAGBAACDAADGAABv///////wAAAAAAAAAAAAAAAAAAAA==") }),
      show : function() { this.interval = setInterval(altUpdateHandler, 60000); alt = "--"; altUpdateHandler(); },
      hide : function() { clearInterval(this.interval); delete this.interval; },
    });
  }

  // In case there exists already a menu object b with the same name as the next
  // object a, we append the items. Otherwise we add the new object a to the list.
  require("Storage").list(/clkinfo.js$/).forEach(fn => {
    var a = eval(require("Storage").read(fn))();
    var b = menu.find(x => x.name === a.name)
    if(b) b.items = b.items.concat(a.items);
    else menu = menu.concat(a);
  });

  // return it all!
  return menu;
};


// Code for testing
/*
g.clear();
var menu = exports.load(); // or require("clock_info").load()
var itemsFirstMenu = menu[0].items;
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
