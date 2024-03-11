Bangle.loadWidgets();
Bangle.drawWidgets();

function showMenu() {
  var settings = require("Storage").readJSON("bthome.json",1)||{};
  if (!(settings.buttons instanceof Array))
    settings.buttons = [];
  var menu = { "": {title:"BTHome", back:load} };
  settings.buttons.forEach((button,idx) => {
    var img = require("icons").getIcon(button.icon);
    menu[/*LANG*/"\0"+img+" "+button.name] = function() {
      Bangle.btHome([{type:"button_event",v:button.v,n:button.n}],{event:true});
      E.showMenu();
      E.showMessage("Sending Event");
      Bangle.buzz();
      setTimeout(showMenu, 500);
    };
  });
  menu[/*LANG*/"Settings"] = function() {
    eval(require("Storage").read("bthome.settings.js"))(()=>showMenu());
  };
  E.showMenu(menu);
}

showMenu();


