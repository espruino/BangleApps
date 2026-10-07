(function () {
  var storage = require('Storage');
  var SETTINGS_FILE = "examen.json";

  // ---- Content: the five-step Ignatian Examen ----
  var prompts = [
    "Be still.\n\nBecome aware\nof God's presence.",
    "Gratitude\n\nWhat am I grateful\nfor today?",
    "Light\n\nAsk for grace\nto see today clearly.",
    "Review\n\nWalk through today,\nhour by hour.",
    "Sorrow\n\nWhere did I fall short?\nAsk forgiveness.",
    "Resolve\n\nWhat is one grace\nfor tomorrow?",
    "Amen"
  ];

  var idx = 0;
  var FONT = "6x8:2";
  var LINE_H = 22;

  // ---------------- Prayer flow ----------------

  function wrapText(text, maxWidth) {
    var paragraphs = text.split("\n");
    var lines = [];
    paragraphs.forEach(function (p) {
      if (p === "") { lines.push(""); return; }
      var words = p.split(" ");
      var line = "";
      words.forEach(function (w) {
        var test = line ? line + " " + w : w;
        if (g.stringWidth(test) > maxWidth && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
    });
    return lines;
  }

  function draw() {
    g.reset();
    g.setColor("#000");
    g.fillRect(0, 0, g.getWidth(), g.getHeight());
    g.setColor("#fff");
    g.setFont(FONT);
    g.setFontAlign(0, 0);

    var text = prompts[idx];
    var lines = wrapText(text, g.getWidth() - 24);
    var startY = g.getHeight() / 2 - (lines.length * LINE_H) / 2 + LINE_H / 2;
    lines.forEach(function (l, i) {
      g.drawString(l, g.getWidth() / 2, startY + i * LINE_H);
    });

    // progress dots, only during the 5 main steps (not intro/Amen)
    if (idx > 0 && idx < prompts.length - 1) {
      var dotCount = prompts.length - 2;
      var dotY = g.getHeight() - 16;
      var spacing = 16;
      var startX = g.getWidth() / 2 - ((dotCount - 1) * spacing) / 2;
      for (var i = 0; i < dotCount; i++) {
        g.setColor(i === (idx - 1) ? "#fff" : "#555");
        g.fillCircle(startX + i * spacing, dotY, 3);
      }
    }

    // small hint on the intro screen that settings exist
    if (idx === 0) {
      g.setFont("6x8");
      g.setFontAlign(0, 0);
      g.setColor("#ffffff");
      g.drawString("swipe up: settings", g.getWidth() / 2, g.getHeight() - 12);
    }
  }

  function next() {
    if (idx >= prompts.length - 1) {
      Bangle.buzz(80);
      setTimeout(function () { Bangle.showLauncher(); }, 400);
      return;
    }
    idx++;
    Bangle.buzz(40);
    draw();
  }

  function prev() {
    if (idx > 0) {
      idx--;
      draw();
    }
  }

  function setMainUI() {
    Bangle.setUI({
      mode: "custom",
      back: function () { Bangle.showLauncher(); }
    });
    Bangle.removeListener('swipe', swipeHandler);
    Bangle.on('swipe', swipeHandler);
  }

  function swipeHandler(dirLR, dirUD) {
    if (dirUD !== 0) { showSettings(); return; }
    if (dirLR < 0) next();
    else if (dirLR > 0) prev();
  }

  // ---------------- Settings screen (built in) ----------------

  function showSettings() {
    Bangle.removeListener('swipe', swipeHandler);

    var settings = storage.readJSON(SETTINGS_FILE, 1) || {};
    if (settings.enabled === undefined) settings.enabled = true;
    if (settings.hour === undefined) settings.hour = 21;
    if (settings.minute === undefined) settings.minute = 0;

    function save() {
      storage.writeJSON(SETTINGS_FILE, settings);
      if (typeof global.examenReschedule === "function") global.examenReschedule();
    }
    function pad(n) { return (n < 10 ? "0" : "") + n; }

    E.showMenu({
      '': {},
      '< Back': function () {
        setMainUI();
        idx = 0;
        draw();
      },
      'Reminder': {
        value: settings.enabled,
        format: v => v ? 'On' : 'Off',
        onchange: v => { settings.enabled = v; save(); }
      },
      'Hour': {
        value: settings.hour,
        min: 0, max: 23, step: 1, wrap: true,
        format: v => pad(v),
        onchange: v => { settings.hour = v; save(); }
      },
      'Minute': {
        value: settings.minute,
        min: 0, max: 59, step: 1, wrap: true,
        format: v => pad(v),
        onchange: v => { settings.minute = v; save(); }
      }
    });
  }

  // ---------------- Start ----------------

  setMainUI();
  setWatch(next, BTN1, { repeat: true, edge: "falling", debounce: 50 });

  Bangle.buzz(150);
  draw();
})();
