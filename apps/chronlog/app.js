// TODO:
// - Add more /*LANG*/ tags for translations.
// - Check if there are chronlog storage files that should be added to tasks.

{
  const storage = require("Storage");
  let appData = storage.readJSON("chronlog.json", true) || {
    currentTask : "default",
    tasks : {
      default: {
        file : "chronlog_default.csv", // Existing default task log file
        state : "stopped",
        lineNumber : 0,
        lastLine : "",
        lastSyncedLine : "",
      },
      // Add more tasks as needed
    },
  };
  let currentTask = appData.currentTask;
  let tasks = appData.tasks;
  delete appData;

  let themeColors = g.theme;

  let logEntry; // Avoid previous lint warning

  // Function to draw the Start/Stop button with play and pause icons
  let drawButton = ()=>{
    var btnWidth = g.getWidth() - 40;
    var btnHeight = 50;
    var btnX = 20;
    var btnY = (g.getHeight() - btnHeight) / 2;
    var cornerRadius = 25;

    var isStopped = tasks[currentTask].state === "stopped";
    g.setColor(isStopped ? "#0F0" : "#F00"); // Set color to green when stopped and red when started

    // Draw rounded corners of the button
    g.fillCircle(btnX + cornerRadius, btnY + cornerRadius, cornerRadius);
    g.fillCircle(btnX + btnWidth - cornerRadius, btnY + cornerRadius, cornerRadius);
    g.fillCircle(btnX + cornerRadius, btnY + btnHeight - cornerRadius, cornerRadius);
    g.fillCircle(btnX + btnWidth - cornerRadius, btnY + btnHeight - cornerRadius, cornerRadius);

    // Draw rectangles to fill in the button
    g.fillRect(btnX + cornerRadius, btnY, btnX + btnWidth - cornerRadius, btnY + btnHeight);
    g.fillRect(btnX, btnY + cornerRadius, btnX + btnWidth, btnY + btnHeight - cornerRadius);

    g.setColor(themeColors.bg); // Set icon color to contrast against the button's color

    // Center the icon within the button
    var iconX = btnX + btnWidth / 2;
    var iconY = btnY + btnHeight / 2;

    if (isStopped) {
      // Draw play icon
      var playSize = 10; // Side length of the play triangle
      var offset = playSize / Math.sqrt(3) - 3;
      g.fillPoly([
        iconX - playSize, iconY - playSize + offset,
        iconX - playSize, iconY + playSize + offset,
        iconX + playSize * 2 / Math.sqrt(3), iconY + offset
      ]);
    } else {
      // Draw pause icon
      var barWidth = 5; // Width of pause bars
      var barHeight = btnHeight / 2; // Height of pause bars
      var barSpacing = 5; // Spacing between pause bars
      g.fillRect(iconX - barSpacing / 2 - barWidth, iconY - barHeight / 2, iconX - barSpacing / 2, iconY + barHeight / 2);
      g.fillRect(iconX + barSpacing / 2, iconY - barHeight / 2, iconX + barSpacing / 2 + barWidth, iconY + barHeight / 2);
    }
  };

  let drawHamburgerMenu = ()=>{
    var x = g.getWidth() / 2; // Center the hamburger menu horizontally
    var y = (7/8)*g.getHeight(); // Position it near the bottom
    var lineLength = 18; // Length of the hamburger lines
    var spacing = 6; // Space between the lines

    g.setColor(themeColors.fg); // Set color to foreground color for the icon
    // Draw three horizontal lines
    for (var i = -1; i <= 1; i++) {
      g.fillRect(x - lineLength/2, y + i * spacing - 1, x + lineLength/2, y + i * spacing + 1);
    }
  };

  // Function to draw the task name centered between the widget field and the start/stop button
  let drawTaskName = ()=>{
    g.setFont("Vector", 20); // Set a smaller font for the task name display

    // Calculate position to center the task name horizontally
    var x = (g.getWidth()) / 2;

    // Calculate position to center the task name vertically between the widget field and the start/stop button
    var y = g.getHeight()/4; // Center vertically

    g.setColor(themeColors.fg).setFontAlign(0,0); // Set text color to foreground color
    g.drawString(currentTask, x, y); // Draw the task name centered on the screen
  };

  // Function to draw the last log entry of the current task
  let drawLastLogEntry = ()=>{
    g.setFont("Vector", 10); // Set a smaller font for the task name display

    // Calculate position to center the log entry horizontally
    var x = (g.getWidth()) / 2;

    // Calculate position to place the log entry properly between the start/stop button and hamburger menu
    var btnBottomY = (g.getHeight() + 50) / 2; // Y-coordinate of the bottom of the start/stop button
    var menuBtnYTop = g.getHeight() * (5 / 6); // Y-coordinate of the top of the hamburger menu button
    var y = btnBottomY + (menuBtnYTop - btnBottomY) / 2 + 2; // Center vertically between button and menu

    g.setColor(themeColors.fg).setFontAlign(0,0); // Set text color to foreground color
    g.drawString(g.wrapString(tasks[currentTask].lastLine, 150).join("\n"), x, y);
  };

  /*
  // Helper function to read the last log entry from the current task's log file
  let updateLastLogEntry = ()=>{
    var filename = tasks[currentTask].file;
    var file = require("Storage").open(filename, "r");
    var lastLine = "";
    var line;
    while ((line = file.readLine()) !== undefined) {
      lastLine = line; // Keep reading until the last line
    }
    tasks[currentTask].lastLine = lastLine;
  };
  */

  // Main UI drawing function
  let drawMainMenu = ()=>{
    g.clear();
    Bangle.drawWidgets(); // Draw any active widgets
    g.setColor(themeColors.bg); // Set color to theme's background color
    g.fillRect(Bangle.appRect); // Fill the app area with the background color

    drawTaskName(); // Draw the centered task name
    drawLastLogEntry(); // Draw the last log entry of the current task
    drawButton(); // Draw the Start/Stop toggle button
    drawHamburgerMenu(); // Draw the hamburger menu button icon

    //g.flip(); // Send graphics to the display
  };

  // Function to toggle the active state
  let toggleChronlog = ()=>{
    var dateObj = new Date();
    var dateObjStrSplit = dateObj.toString().split(" ");
    var currentTime = dateObj.getFullYear().toString() + "-" + (dateObj.getMonth()<10?"0":"") + dateObj.getMonth().toString() + "-" + (dateObj.getDate()<10?"0":"") + dateObj.getDate().toString() + "T" + (dateObj.getHours()<10?"0":"") + dateObj.getHours().toString() + ":" + (dateObj.getMinutes()<10?"0":"") + dateObj.getMinutes().toString() + ":" + (dateObj.getSeconds()<10?"0":"") + dateObj.getSeconds().toString() + " " + dateObjStrSplit[dateObjStrSplit.length-1];

    tasks[currentTask].lineNumber = Number(tasks[currentTask].lineNumber) + 1;
    logEntry = tasks[currentTask].lineNumber + (tasks[currentTask].state === "stopped" ? ",Start," : ",Stop,") + currentTime + "\n";
    var filename = tasks[currentTask].file;

    // Open the appropriate file and append the log entry
    var file = require("Storage").open(filename, "a");
    file.write(logEntry);
    tasks[currentTask].lastLine = logEntry;

    // Toggle the state and update the button text
    tasks[currentTask].state = tasks[currentTask].state === "stopped" ? "started" : "stopped";
    drawMainMenu(); // Redraw the main UI
  };

  // Define the touch handler function for the main menu
  let handleMainMenuTouch = (button, xy)=>{
    var btnTopY = (g.getHeight() - 50) / 2;
    var btnBottomY = btnTopY + 50;
    var menuBtnYTop = (7/8)*g.getHeight() - 15;
    var menuBtnYBottom = (7/8)*g.getHeight() + 15;
    var menuBtnXLeft = (g.getWidth() / 2) - 15;
    var menuBtnXRight = (g.getWidth() / 2) + 15;

    // Detect if the touch is within the toggle button area
    if (xy.x >= 20 && xy.x <= (g.getWidth() - 20) && xy.y > btnTopY && xy.y < btnBottomY) {
      toggleChronlog();
    }
    // Detect if the touch is within the hamburger menu button area
    else if (xy.x >= menuBtnXLeft && xy.x <= menuBtnXRight && xy.y >= menuBtnYTop && xy.y <= menuBtnYBottom) {
      showMenu();
    }
  };

  // Function to attach the touch event listener
  let setMainUI = ()=>{
    Bangle.setUI({
      mode: "custom",
      back: load,
      touch: handleMainMenuTouch
    });
  };

  let saveAppState = ()=>{
    let appData = {
      currentTask : currentTask,
      tasks : tasks,
    };
    require("Storage").writeJSON("chronlog.json", appData);
  };
  // Set up a listener for the 'kill' event
  E.on('kill', saveAppState);

  // Function to switch to a selected task
  let switchTask = (taskName)=>{
    currentTask = taskName; // Update the current task

    // Reinitialize the UI elements
    setMainUI();
    drawMainMenu(); // Redraw UI to reflect the task change and the button state
  };

  // Function to create a new task
  let createNewTask = ()=>{
    // Prompt the user to input the task's name
    require("textinput").input({
      text: "" // Default empty text for new task
    }).then(result => {
        var taskName = result; // Store the result from text input
        if (taskName) {
          if (tasks.hasOwnProperty(taskName)) {
            // Task already exists, handle this case as needed
            E.showAlert(/*LANG*/"Task already exists", "Error").then(drawMainMenu);
          } else {
            // Create a new task log file for the new task
            var filename = "chronlog_" + taskName.replace(/\W+/g, "_") + ".csv";
            tasks[taskName] = {
              file : filename,
              state : "stopped",
              lineNumber : 0,
              lastLine : "",
              lastSyncedLine : "",
            };

            currentTask = taskName;

            setMainUI();
            drawMainMenu(); // Redraw UI with the new task
          }
        } else {
          setMainUI();
          drawMainMenu(); // User cancelled, redraw main menu
        }
      }).catch(e => {
        console.log("Text input error", e);
        setMainUI();
        drawMainMenu(); // In case of error also redraw main menu
      });
  };

  // Function to display the list of tasks for selection
  let chooseTask = ()=>{
    // Construct the tasks menu from the tasks object
    var taskMenu = {
      "": { "title": /*LANG*/"Choose Task",
        "back" : function() {
          setMainUI(); // Reattach when the menu is closed
          drawMainMenu(); // Cancel task selection
        }
      }
    };
    for (var taskName in tasks) {
      if (!tasks.hasOwnProperty(taskName)) continue;
      taskMenu[taskName] = (function(name) {
        return function() {
          switchTask(name);
        };
      })(taskName);
    }

    // Add a menu option for creating a new task
    taskMenu[/*LANG*/"Create New Task"] = createNewTask;

    E.showMenu(taskMenu); // Display the task selection
  };

  // Function to annotate the current or last work session
  let annotateTask = ()=>{

    // Prompt the user to input the annotation text
    require("textinput").input({
      text: "" // Default empty text for annotation
    }).then(result => {
        var annotationText = result.trim();
        if (annotationText) {
          // Append annotation to the last or current log entry
          tasks[currentTask].lineNumber ++;
          var annotatedEntry = tasks[currentTask].lineNumber + /*LANG*/",Note," + annotationText + "\n";
          var filename = tasks[currentTask].file;
          var file = require("Storage").open(filename, "a");
          file.write(annotatedEntry);
          tasks[currentTask].lastLine = annotatedEntry;
          setMainUI();
          drawMainMenu(); // Redraw UI after adding the annotation
        } else {
          // User cancelled, so we do nothing and just redraw the main menu
          setMainUI();
          drawMainMenu();
        }
      }).catch(e => {
        console.log("Annotation input error", e);
        setMainUI();
        drawMainMenu(); // In case of error also redraw main menu
      });
  };

  let syncToAndroid = (taskName, isFullSync)=>{
    let mode = "a";
    if (isFullSync) mode = "w";
    let lastSyncedLine = tasks[taskName].lastSyncedLine || 0;
    let taskNameValidFileName = taskName.replace(" ","_"); // FIXME: Should use something similar to replaceAll using a regular expression to catch all illegal characters.

    let storageFile = require("Storage").open("chronlog_"+taskNameValidFileName+".csv", "r");
    let contents = storageFile.readLine();
    let lineNumber = contents ? contents.slice(0, contents.indexOf(",")) : 0;
    let shouldSyncLine = ()=>{return (contents && (isFullSync || (Number(lineNumber)>Number(lastSyncedLine))));};
    let doSyncLine = (mde)=>{Bluetooth.println(JSON.stringify({t:"file", n:"chronlog_"+taskNameValidFileName+".csv", c:contents, m:mde}));};

    if (shouldSyncLine()) doSyncLine(mode);
    contents = storageFile.readLine();
    while (contents) {
      lineNumber = contents.slice(0, contents.indexOf(",")); // Could theoretically do with `lineNumber++`, but this is more robust in case numbering in file ended up irregular.
      if (shouldSyncLine()) doSyncLine("a");
      contents = storageFile.readLine();
    }
    tasks[taskName].lastSyncedLine = lineNumber;
  };

  // Function to display the list of tasks for selection
  let syncTasks = ()=>{
    let isToDoFullSync = false;
    // Construct the tasks menu from the tasks object
    var syncMenu = {
      "": { "title": /*LANG*/"Sync Tasks",
        "back" : function() {
          setMainUI(); // Reattach when the menu is closed
          drawMainMenu(); // Cancel task selection
        }
      }
    };
    syncMenu[/*LANG*/"Full Resyncs"] = {
      value: !!isToDoFullSync,  // !! converts undefined to false
      onchange: ()=>{
        isToDoFullSync = !isToDoFullSync
      },
    }
    for (var taskName in tasks) {
      if (!tasks.hasOwnProperty(taskName)) continue;
      syncMenu[taskName] = (function(name) {
        return function() {syncToAndroid(name,isToDoFullSync);};
      })(taskName);
    }

    E.showMenu(syncMenu); // Display the task selection
  };

  let showMenu = ()=>{
    var menu = {
      "": { "title": /*LANG*/"Menu",
        "back": function() {
          setMainUI(); // Reattach when the menu is closed
          drawMainMenu(); // Redraw the main UI when closing the menu
        },
      },
      /*LANG*/"Annotate": annotateTask, // Now calls the real annotation function
      /*LANG*/"Change Task": chooseTask, // Opens the task selection screen
      /*LANG*/"Sync to Android": syncTasks,
    };
    E.showMenu(menu);
  };

  Bangle.loadWidgets();
  drawMainMenu(); // Draw the main UI when the app starts
  // When the application starts, attach the touch event listener
  setMainUI();
}
