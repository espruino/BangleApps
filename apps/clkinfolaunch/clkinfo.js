(function() {
  var settings = require("Storage").readJSON("clkinfolaunch.json",1)||{};
  if (!(settings.buttons instanceof Array))
    settings.buttons = [];
  return {
    name: "Bangle",
    items: settings.buttons.map(button => {
       return { name : button.name,
        get : function() { return { text : button.name,
                                    img : require("icons").getIcon(button.icon) }},
        show : function() {},
        hide : function() {},
        run : function() { Bangle.load(button.app) }
      }
    })
  };
})
