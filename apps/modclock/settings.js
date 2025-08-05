(function(back) {
  const FILE = "modclock.settings.json";
  
  let settings = Object.assign({
    color: "#00FF00" // default (green)
  }, require('Storage').readJSON(FILE, true) || {});

  function save() {
    require('Storage').writeJSON(FILE, settings);
    console.log("Saved settings:", settings);
  }

  const colors = {
    "Red": "#FF0000",
    "Green": "#00FF00",
    "Blue": "#0000FF",
    "Yellow": "#FFFF00",
    "Purple": "#FF00FF",
    "Cyan": "#00FFFF"
  };

  function showMainMenu(back) {
    E.showMenu({
      "" : { title : "Modern Clock" },
      "< Back" : () => back(),
      "Accent Color" : () => showColorMenu(back)
    });
  }

  function showColorMenu() {
    const menu = {
      "" : { title: "Pick Color" },
      "< Back" : () => showMainMenu(back)
    };

    for (let name in colors) {
      (function(n) {
        menu[n] = () => {
          settings.color = colors[n];
          save();
          showMainMenu(back);
        };
      })(name);
    }
    E.showMenu(menu);
  }
  showMainMenu(back);
})
