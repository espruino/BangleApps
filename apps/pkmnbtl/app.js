// Place your const, vars, functions or classes here

Graphics.prototype.setFontPKMN = function (scale) {
  // Actual height 7 (7 - 1)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AAMwvt9mAFBuFwj1+vkQgt/qtQuEAiF4q18t0ahkCm95rs3g0NgFQsEAjkioNBgACBkUcE4N4D4MIn0MhEAhsOE4IAEgEGg0AgMCgkIiEgoEAjE8o1CsU8jEAgUiv1+gUCgEmt1OpVavUygEEo1SqVyt1MgEMjk0sgYBgkAulWB4NSr0MgE8vwHFsFgo1OrFwMwMsB4d+liSBvVKAAN+nkAs1mgFttxuBhkemR5BAAUAiUehgsBmAoBpdbVwMgWYM8t1eJoM4gcMmlEmkMgcAv9JAAU5RYKrDVQQPBAwg0BC4lJXwN/pAADUYIfCB4UuB4MIAAd/awQpCgEOFgV+oAdBv7aBjEkoUBA4MBAAgHBkEQjDZBEoIHChEEgwHBLohVDJokwB4lFk0dB4lMpUxgEyNokmgBKBoF/AYUAvkCIwY3BsEYg0Dg0YcQN/h0IJAMOOoVjikYiljO4NAK4MfL4InBoNDotJqNhUoSLCnEGSYUAA'))),
    32,
    atob("AgUDBAYHCAMFBQQFAwcDCAgHCAgICAgICAgDAwUFBQkHCAgICAgICAgGCAgICAgICAgICAgICAgICAgEAgQ="),
    8 + (scale << 8) + (1 << 16)
  );
  return this;
};

var bg = {
  width: 176, height: 176, bpp: 4,
  buffer: require("heatshrink").decompress(atob("/4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AJ+EAh5C/K7EAAAwocDzxXUmcDgczmEDK/5XUmEwHANEABhX/K4ZYBV4JX/V60AgY4dK+YAlK+AA/K/5X/AH5X/K7sAFEommK5SwlP84vJGEonnWBQAoWNoA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AGsAAAwkeK+MzgcDmcwgZXfh5XzmEwHAN3ACt/ag5XxLAKvBK8KwvV4kAgaPdK+YAmK94Al+BX/AAZCSK/5DEV/6upK/6uXK/6uXK/6uXK/6uXK/7FZK/5X/K/4A/K+8ABxv4xAAUgAABK9ovBK/5WWK5wn+FxIAnV1gA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AEEAAEIkkABkP//wPcYkkGBsP+CviEkYxOh4lkK10AKwIyBa0QkkABXwK4UPK8YkjGBpX/K/5X/K6/wE4UAAAMP+ADBBAYSBCoQPDEZAKDgAlDK9xOCFQnwAQg2DCgQjLCohXyAYJXHA4ZXQV4YiGK9qwBe4RXFMgQLCV5ytEV/42DK6IQCJwpXrf4pLDLQZXQAALMDJwxXqJAg5Cf4JBCAYJXSEoYmDK9h9maYpX/GDRX/K/5X/K/5X/K/5X/K/5X/K/5XTgAABAgPwBAgSBBAgAKDgYmCFQYCBK9oyGKIYFCHBxTHPQRX3BocPVxxXID4hXtdQZOBAIJXES4QAMDgZXED4avwKoI+FIwIFEV5jIEVwZXzHQaRBCIYFCK5rKDDAhX3eYQHFK5oYEFQZXvAFJX/K/5X/K/5XK+EAAEAmBEkQxOAQIAiEkgAL+CJkEwKuuGQSLBEn4ATh//A="))
};

// Redraw the screen
function draw() {
  // for catching any error
  try {
    g.reset().clearRect(Bangle.appRect);

    // Draw battle scene background
    g.drawImage(bg, 0, 0);

    // Use Pokemon font
    g.setFontPKMN(2);

    // Set font color to black
    g.setColor(0x0000);

    // Get and format date
    var date = new Date();
    var dayStr = require("locale").dow(date, 1).toUpperCase();
    var dayNum = date.getDate();
    var month = require("locale").month(date, 1).toUpperCase();
    var time = require("locale").time(date, 1); // Opponent's name
    var dateStr = dayNum + " " + month; // Player's name

    // Get and format storage space
    var spaceStr = require('Storage').getFree() / process.env.STORAGE; // Opponent's HP

    // Get and format battery level
    var battery = E.getBattery(); // 0-100
    var batteryStr = battery + "/100"; // Player's HP

    // Get and format RAM usage
    var memory = process.memory();
    var memoryStr = memory.usage / memory.total; // Experience points

    // Get and format temperature
    var temperature = E.getTemperature(); // Degrees (celsius)
    var temperatureStr = require("locale").temp(temperature); // Info box

    // Draw date
    var height = g.getFontHeight();
    g.drawString(time, 25, 24); // Widgets are 8*3=24px tall
    // g.drawString(spaceStr, 0, 50);
    g.drawString(dateStr, 100, 79);
    g.drawString(batteryStr, 88, 101);
    // g.drawString(memoryStr, 0, 60);
    g.drawString(temperatureStr, 10, 148);

    // Log potential bug roots
    console.log({
      "date": date,
      "memory": memory,
    });

    // Queue draw in one minute
    queueDraw();
  } catch (err) {
    // Report errors
    console.log(err);
  }
}

// Timeout used to update every minute
var drawTimeout;

// Schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

// Clear the screen
g.clear();

// First draw...
draw();

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', on => {
  if (on) {
    draw(); // Draw immediately, queue redraw
  } else { // Stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
