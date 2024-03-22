(function(back) {
  // define settings filename
  var filename = "sleeplog.json";
  // define logging prompt display status
  var thresholdsPrompt = true;

  // define default vaules
  var defaults = {
    // main settings
    enabled: true, //   en-/disable completely
    // threshold settings
    maxAwake: 36E5, //  [ms] maximal awake time to count for consecutive sleep
    minConsec: 18E5, // [ms] minimal time to count for consecutive sleep
    deepTh: 100, //     threshold for deep sleep
    lightTh: 200, //    threshold for light sleep
    wearTemp: 19.5, //    temperature threshold to count as worn
    // app settings
    breakToD: 12, //    [h] time of day when to start/end graphs
    appTimeout: 0 //   lock and backlight timeouts for the app
  };

  // assign loaded settings to default values
  var settings = Object.assign(defaults, require("Storage").readJSON(filename, true) || {});

  // write change to storage
  function writeSetting() {
    require("Storage").writeJSON(filename, settings);
  }

  // plot a debug file
  function plotDebug(filename) {    
    // handle swipe events
    function swipeHandler(x, y) {
      if (x) {
        start -= x;
        if (start < 0 || maxStart && start > maxStart) {
          start = start < 0 ? 0 : maxStart;
        } else {
          drawGraph();
        }
      } else {
        minMove += y * 10;
        if (minMove < 0 || minMove > 300) {
          minMove = minMove < 0 ? 0 : 300;
        } else {
          drawGraph();
        }
      }
    }
    // handle touch events
    function touchHandler() {
      invert = !invert;
      drawGraph();
    }

    // read required entries
    function readEntries(count) {
      // extract usabble data from line
      function extract(line) {
        if (!line) return;
        line = line.trim().split(",");
        return [Math.round((parseFloat(line[0]) - 25569) * 144), parseInt(line[1])];
      }

      // open debug file
      var file = require("Storage").open(filename, "r");
      // skip title
      file.readLine();
      // skip past entries
      for (var i = 0; i < start * count; i++) { file.readLine(); }
      // define data with first entry
      var data = [extract(file.readLine())];
      // get start time in 10min steps
      var start10min = data[0][0];
      // read first required entry
      var line = extract(file.readLine());
      
      // read next count entries from file
      while (data.length < count) {
        // check if line is immediately after the last entry
        if (line[0] === start10min + data.length) {
          // add line to data
          data.push(line);
          // read new line
          line = extract(file.readLine());
          // stop if no more data available
          if (!line) break;
        } else {
          // add line with unknown movement
          data.push([start10min + data.length, 0]);
        }
      }

      // free ram
      file = undefined
      // set this start as max, if less entries than expected
      if (data.length < count) maxStart = start;
      return data;
    }

    // draw graph at starting point
    function drawGraph() {
      // set correct or inverted drawing
      function rect(fill, x0, y0, x1, y1) {
        if (fill ^ invert) {
          g.fillRect(x0, y0, x1, y1);
        } else {
          g.clearRect(x0, y0, x1, y1);
        }
      }

      // set witdh
      var width = g.getWidth();
      // calculate entries to display (+ set width zero based)
      var count = (width--) / 4;
      // read required entries
      var data = readEntries(count);

      // clear app area
      g.reset().clearRect(0, width - 13, width, width);
      rect(false, 0, 24, width, width - 14);
      // draw x axis
      g.drawLine(0, width - 13, width, width - 13);
      // draw x label
      data.forEach((e, i) => {
        var startTime = new Date(e[0] * 6E5);
        if (startTime.getMinutes() === 0) {
          g.fillRect(4 * i, width - 12, 4 * i, width - 9);
          g.setFontAlign(-1, -1).setFont("6x8")
            .drawString(startTime.getHours(), 4 * i + 1, width - 8);
        } else if (startTime.getMinutes() === 30) {
          g.fillRect(4 * i, width - 12, 4 * i, width - 11);
        }
      });

      // calculate max height
      var height = width - 38;
      // cycle through entries
      data.forEach((e, i) => {
        // check if movement available 
        if (e[1]) {
          // set color depending on recognised status
          var color = e[1] < deepTh ? 31 : e[1] < lightTh ? 2047 : 2016;
          // correct according to min movement
          e[1] -= minMove;
          // keep movement in bounderies
          e[1] = e[1] < 0 ? 0 : e[1] > height ? height : e[1];
          // draw line and rectangle
          g.reset();
          rect(true, 4 * i, width - 14, 4 * i, width - 14 - e[1]);
          g.setColor(color).fillRect(4 * i + 1, width - 14, 4 * i + 3, width - 14 - e[1]);
        } else {
          // draw error in red
          g.setColor(63488).fillRect(4 * i, width - 14, 4 * i, width - 14 - height);
        }
      });
      // draw threshold lines
      [deepTh, lightTh].forEach(th => {
        th -= minMove;
        if (th > 0 && th < height) {
          // draw line
          g.reset();
          rect(true, 0, width - 14 - th, width, width - 14 - th);
          // draw value above or below line
          var yAlign = th < height / 2 ? -1 : 1;
          if (invert) g.setColor(1);
          g.setFontAlign(1, yAlign).setFont("6x8")
            .drawString(th + minMove, width - 2, width - 13 - th + 10 * yAlign);
        }
      });

      // free ram
      data = undefined;
    }

    // get thresholds
    var deepTh = global.sleeplog ? sleeplog.conf.deepTh : defaults.deepTh;
    var lightTh = global.sleeplog ? sleeplog.conf.lightTh : defaults.lightTh;
    // set lowest movement displayed
    var minMove = deepTh - 20;
    // set start point
    var start = 0;
    // define max start point value
    var maxStart = 0;
    // define inverted color status
    var invert = false;

    // setup UI
    Bangle.setUI({
      mode: "custom",
      back: selectDebug,
      touch: touchHandler,
      swipe: swipeHandler
    });

    // first draw
    drawGraph(start);
  }

  // select a debug logfile
  function selectDebug() {
    // load debug files
    var files = require("Storage").list(/^sleeplog_\d\d\d\d\d\d\.csv$/, {sf:true});

    // check if no files found
    if (!files.length) {
      // show prompt
      E.showPrompt( /*LANG*/"No debug files found.", {
        title: /*LANG*/"Debug log",
        buttons: {
          /*LANG*/"Back": 0
        }
      }).then(showDebug);
    } else {
      // prepare scroller
      const H = 40;
      var menuIcon = "\0\f\f\x81\0\xFF\xFF\xFF\0\0\0\0\x0F\xFF\xFF\xF0\0\0\0\0\xFF\xFF\xFF";
      // show scroller
      E.showScroller({
        h: H, c: files.length,
        back: showDebug,
        scrollMin : -24, scroll : -24, // title is 24px, rendered at -1
          draw : (idx, r) => {
            if (idx < 0) {
              return g.setFont("12x20").setFontAlign(-1,0).drawString(menuIcon + " Select file", r.x + 12, r.y + H - 12);
            } else {
              g.setColor(g.theme.bg2).fillRect({x: r.x + 4, y: r.y + 2, w: r.w - 8, h: r.h - 4, r: 5});
              var name = new Date(parseInt(files[idx].match(/\d\d\d\d\d\d/)[0]) * 36E5);
              name = name.toString().slice(0, -12).split(" ").filter((e, i) => i !== 3).join(" ");
              g.setColor(g.theme.fg2).setFont("12x20").setFontAlign(-1, 0).drawString(name, r.x + 12, r.y + H / 2);
            }
          },
        select: (idx) => plotDebug(files[idx])
      });
    }
  }

  // show menu or promt to change debugging
  function showDebug() {
    // check if sleeplog is available
    if (global.sleeplog) {
      // get debug status, file and duration
      var enabled = !!sleeplog.debug;
      var file = typeof sleeplog.debug === "object";
      var duration = 0;
      // setup debugging menu
      var debugMenu = {
        "": {
          title: /*LANG*/"Debugging"
        },
        /*LANG*/"< Back": () => {
          // check if some value has changed
          if (enabled !== !!sleeplog.debug || file !== (typeof sleeplog.debug === "object") || duration)
            require("sleeplog").setDebug(enabled, file ? duration || 12 : undefined);
          // redraw main menu
          showMain(7);
        },
        /*LANG*/"View log": () => selectDebug(),
        /*LANG*/"Enable": {
          value: enabled,
          onchange: v => enabled = v
        },
        /*LANG*/"write File": {
          value: file,
          onchange: v => file = v
        },
        /*LANG*/"Duration": {
          value: file ? (sleeplog.debug.writeUntil - Date.now()) / 36E5 | 0 : 12,
          min: 1,
          max: 96,
          wrap: true,
          format: v => v + /*LANG*/ "h",
          onchange: v => duration = v
        },
        /*LANG*/"Cancel": () => showMain(7),
      };
      // show menu
      var menu = E.showMenu(debugMenu);
    } else {
      // show error prompt
      E.showPrompt("Sleeplog" + /*LANG*/"not enabled!", {
        title: /*LANG*/"Debugging",
        buttons: {
          /*LANG*/"Back": 7
        }
      }).then(showMain);
    }
  }

  // show menu to change thresholds
  function showThresholds() {
    // setup logging menu
    var menu;
    var thresholdsMenu = {
      "": {
        title: /*LANG*/"Thresholds"
      },
      /*LANG*/"< Back": () => showMain(2),
      /*LANG*/"Max Awake": {
        value: settings.maxAwake / 6E4,
        step: 10,
        min: 10,
        max: 120,
        wrap: true,
        noList: true,
        format: v => v + /*LANG*/"min",
        onchange: v => {
          settings.maxAwake = v * 6E4;
          writeSetting();
        }
      },
      /*LANG*/"Min Consecutive": {
        value: settings.minConsec / 6E4,
        step: 10,
        min: 10,
        max: 120,
        wrap: true,
        noList: true,
        format: v => v + /*LANG*/"min",
        onchange: v => {
          settings.minConsec = v * 6E4;
          writeSetting();
        }
      },
      /*LANG*/"Deep Sleep": {
        value: settings.deepTh,
        step: 1,
        min: 30,
        max: 200,
        wrap: true,
        noList: true,
        onchange: v => {
          settings.deepTh = v;
          writeSetting();
        }
      },
      /*LANG*/"Light Sleep": {
        value: settings.lightTh,
        step: 10,
        min: 100,
        max: 400,
        wrap: true,
        noList: true,
        onchange: v => {
          settings.lightTh = v;
          writeSetting();
        }
      },
      /*LANG*/"Wear Temperature": {
        value: settings.wearTemp,
        step: 0.5,
        min: 19.5,
        max: 40,
        wrap: true,
        noList: true,
        format: v => v === 19.5 ? "Disabled" : v + "°C",
        onchange: v => {
          settings.wearTemp = v;
          writeSetting();
        }
      },
      /*LANG*/"Reset to Default": () => {
        settings.maxAwake = defaults.maxAwake;
        settings.minConsec = defaults.minConsec;
        settings.deepTh = defaults.deepTh;
        settings.lightTh = defaults.lightTh;
        writeSetting();
        showThresholds();
      }
    };

    // display info/warning prompt or menu
    if (thresholdsPrompt) {
      thresholdsPrompt = false;
      E.showPrompt("Changes take effect from now on, not retrospective", {
        title: /*LANG*/"Thresholds",
        buttons: {
          /*LANG*/"Ok": 0
        }
      }).then(() => menu = E.showMenu(thresholdsMenu));
    } else {
      menu = E.showMenu(thresholdsMenu);
    }
  }

  // show main menu
  function showMain(selected) {
    // set debug image
    var debugImg = !global.sleeplog ?
      "FBSBAOAAfwAP+AH3wD4+B8Hw+A+fAH/gA/wAH4AB+AA/wAf+APnwHw+D4Hx8A++AH/AA/gAH" : // X
      typeof sleeplog.debug === "object" ?
      "FBSBAB/4AQDAF+4BfvAX74F+CBf+gX/oFJKBf+gUkoF/6BSSgX/oFJ6Bf+gX/oF/6BAAgf/4" : // file
      sleeplog.debug ?
      "FBSBAP//+f/V///4AAGAABkAAZgAGcABjgAYcAGDgBhwAY4AGcABmH+ZB/mAABgAAYAAH///" : // console
      0; // off
    debugImg = debugImg ? "\0" + atob(debugImg) : false;
    // set menu
    var mainMenu = {
      "": {
        title: "Sleep Log",
        selected: selected
      },
      /*LANG*/"< Back": () => back(),
      /*LANG*/"Thresholds": () => showThresholds(),
      /*LANG*/"Break ToD": {
        value: settings.breakToD,
        step: 1,
        min: 0,
        max: 23,
        wrap: true,
        noList: true,
        format: v => v + ":00",
        onchange: v => {
          settings.breakToD = v;
          writeSetting();
        }
      },
      /*LANG*/"App Timeout": {
        value: settings.appTimeout / 1E3,
        step: 10,
        min: 0,
        max: 120,
        wrap: true,
        noList: true,
        format: v => v ? v + "s" : "-",
        onchange: v => {
          settings.appTimeout = v * 1E3;
          writeSetting();
        }
      },
      /*LANG*/"Enabled": {
        value: settings.enabled,
        onchange: v => {
          settings.enabled = v;
          require("sleeplog").setEnabled(v);
        }
      },
      /*LANG*/"Debugging": {
        value: debugImg,
        onchange: () => setTimeout(showDebug, 10)
      }
    };
    var menu = E.showMenu(mainMenu);
  }

  // draw main menu
  showMain();
})
