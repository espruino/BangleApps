const app = "drained";

// from boot.js
declare var drainedInterval: number | undefined;
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
  Bangle[`set${name}Power`](0, app);
  Bangle[`set${name}Power`] = powerNoop;
};
forceOff("GPS");
forceOff("HRM");
try{
  NRF.disconnect();
  NRF.sleep();
}catch(e){
  console.log(`couldn't disable ble: ${e}`);
}

// events
Bangle.removeAllListeners();
clearWatch();

// UI
Bangle.setOptions({
  wakeOnFaceUp: 0,
  wakeOnTouch: 0,
  wakeOnTwist: 0,
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

const reload = () => {
  Bangle.setUI({
    mode: "custom",
    remove: () => {
      if (nextDraw) clearTimeout(nextDraw);
      nextDraw = undefined;
    },
    btn: () => {
      E.showPrompt("Restore watch to full power?").then(v => {
        if(v){
          drainedRestore();
        }else{
          reload();
        }
      })
    }
  });
  Bangle.CLOCK=1;

  g.clear();
  draw();
};
reload();

// permit other apps to put themselves into low-power mode
Bangle.emit("drained", E.getBattery());

// restore normal boot on charge
const { disableBoot = false, restore = 20 }: DrainedSettings
  = require("Storage").readJSON(`${app}.setting.json`, true) || {};

// re-enable normal boot code when we're above a threshold:
function drainedRestore() { // "public", to allow users to call
  if(disableBoot){
    try{
      eval(require('Storage').read('bootupdate.js'));
    }catch(e){
      console.log("error restoring bootupdate:" + e);
    }
  }
  load(); // necessary after updating boot.0
}

if(disableBoot){
  const checkCharge = () => {
    if(E.getBattery() < restore) return;
    drainedRestore();
  };

  if (Bangle.isCharging())
    checkCharge();

  Bangle.on("charging", charging => {
    if(charging) checkCharge();
  });
}
