{
  // timeout used to update every minute
  var drawTimeout;
  require('Font4x5Numeric').add(Graphics);

  // Load settings
  const SETTINGS_FILE = "onewordclock.settings.json";
  let settings = {
    mode: "Named",
    smallNumeralClock: true
  };
  let stored = require('Storage').readJSON(SETTINGS_FILE, 1) || {};
  for (const key in stored) {
    settings[key] = stored[key];
  }

  // https://www.espruino.com/Bangle.js+Locale
  // schedule a draw for the next 3 minutes
  const queueDraw = () => {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(() => {
      drawTimeout = undefined;
      draw();
    }, 180000 - (Date.now() % 180000));
  };

  const HOUR_WORDS = [
    'Midnight',
    'Early',
    'Quiet',
    'Still',
    'Dawn',
    'Earlybird',
    'Sunrise',
    'Morning',
    'Bright',
    'Active',
    'Busy',
    'Pre-noon',
    'Noon',
    'Post-noon',
    'Afternoon',
    'Siesta',
    'Breezy',
    'Evening',
    'Twilight',
    'Dinner',
    'Cozy',
    'Relax',
    'Quietude',
    'Night',
  ];

  const HOURS = [
    'Twelve',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
    'Twenty',
    'Twentyone',
    'Twentytwo',
    'Twentythree'
  ];

  const wordFromHour = (h) => {
    return settings.mode === "Named" ? HOUR_WORDS[h] : HOURS[h];
  };

  const wordsFromDayMonth = (day) => {
    const DAY_WORD_ARRAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return DAY_WORD_ARRAY[day];
  };

  const draw = () => {
    var x = g.getWidth() / 2;
    var y = g.getHeight() / 2;
    g.reset();

    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var day = d.getDay();

    var timeStr = wordFromHour(h);
    var dateStr = wordsFromDayMonth(day);

    // draw time
    g.setBgColor(g.theme.bg);
    g.clear();

    // Draw military time at the top only if smallNumeralClock is true
    if (settings.smallNumeralClock) {
      g.setColor(g.theme.bg2);
      g.setFontAlign(0, 0).setFont('4x5Numeric', 2);
      var militaryTime = ('0' + h).slice(-2) + ('0' + m).slice(-2);
      g.drawString(militaryTime, x, 20);
    }

    g.setFontAlign(-1, 0).setFont('Vector', 36);

    // Calculate exact progress through the hour (0 to 1)
    var progress = (m + s / 60) / 60;

    // Get total width of the word and starting position
    var totalWidth = g.stringWidth(timeStr);
    var startX = x - totalWidth / 2;

    // Calculate the exact position where the color should change
    var colorChangeX = startX + totalWidth * progress;

    // First draw the entire text in the uncolored version
    g.setColor(g.theme.fg2);
    g.drawString(timeStr, startX, y);

    // Then draw the colored portion
    if (progress > 0) {
      g.setClipRect(startX, 0, colorChangeX, g.getHeight());
      g.setColor(g.theme.bg2);
      g.drawString(timeStr, startX, y);
      // Reset clip rect to full screen
      g.setClipRect(0, 0, g.getWidth(), g.getHeight());
    }

    // draw date at bottom of screen
    g.setColor(g.theme.fg2);
    g.setFontAlign(0, 0).setFont('Vector', 20);
    g.drawString(g.wrapString(dateStr, g.getWidth()).join('\n'), x, g.getHeight() - 30);

    queueDraw();
  };

  // Clear the screen once/, at startup
  g.clear();
  // draw immediately at first, queue update
  draw();
  // Stop updates when LCD is off, restart when on
  Bangle.on('lcdPower', (on) => {
    if (on) {
      draw(); // draw immediately, queue redraw
    } else {
      // stop draw timer
      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = undefined;
    }
  });

  // Show launcher when middle button pressed
  Bangle.setUI('clock');
  // Load widgets
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
