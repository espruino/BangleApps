(function() {
  var settings = require("Storage").readJSON("bthome.json",1)||{};
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
        run : function() { Bangle.btHome([{type:"button_event",v:button.v,n:button.n}],{event:true}); }
      }
    })
  };
})
