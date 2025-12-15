(function(back) {
  var settings;

  function loadSettings() {
    settings = require("Storage").readJSON("clkinfolaunch.json",1)||{};
    if (!(settings.buttons instanceof Array))
      settings.buttons = [];
  }

  function saveSettings() {
    require("Storage").writeJSON("clkinfolaunch.json",settings)
  }

  function showAppChooser() {
    let apps = require("Storage").list(/\.info$/);
    var menu = {
      "":{title:/*LANG*/"Choose App", back: () => {
        showMenu();
    }}};
    apps.forEach(fn => {
      let inf = require("Storage").readJSON(fn,1)||{};
      inf = { name:inf.name, src:inf.src, icon:inf.icon };
      if (inf.src) menu[inf.name] = () => {
        showButtonMenu({
          name:inf.name,
          icon:"home",
          app:inf.src
        }, true);
      };
    });
    E.showMenu(menu);
  }

  function showButtonMenu(button, isNew) {
    if (!button) {
      button = {name:"home", icon:"home"};
      isNew = true;
    }
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
    menu[""] = {title:"ClkInfo Launcher", back:back};
    settings.buttons.forEach((button,idx) => {
      var img = require("icons").getIcon(button.icon);
      menu.push({
        title : button.name+" \0"+img,
        onchange : function() {
          showButtonMenu(button, false);
        }
      });
    });
    menu.push({
      title : /*LANG*/"Add Button",
      onchange : function() {
        showAppChooser();
      }
    });
    E.showMenu(menu);
  }

  loadSettings();
  showMenu();
})