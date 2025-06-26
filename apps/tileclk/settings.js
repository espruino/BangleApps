(function(back){
  let appSettings = Object.assign({
    widgets: "show",
    seconds: "hide",
    borders: true,
    borderColor: "theme",
    haptics: true
  }, require("Storage").readJSON("tileclk.json", true) || {});

  const writeSettings = () => {
    require("Storage").writeJSON("tileclk.json", appSettings);
  }

  const colorOptions = {
    "Theme (bgH)": "theme",
    "Black": "#000000",
    "White": "#FFFFFF",
    "Dark Gray": "#404040",
    "Light Gray": "#808080",
    "Red": "#FF0000",
    "Green": "#00FF00",
    "Blue": "#0000FF",
    "Cyan": "#00FFFF",
    "Magenta": "#FF00FF",
    "Yellow": "#FFFF00"
  };

  const showMenu = () => {
    E.showMenu({
      "": { "title": "Tile Clock" },
      "< Back": () => back(),
      "Widgets:": {
        value: appSettings.widgets === "show" ? 0 : appSettings.widgets === "hide" ? 1 : 2,
        min: 0,
        max: 2,
        onchange: v => {
          appSettings.widgets = ["show", "hide", "swipe"][v];
          writeSettings();
        },
        format: v => ["Show", "Hide", "Swipe"][v]
      },
      "Seconds:": {
        value: appSettings.seconds === "show" ? 0 : appSettings.seconds === "hide" ? 1 : 2,
        min: 0,
        max: 2,
        onchange: v => {
          appSettings.seconds = ["show", "hide", "dynamic"][v];
          writeSettings();
        },
        format: v => ["Show", "Hide", "Dynamic"][v]
      },
      "Tile Borders:": {
        value: appSettings.borders === false ? false : true,
        onchange: v => {
          appSettings.borders = v;
          writeSettings();
        }
      },
      "Border Color": {
        value: Object.values(colorOptions).indexOf(appSettings.borderColor || "theme"),
        min: 0,
        max: Object.keys(colorOptions).length - 1,
        onchange: v => {
          appSettings.borderColor = Object.values(colorOptions)[v];
          writeSettings();
        },
        format: v => Object.keys(colorOptions)[v]
      },
      "Haptic Feedback:": {
        value: appSettings.haptics !== false,
        onchange: v => {
          appSettings.haptics = v;
          writeSettings();
        }
      }
    });
  }

  showMenu();
})