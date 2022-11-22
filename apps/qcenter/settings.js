// make sure to enclose the function in parentheses
(function (back) {
	let settings = require("Storage").readJSON("qcenter.json", 1) || {};
	var apps = require("Storage")
		.list(/\.info$/)
		.map((app) => {
			var a = require("Storage").readJSON(app, 1);
			return (
				a && { name: a.name, type: a.type, sortorder: a.sortorder, src: a.src, icon: a.icon }
			);
		})
		.filter(
			(app) =>
				app &&
				(app.type == "app" ||
					app.type == "launch" ||
					app.type == "clock" ||
					!app.type)
		);
	apps.sort((a, b) => {
		var n = (0 | a.sortorder) - (0 | b.sortorder);
		if (n) return n; // do sortorder first
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	});

	function save(key, value) {
		settings[key] = value;
		require("Storage").write("qcenter.json", settings);
	}

  var pinnedApps = settings.pinnedApps || [];
  var exitGesture = settings.exitGesture || "swipeup";

  function showMainMenu() {
    var mainmenu = {
      "" : { "title" : "Quick Center" },
      "< Back" : ()=>{load();}
    };

    // Set exit gesture
    mainmenu["Exit Gesture: " + exitGesture] = function() {
      E.showMenu(exitGestureMenu);
    };
    
    //List all pinned apps
    for (let i = 0; i < pinnedApps.length; i++) {
      mainmenu[pinnedApps[i].name] = function() {
        E.showMenu({
          "" : { "title" : pinnedApps[i].name },
          "< Back" : showMainMenu,
          "Unpin" : function() {
            pinnedApps.splice(i, 1);
            save("pinnedApps", pinnedApps);
            showMainMenu();
          }
        });
      };
    }

    // Show pin app button only if there is less than 6 pinned apps, else show the button that shows alert that max apps has been pinned
    if (pinnedApps.length < 6) {
      mainmenu["Pin App"] = pinAppMenu;
    }
    else {
      mainmenu["Pin App"] = function() {
        E.showAlert("You can only pin 6 apps");
      };
    }
    
    return E.showMenu(mainmenu);
  }

  // menu for adding apps to the quick launch menu, listing all apps
  var pinAppMenu = {
    "" : { "title" : "Add App" },
    "< Back" : showMainMenu
  };
  apps.forEach((a)=>{
    pinAppMenu[a.name] = function() {
      // strip unncecessary properties
      delete a.type;
      delete a.sortorder;
      delete a.name;
      pinnedApps.push(a);
      save("pinnedApps", pinnedApps);
      showMainMenu();
      };
  });

  // menu for setting exit gesture
  var exitGestureMenu = {
    "" : { "title" : "Exit Gesture" },
    "< Back" : showMainMenu
  };
  exitGestureMenu["Swipe Up"] = function() {
    save("exitGesture", "swipeup");
    showMainMenu();
  }
  exitGestureMenu["Swipe Down"] = function() {
    save("exitGesture", "swipedown");
    showMainMenu();
  }
  exitGestureMenu["Swipe Left"] = function() {
    save("exitGesture", "swipeleft");
    showMainMenu();
  }
  exitGestureMenu["Swipe Right"] = function() {
    save("exitGesture", "swiperight");
    showMainMenu();
  }

});
