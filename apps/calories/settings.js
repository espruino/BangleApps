(function(back) {
  const FILE = "calories.settings.json";
  // Load settings
  var settings = Object.assign({
    calGoal: 500,
    showGoalReached: true,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  var menu={
    "" : { "title" : "Calories" },
    "< Back" : () => back(),
    'Show Goal Reached Notification?': {
      value: !!settings.showGoalReached,  // !! converts undefined to false
      onchange: v => {
        settings.showGoalReached = v;
        writeSettings();
      }
    },
    'Calorie Goal': {
      value: settings.calGoal||500,  // 0| converts undefined to 0
      min: 300, max: 1500,
      step:20,
      onchange: v => {
        settings.calGoal = v;
        writeSettings();
      }
    }
  }
  // Show the menu
  E.showMenu(menu);
})
