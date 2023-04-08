const app = "drained";

// from boot.js
if(typeof drainedInterval !== "undefined")
  drainedInterval = clearInterval(drainedInterval) as undefined;

// backlight
Bangle.setLCDBrightness(0);

// peripherals
const powerNoop = () => false;

const forceOff = (name: "GPS" | "HRM" | "Compass" /*| "Barom"*/) => {
  if ((Bangle as any)._PWR?.[name])
    (Bangle as any)._PWR[name] = [];

  // if(name === "Barom"){ setBarometerPower(...) }
  //                               ^^^^
  Bangle[`set${name}Power`](false, app);
  Bangle[`set${name}Power`] = powerNoop;
};
forceOff("GPS");
forceOff("HRM");
NRF.disconnect();
NRF.sleep();

// events
Bangle.removeAllListeners();
clearWatch();

// UI
Bangle.setOptions({
  wakeOnFaceUp: false,
  wakeOnTouch: false,
  wakeOnTwist: false,
});

// clock
let nextDraw: number | undefined;
const draw = () => {
  const x = g.getWidth() / 2;
  const y = g.getHeight() / 2 - 48;

  const date = new Date();

  const timeStr = require("locale").time(date, 1);
  const dateStr = require("locale").date(date, 0).toUpperCase() +
    "\n" +
    require("locale").dow(date, 0).toUpperCase();

  g.reset()
    .clearRect(Bangle.appRect)
    .setFont("Vector", 55)
    .setFontAlign(0, 0)
    .drawString(timeStr, x, y)
    .setFont("Vector", 24)
    .drawString(dateStr, x, y + 56)
    .drawString(`${E.getBattery()}%`, x, y + 104);

  if(nextDraw) clearTimeout(nextDraw);
  nextDraw = setTimeout(() => {
    nextDraw = undefined;
    draw();
  }, 60000 - (date.getTime() % 60000));
};

Bangle.setUI({
  mode: "custom",
  remove: () => {
    if (nextDraw) clearTimeout(nextDraw);
    nextDraw = undefined;
  },
});
Bangle.CLOCK=1;

g.clear();
draw();
