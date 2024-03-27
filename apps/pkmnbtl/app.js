// Import required modules once
const heatshrink = require("heatshrink");
const locale = require("locale");

const decompressHeatshrink = str => heatshrink.decompress(atob(str));

// Constants
const font = E.toString(decompressHeatshrink("AAMwvt9mAFBuFwj1+vkQgt/qtQuEAiF4q18t0ahkCm95rs3g0NgFQsEAjkioNBgACBkUcE4N4D4MIn0MhEAhsOE4IAEgEGg0AgMCgkIiEgoEAjE8o1CsU8jEAgUiv1+gUCgEmt1OpVavUygEEo1SqVyt1MgEMjk0sgYBgkAulWB4NSr0MgE8vwHFsFgo1OrFwMwMsB4d+liSBvVKAAN+nkAs1mgFttxuBhkemR5BAAUAiUehgsBmAoBpdbVwMgWYM8t1eJoM4gcMmlEmkMgcAv9JAAU5RYKrDVQQPBAwg0BC4lJXwN/pAADUYIfCB4UuB4MIAAd/awQpCgEOFgV+oAdBv7aBjEkoUBA4MBAAgHBkEQjDZBEoIHChEEgwHBLohVDJokwB4lFk0dB4lMpUxgEyNokmgBKBoF/AYUAvkCIwY3BsEYg0Dg0YcQN/h0IJAMOOoVjikYiljO4NAK4MfL4InBoNDotJqNhUoSLCnEGSYUAA"));
const bg = {
  width: 176, height: 176, bpp: 4,
  buffer: decompressHeatshrink("/4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AJ+EAh5C/K7EAAAwocDzxXUmcDgczmEDK/5XUmEwHANEABhX/K4ZYBV4JX/V60AgY4dK+YAlK+AA/K/5X/AH5X/K7sAFEommK5SwlP84vJGEonnWBQAoWNoA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AGsAAAwkeK+MzgcDmcwgZXfh5XzmEwHAN3ACt/ag5XxLAKvBK8KwvV4kAgaPdK+YAmK94Al+BX/AAZCSK/5DEV/6upK/6uXK/6uXK/6uXK/6uXK/7FZK/5X/K/4A/K+8ABxv4xAAUgAABK9ovBK/5WWK5wn+FxIAnV1gA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AEEAAEIkkABkP//wPcYkkGBsP+CviEkYxOh4lkK10AKwIyBa0QkkABXwK4UPK8YkjGBpX/K/5X/K6/wE4UAAAMP+ADBBAYSBCoQPDEZAKDgAlDK9xOCFQnwAQg2DCgQjLCohXyAYJXHA4ZXQV4YiGK9qwBe4RXFMgQLCV5ytEV/42DK6IQCJwpXrf4pLDLQZXQAALMDJwxXqJAg5Cf4JBCAYJXSEoYmDK9h9maYpX/GDRX/K/5X/K/5X/K/5X/K/5X/K/5XTgAABAgPwBAgSBBAgAKDgYmCFQYCBK9oyGKIYFCHBxTHPQRX3BocPVxxXID4hXtdQZOBAIJXES4QAMDgZXED4avwKoI+FIwIFEV5jIEVwZXzHQaRBCIYFCK5rKDDAhX3eYQHFK5oYEFQZXvAFJX/K/5X/K/5XK+EAAEAmBEkQxOAQIAiEkgAL+CJkEwKuuGQSLBEn4ATh//A=")
};

// Extending Graphics to set custom Pokemon font
Graphics.prototype.setFontPKMN = function (scale) {
  this.setFontCustom(font, 32, atob("AgUDBAYHCAMFBQQFAwcDCAgHCAgICAgICAgDAwUFBQkHCAgICAgICAgGCAgICAgICAgICAgICAgICAgEAgQ="), 8 + (scale << 8) + (1 << 16));
  return this;
};

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

// Draw function
function draw() {
  try {
    g.reset().clearRect(Bangle.appRect)
      .drawImage(bg, 0, 0)
      .setFontPKMN(1)
      .setColor(0x0000);

    const date = new Date();
    drawTimeInformation(date);
    drawSystemInformation();

    // Log potential bug roots
    console.log({
      date,
      battery: E.getBattery(),
      memory: process.memory(),
      temperature: E.getTemperature()
    });

    queueDraw();
  } catch (err) {
    console.log(err);
  }
}

// Helper function to draw time-related information
function drawTimeInformation(date) {
  const time = locale.time(date, 1);
  const dayStr = locale.dow(date, 1).toUpperCase();
  const dayNum = date.getDate();
  const month = locale.month(date, 1).toUpperCase();
  const dateStr = `${dayNum} ${month}`;

  const height = g.getFontHeight();
  g.drawString(time, 35, 24)
    .drawString(dateStr, 108, 85);
}

// Helper function to draw system information
function drawSystemInformation() {
  const spaceStr = require("Storage").getFree() / process.env.STORAGE;
  const batteryStr = `${E.getBattery()}/100`.padStart(7, "0");
  const memory = process.memory();
  const memoryStr = memory.usage / memory.total;
  const temperatureStr = locale.temp(E.getTemperature());

  g.drawString(spaceStr, 0, 60)
    .drawString(batteryStr, 97, 102)
    .drawString(memoryStr, 0, 70)
    .drawString(temperatureStr, 10, 145);
}

// Clear the screen
g.clear();

// First draw...
draw();

// Stop updates when LCD is off, restart when on
Bangle.on("lcdPower", on => {
  if (on) {
    draw(); // Draw immediately, queue redraw
  } else if (drawTimeout) {
    clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
