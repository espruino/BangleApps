(function () {
  var timeout;

  var debug = function(o) {
    //console.log(o);
  };

  var clearTimer = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
      debug("timer cleared");
    }
  };

  var queueRedraw = function() {
    clearTimer();
    timeout = setTimeout(function() {
      timeout = undefined;
      queueRedraw();
    }, 60000);
    info.items[0].emit("redraw");
    debug("queued");
  };

  var img = function() {
    return atob("GBgBAAAAAAAAAAAAB//gD//wH//4HgB4HAA4HAA4HAA4HDw4HDw4HDw4HDw4HAA4HAA4HAA4HgB4H//4D//wB//gAAAAAAAAAAAA");
  };

  var text = function() {
    var val = process.memory(false);
    return '' + Math.round(val.usage*100 / val.total) + '%';
  };

  var info = {
    name: "Bangle",
    items: [
      {
        name: "ram",
        get: function () { return ({
          img: img(),
          text: text()
        }); },
        run : function() {
          debug("run");
          queueRedraw();
        },
        show: function () {
          debug("show");
          this.run();
        },
        hide: function() {
          debug("hide");
          clearTimer();
        }
      }
    ]
  };

  return info;
})
