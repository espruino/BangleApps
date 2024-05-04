const app = "drained";

// from boot.js
declare var drainedInterval: IntervalId | undefined;
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
let nextDraw: TimeoutId | undefined;
const draw = () => {
  const x = g.getWidth() / 2;
  const y = g.getHeight() / 2 - 48;

  const date = new Date();

  const timeStr = require("locale").time(date, 1);
  const dateStr = require("locale").date(date, 0).toUpperCase() +
    "\n" +
    require("locale").dow(date, 0).toUpperCase();
  const x2 = x + 6;
  const y2 = y + 66;

  g.reset()
    .clearRect(Bangle.appRect)
    .setFont("Vector", 55)
    .setFontAlign(0, 0)
    .drawString(timeStr, x, y)
    .setFont("Vector", 24)
    .drawString(dateStr, x2, y2)
    .drawString(`${E.getBattery()}%`, x2, y2 + 48);

  if(nextDraw) clearTimeout(nextDraw);
  nextDraw = setTimeout(() => {
    nextDraw = undefined;
    draw();
  }, 60000 - (date.getTime() % 60000));
};

const reload = () => {
  const showMenu = () => {
    const menu: { [k: string]: () => void } = {
      "Restore to full power": drainedRestore,
    };

    if (NRF.getSecurityStatus().advertising)
      menu["Disable BLE"] = () => { NRF.sleep(); showMenu(); };
    else
      menu["Enable BLE"] = () => { NRF.wake(); showMenu(); };

    menu["Settings"] = () => load("setting.app.js");
    menu["Recovery"] = () => Bangle.showRecoveryMenu();
    menu["Exit menu"] = reload;

    if(nextDraw) clearTimeout(nextDraw);
    E.showMenu(menu);
  };

  Bangle.setUI({
    mode: "custom",
    remove: () => {
      if (nextDraw) clearTimeout(nextDraw);
      nextDraw = undefined;
    },
    btn: showMenu
  });
  Bangle.CLOCK=1;

  g.clear();
  draw();
};
reload();

// permit other apps to put themselves into low-power mode
Bangle.emit("drained", E.getBattery());

// restore normal boot on charge
const { keepStartup = true, restore = 20, exceptions = ["widdst.0"] }: DrainedSettings
  = require("Storage").readJSON(`${app}.setting.json`, true) || {};

// re-enable normal boot code when we're above a threshold:
function drainedRestore() { // "public", to allow users to call
  if(!keepStartup){
    try{
      eval(require('Storage').read('bootupdate.js'));
    }catch(e){
      console.log("error restoring bootupdate:" + e);
    }
  }
  load(); // necessary after updating boot.0
}

const checkCharge = () => {
  if(E.getBattery() < restore) return;
  drainedRestore();
};

if (Bangle.isCharging())
  checkCharge();

Bangle.on("charging", charging => {
  if(charging) checkCharge();
});

if(!keepStartup){
  const storage = require("Storage");
  for(const boot of exceptions){
    try{
      const js = storage.read(`${boot}.boot.js`);
      if(js) eval(js);
    }catch(e){
      console.log(`error loading boot exception "${boot}": ${e}`);
    }
  }
}
