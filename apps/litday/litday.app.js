/* global LITDAY */

(function() {
  var S = require("Storage");
  var SETTINGS_FILE = "litday.json";

  var dataRaw = S.read("litday.data.js");

  if (!dataRaw) {
    E.showMessage("Calendar data not found", "LitDay");
    return;
  }

  try {
    eval(dataRaw);
  } catch (e) {
    E.showMessage("Data Error", "LitDay");
    return;
  }

  var s = S.readJSON(SETTINGS_FILE, 1) || {};

  if (s.enabled === undefined) s.enabled = true;
  if (s.hour === undefined) s.hour = 8;
  if (s.minute === undefined) s.minute = 0;


  function p(n) {
    return (n < 10 ? "0" : "") + n;
  }


  // Wrap text
  function wrapText(text, maxWidth) {
    var result = [];
    var paragraphs = text.split("\n");

    for (var p = 0; p < paragraphs.length; p++) {

      var words = paragraphs[p].split(" ");
      var line = "";

      for (var i = 0; i < words.length; i++) {

        var word = words[i];
        var test = line ? line + " " + word : word;

        if (g.stringWidth(test) > maxWidth && line) {
          result.push(line);
          line = word;
        } else {
          line = test;
        }
      }

      if (line) {
        result.push(line);
      }
    }

    return result;
  }


  // Get today's event
  function getTodayEvent() {
    var d = new Date();

    var key =
      ("0" + (d.getMonth() + 1)).slice(-2) +
      ("0" + d.getDate()).slice(-2);

    if (typeof LITDAY === "undefined") {
      return null;
    }

    for (var i = 0; i < LITDAY.length; i++) {

      if (LITDAY[i][0] === key) {

        var msg = LITDAY[i][1];

        if (LITDAY[i][2]) {
          msg += "\nPsalm week " + LITDAY[i][2];
        }

        if (LITDAY[i][3] && LITDAY[i][3].length) {
          msg += "\n" + LITDAY[i][3][0];
        }

        return msg;
      }
    }

    return null;
  }


  function save() {
    S.writeJSON(SETTINGS_FILE, s);

    if (typeof global.litdayReschedule === "function") {
      global.litdayReschedule();
    }
  }


  // Draw screen
  function draw() {

    var w = g.getWidth();
    var h = g.getHeight();

    // Black background
    g.setColor(0, 0, 0);
    g.fillRect(0, 0, w - 1, h - 1);

    // White text
    g.setColor(255, 255, 255);

    // Main font
    g.setFont("6x8:2");

    // Standard horizontal/vertical centre alignment
    g.setFontAlign(0, 0);

    var msg = getTodayEvent();

    if (!msg) {
      msg = "No calendar entry today";
    }

    var lines = wrapText(msg, w - 20);

    var lineHeight = 18;
    var startY = (h / 2) - ((lines.length - 1) * lineHeight / 2);

    for (var i = 0; i < lines.length; i++) {
      g.drawString(
        lines[i],
        w / 2,
        startY + (i * lineHeight)
      );
    }


    // Footer
    g.setFont("6x8");
    g.setFontAlign(0, 0);

    g.drawString(
      "swipe up: settings",
      w / 2,
      h - 12
    );
  }


  function showSettings() {

    E.showMenu({

      "": {
        title: "LitDay settings"
      },

      "< Back": function() {
        draw();
      },

      "Reminder": {
        value: s.enabled,

        format: function(v) {
          return v ? "On" : "Off";
        },

        onchange: function(v) {
          s.enabled = v;
          save();
        }
      },

      "Hour": {
        value: s.hour,
        min: 0,
        max: 23,
        step: 1,
        wrap: true,

        format: p,

        onchange: function(v) {
          s.hour = v;
          save();
        }
      },

      "Minute": {
        value: s.minute,
        min: 0,
        max: 59,
        step: 1,
        wrap: true,

        format: p,

        onchange: function(v) {
          s.minute = v;
          save();
        }
      }

    });
  }


  // Bangle UI
  Bangle.setUI({
    mode: "custom",

    btn: function() {
      Bangle.showLauncher();
    },

    swipe: function(dirLR, dirUD) {
      if (dirUD !== 0) {
        showSettings();
      }
    }
  });


  // Draw immediately
  draw();

})();