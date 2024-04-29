(function(back) {
  var settings;

  function loadSettings() {
    settings = require("Storage").readJSON("bthome.json",1)||{};
    if (!(settings.buttons instanceof Array))
      settings.buttons = [];
  }

  function saveSettings() {
    require("Storage").writeJSON("bthome.json",settings)
  }

  function showButtonMenu(button, isNew) {
    var isNew = false;
    if (!button) {
      button = {name:"home", icon:"home", n:0, v:"press"};
      isNew = true;
    }
    var actions = ["press","double_press","triple_press","long_press","long_double_press","long_triple_press"];
    var menu = {
      "":{title:isNew ? /*LANG*/"New Button" : /*LANG*/"Edit Button", back: () => {
        loadSettings(); // revert changes
        showMenu();
      }},
      /*LANG*/"Icon" : {
        value : "\0"+require("icons").getIcon(button.icon),
        onchange : () => {
          require("icons").showIconChooser().then(function(iconName) {
            button.icon = iconName;
            button.name = iconName;
            showButtonMenu(button, isNew);
          }, function() {
            showButtonMenu(button, isNew);
          });
        }
      },
      /*LANG*/"Name" : {
        value : button.name,
        onchange : () => {
          require("textinput").input({text:button.name}).then(function(name) {
            button.name = name;
            showButtonMenu(button, isNew);
          }, function() {
            showButtonMenu(button, isNew);
          });
        }
      },
      /*LANG*/"Action" : {
        value : Math.max(0,actions.indexOf(button.v)), min:0, max:actions.length-1,
        format : v => actions[v],
        onchange : v => button.v=actions[v]
      },
      /*LANG*/"Button #" : {
        value : button.n, min:0, max:3,
        onchange : v => button.n=v
      },
      /*LANG*/"Save" : () => {
        if (isNew) settings.buttons.push(button);
        saveSettings();
        showMenu();
      }
    };
    if (!isNew) menu[/*LANG*/"Delete"] = function() {
      E.showPrompt("Delete Button?").then(function(yes) {
        if (yes) {
          settings.buttons.splice(settings.buttons.indexOf(button),1);
          saveSettings();
        }
        showMenu();
      });
    }
    E.showMenu(menu);
  }

  function showMenu() {
    var menu = [];
    menu[""] = {title:"BTHome", back:back};
    menu.push({
      title : /*LANG*/"Show Battery",
      value : !!settings.showBattery,
      onchange : v=>{
        settings.showBattery = v;
        saveSettings();
      }
    });
    settings.buttons.forEach((button,idx) => {
      var img = require("icons").getIcon(button.icon);
      menu.push({
        title : /*LANG*/"Button"+(img ? " \0"+img : (idx+1)),
        onchange : function() {
          showButtonMenu(button, false);
        }
      });
    });
    menu.push({
      title : /*LANG*/"Add Button",
      onchange : function() {
        showButtonMenu(undefined, true);
      }
    });
    E.showMenu(menu);
  }

  loadSettings();
  showMenu();
})