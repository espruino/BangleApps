(function() {
  var storage = require("Storage");
  var storedApps = storage.readJSON("clkshortcuts.json", 1) || {};
  var items = [];
  if (Object.keys(storedApps).length !== 0) {
    for (var key in storedApps) {
      var source = {
          name: storedApps[key].name,
          img: storedApps[key].icon,
          src: storedApps[key].src,
          get : function() { 
              return { 
                  text : this.name,
                  img : atob(this.img)
              }
          },
          run: function() { load(this.src);},
          show : function() {},
          hide : function() {},
      }
      items.push(source);
    }
  }
  else {
    var source = {
      name: "Shortcuts",
      img: "GBiBAAAAAAAAAAAAAA//8B//+BgAGBgAGBgYGBgYGBgYGBgYGBn/mBn/mBgYGBgYGBgYGBgYGBgAGBgAGB//+A//8AAAAAAAAAAAAA==",
      src: "clkshortcuts.app.js",
      get : function() { 
          return { 
              text : this.name,
              img : atob(this.img)
          }
      },
      run: function() { load(this.src);},
      show : function() {},
      hide : function() {},
    };
    items = [source];
  }
  return {
    name: "Shortcuts",
    items: items
  };
})