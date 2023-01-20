const UPDATE_MILLISECONDS = 30 * 1000;

let acc: undefined | AccelData;
let bar: undefined | PressureData;
let gps: undefined | GPSFix;
let hrm: undefined | { bpm: number, confidence: number };
let mag: undefined | CompassData;

type BtAdvMenu = "acc" | "bar" | "gps" | "hrm" | "mag" | "main";
let curMenu: BtAdvMenu = "main";
let updateInterval: undefined | number;
let mainMenuScroll = 0;
const settings = {
  barEnabled: false,
  gpsEnabled: false,
  hrmEnabled: false,
  magEnabled: false,
};

const showMainMenu = () => {
  const onOff = (b: boolean) => b ? " (on)" : " (off)";
  const mainMenu: Menu = {};

  const showMenu = (menu: Menu, scroll: number, cur: BtAdvMenu) => () => {
    E.showMenu(menu);
    mainMenuScroll = scroll;
    curMenu = cur;
  };

  mainMenu[""] = {
    "title": "--  btadv  --",
    back: showMainMenu,
  };
  (mainMenu[""] as any).scroll = mainMenuScroll; // typehack

  mainMenu["Acceleration"]                              = showMenu(accMenu, 0, "acc");
  mainMenu["Barometer" + onOff(settings.barEnabled)]    = showMenu(barMenu, 1, "bar");
  mainMenu["GPS" + onOff(settings.gpsEnabled)]          = showMenu(gpsMenu, 2, "gps");
  mainMenu["Heart Rate" + onOff(settings.hrmEnabled)]   = showMenu(hrmMenu, 3, "hrm");
  mainMenu["Magnetometer" + onOff(settings.magEnabled)] = showMenu(magMenu, 4, "mag");
  mainMenu["Exit"]                                      = () => (load as any)(); // avoid `this` + typehack

  E.showMenu(mainMenu);
  curMenu = "main";
};

const accMenu = {
  "": { "title" : "- Acceleration -" },
  "Active": { value: "true (fixed)" },
  "x": { value: "" },
  "y": { value: "" },
  "z": { value: "" },
};

const barMenu = {
  "": { "title" : "-  Barometer   -" },
  "Active": {
    value: settings.barEnabled,
    onchange: (v: boolean) => updateSetting('barEnabled', v),
  },
  "Altitude": { value: "" },
  "Press": { value: "" },
  "Temp": { value: "" },
};

const gpsMenu = {
  "": { "title" : "-      GPS     -" },
  "Active": {
    value: settings.gpsEnabled,
    onchange: (v: boolean) => updateSetting('gpsEnabled', v),
  },
  "Lat": { value: "" },
  "Lon": { value: "" },
  "Altitude": { value: "" },
  "Satellites": { value: "" },
  "HDOP": { value: "" },
};

const hrmMenu = {
  "": { "title" : "-  Heart Rate  -" },
  "Active": {
    value: settings.hrmEnabled,
    onchange: (v: boolean) => updateSetting('hrmEnabled', v),
  },
  "BPM": { value: "" },
  "Confidence": { value: "" },
};

const magMenu = {
  "": { "title" : "- Magnetometer -" },
  "Active": {
    value: settings.magEnabled,
    onchange: (v: boolean) => updateSetting('magEnabled', v),
  },
  "x": { value: "" },
  "y": { value: "" },
  "z": { value: "" },
  "Heading": { value: "" },
};

const updateMenu = () => {
  switch (curMenu) {
    case "acc":
      if (acc) {
        accMenu.x.value = acc.x.toFixed(2);
        accMenu.y.value = acc.y.toFixed(2);
        accMenu.z.value = acc.z.toFixed(2);
        E.showMenu(accMenu);
      }
      break;

    case "bar":
      if (bar) {
        barMenu.Altitude.value = bar.altitude.toFixed(1) + 'm';
        barMenu.Press.value = bar.pressure.toFixed(1) + 'mbar';
        barMenu.Temp.value = bar.temperature.toFixed(1) + 'C';
        E.showMenu(barMenu);
      }
      break;

    case "gps":
      if (gps) {
        gpsMenu.Lat.value = gps.lat.toFixed(4);
        gpsMenu.Lon.value = gps.lon.toFixed(4);
        gpsMenu.Altitude.value = gps.alt + 'm';
        gpsMenu.Satellites.value = "" + gps.satellites;
        gpsMenu.HDOP.value = (gps.hdop * 5).toFixed(1) + 'm';
        E.showMenu(gpsMenu);
      }
      break;

    case "hrm":
      if (hrm) {
        hrmMenu.BPM.value = "" + hrm.bpm;
        hrmMenu.Confidence.value = hrm.confidence + '%';
        E.showMenu(hrmMenu);
      }
      break;

    case "mag":
      if (mag) {
        magMenu.x.value = "" + mag.x;
        magMenu.y.value = "" + mag.y;
        magMenu.z.value = "" + mag.z;
        magMenu.Heading.value = mag.heading.toFixed(1);
        E.showMenu(magMenu);
      }
      break;
  }
};

const updateBleAdvert = () => {
  let bleAdvert: { [key: number]: undefined };

  if (!(bleAdvert = (Bangle as any).bleAdvert))
    bleAdvert = (Bangle as any).bleAdvert = {};

  // const data = [ APP_ADVERTISING_DATA ]; // Always advertise at least app name

  // if (bar) {
  //   data.push(encodeBarServiceData(bar));
  //   bar = undefined;
  // }

  // if (gps && gps.lat && gps.lon) {
  //   data.push(encodeGpsServiceData(gps));
  //   gps = undefined;
  // }

  if (hrm) {
    bleAdvert[0x180d] = undefined; // Advertise HRM

    // hack
    if (NRF.getSecurityStatus().connected) {
      NRF.updateServices({
        0x180d: {
          0x2a37: {
            value: [0, hrm.bpm],
            notify: true,
          }
        }
      })
      return;
    }

    // data.push({ 0x2a37: [ 0, hrm.bpm ] });
    // hrm = undefined;
  }

  // if (mag) {
  //   data.push(encodeMagServiceData(mag));
  //   mag = undefined;
  // }

  const interval = UPDATE_MILLISECONDS; // / data.length;

  NRF.setAdvertising(
    (Bangle as any).bleAdvert,
    {
      interval,
    },
  );
};

// {
//   flags: u8,
//   bytes: [u8...]
// }
// flags {
//   1 << 0: 16bit bpm
//   1 << 1: sensor contact available
//   1 << 2: sensor contact boolean
//   1 << 3: energy expended, next 16 bits
//   1 << 4: "rr" data available, u16s, intervals
// }
const encodeHrm = () => [0, hrm ? hrm.bpm : 0];

const encodeBarServiceData = (data: PressureData) => {
  const t = toByteArray(Math.round(data.temperature * 100), 2, true);
  const p = toByteArray(Math.round(data.pressure * 1000), 4, false);
  const e = toByteArray(Math.round(data.altitude * 100), 3, true);

  return [
      0x02, 0x01, 0x06,                               // Flags
      0x05, 0x16, 0x6e, 0x2a, t[0], t[1],             // Temperature
      0x07, 0x16, 0x6d, 0x2a, p[0], p[1], p[2], p[3], // Pressure
      0x06, 0x16, 0x6c, 0x2a, e[0], e[1], e[2]        // Elevation
  ];
};

const encodeGpsServiceData = (data: GPSFix) => {
  const s = toByteArray(Math.round(1000 * data.speed / 36), 2, false);
  const lat = toByteArray(Math.round(data.lat * 10000000), 4, true);
  const lon = toByteArray(Math.round(data.lon * 10000000), 4, true);
  const e = toByteArray(Math.round(data.alt * 100), 3, true);
  const h = toByteArray(Math.round(data.course * 100), 2, false);

  return [
      0x02, 0x01, 0x06, // Flags
      0x14, 0x16, 0x67, 0x2a, 0x9d, 0x02, s[0], s[1], lat[0], lat[1], lat[2],
      lat[3], lon[0], lon[1], lon[2], lon[3], e[0], e[1], e[2], h[0], h[1]
                        // Location and Speed
  ];
};

const encodeMagServiceData = (data: CompassData) => {
  const x = toByteArray(data.x, 2, true);
  const y = toByteArray(data.y, 2, true);
  const z = toByteArray(data.z, 2, true);

  return [
      0x02, 0x01, 0x06,                                          // Flags
      0x09, 0x16, 0xa1, 0x2a, x[0], x[1], y[0], y[1], z[0], z[1] // Mag 3D
  ];
};

const toByteArray = (value: number, numberOfBytes: number, isSigned: boolean) => {
  const byteArray: Array<number> = new Array(numberOfBytes);

  if(isSigned && (value < 0)) {
    value += 1 << (numberOfBytes * 8);
  }

  for(let index = 0; index < numberOfBytes; index++) {
    byteArray[index] = (value >> (index * 8)) & 0xff;
  }

  return byteArray;
};

const enableSensors = () => {
  Bangle.setBarometerPower(settings.barEnabled, "btadv");
  Bangle.setGPSPower(settings.gpsEnabled, "btadv");
  Bangle.setHRMPower(settings.hrmEnabled, "btadv");
  Bangle.setCompassPower(settings.magEnabled, "btadv");
};

const updateSetting = (
  name: keyof typeof settings,
  value: boolean,
) => {
  settings[name] = value;
  //require('Storage').writeJSON(SETTINGS_FILENAME, settings);
  enableSensors();
};

// ----------------------------

NRF.setServices(
  {
    0x180d: {
      0x2a37: {
        value: encodeHrm(),
        readable: true,
        notify: true,
        //indicate: true, // notify + ACK
      },
    },
  },
  {
    advertise: [
      '180d',
    ]
  },
);

const updateServices = () => {
  NRF.updateServices({
    0x180d: {
      0x2a37: {
        value: encodeHrm(),
        notify: true,
      }
    }
  });
};

Bangle.on('accel', newAcc => acc = newAcc);
Bangle.on('pressure', newBar => bar = newBar);
Bangle.on('GPS', newGps => gps = newGps);
Bangle.on('HRM', newHrm => hrm = newHrm);
Bangle.on('mag', newMag => mag = newMag);

enableSensors();
showMainMenu();

// setInterval(updateAdvert, 10000);
setInterval(updateMenu, 1000);

NRF.on("connect", () => {
  updateInterval = setInterval(updateServices, 1000);
});
NRF.on("disconnect", () => {
  clearInterval(updateInterval);
  updateInterval = undefined;
});

// TODO debounce
// TODO: emit other data beside HRM (via set/updateServices)
// FIXME: ui overlap
// Bangle.loadWidgets();
// Bangle.drawWidgets();
