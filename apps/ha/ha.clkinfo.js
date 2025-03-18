(function() {
    var ha = require("ha.lib.js");
    var triggers = ha.getTriggers();

    var haItems = {
      name: "Home",
      img: atob("GBiBAAAAAAAAAAAAAAAYAAA+AAB+AADD4AHb4APD4Afn8A/n+BxmOD0mnA0ksAwAMA+B8A/D8A/n8A/n8A/n8A/n8AAAAAAAAAAAAA=="),
      items: []
    };

    triggers.forEach((trigger, i) => {
      haItems.items.push({
        name: null,
        get: () => ({ text: trigger.display, img: trigger.getIcon()}),
        show: function() {},
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
