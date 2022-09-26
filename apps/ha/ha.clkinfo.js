(function() {
    var ha = require("ha.lib.js");
    var triggers = ha.getTriggers();

    var haItems = {
      name: "Home",
      img: atob("GBiBAf/////////n///D//+B//8A//48T/wkD/gkD/A8D+AYB8AYA4eZ4QyZMOyZN+fb5+D/B+B+B+A8B+AYB+AYB+AYB+AYB+A8Bw=="),
      items: []
    };

    triggers.forEach((trigger, i) => {
      haItems.items.push({
        name: "haTrigger-" + i,
        get: () => ({ text: trigger.display, img: trigger.getIcon()}),
        show: function() { haItems.items[i].emit("redraw"); },
        hide: function () {},
        run: function() {
          ha.sendTrigger("TRIGGER_BW");
          ha.sendTrigger(trigger.trigger);
          return true;
        }
      });
    });

    return haItems;
})