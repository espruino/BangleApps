// TODO:
// [ ] fix format of EnvSensing data
// [-] handle NaNs in data
// [x] fix sending of HRM / changing service?
// [.] fix menu scrolling/jumping
// [ ] fix resetting to accel menu

const enum Intervals {
  BLE_ADVERT = 60 * 1000,
  BLE = 1000,
  MENU_WAKE = 1000,
  MENU_SLEEP = 30 * 1000,
}

type Hrm = { bpm: number, confidence: number };

// https://github.com/sputnikdev/bluetooth-gatt-parser/blob/master/src/main/resources/gatt/
const enum BleServ {
  // org.bluetooth.service.heart_rate
  // contains: HRM
  HRM = "0x180d",

  // org.bluetooth.service.environmental_sensing
  // contains: Elevation, Temp(Celsius), Pressure, Mag
  EnvSensing = "0x181a",

  // org.bluetooth.service.location_and_navigation
  // contains: LocationAndSpeed
  LocationAndNavigation = "0x1819",

  // Acc // none known for this
}

const services = [BleServ.HRM, BleServ.EnvSensing, BleServ.LocationAndNavigation];

const enum BleChar {
  // org.bluetooth.characteristic.heart_rate_measurement
  // <see encode function>
  HRM = "0x2a37",

  // org.bluetooth.characteristic.elevation
  // s24, meters 0.01
  Elevation = "0x2a6c",

  // org.bluetooth.characteristic.temperature
  // s16 *10^2
  Temp = "0x2a6e",
  // org.bluetooth.characteristic.temperature_celsius
  // s16 *10^2
  TempCelsius = "0x2A1F",

  // org.bluetooth.characteristic.pressure
  // u32 *10
  Pressure = "0x2a6d",

  // org.bluetooth.characteristic.location_and_speed
  // <see encodeGps>
  LocationAndSpeed = "0x2a67",

  // org.bluetooth.characteristic.magnetic_flux_density_3d
  // s16: x, y, z, tesla (10^-7)
  MagneticFlux3D = "0x2aa1",
}

type BleCharAdvert = {
  value?: Array<number>,
  readable?: true,
  notify?: true,
  indicate?: true, // notify + ACK
  maxLen?: number,
};

type BleServAdvert = {
  [key in BleChar]?: BleCharAdvert;
};

type LenFunc<T> = {
  (_: T): Array<number>,
  maxLen: number,
}

let acc: undefined | AccelData;
let bar: undefined | PressureData;
let gps: undefined | GPSFix;
let hrm: undefined | Hrm;
let mag: undefined | CompassData;

type BtAdvMenu = "acc" | "bar" | "gps" | "hrm" | "mag" | "main";
let curMenuName: BtAdvMenu = "main";
let curMenu: MenuInstance;
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
    mainMenuScroll = scroll; // int

    curMenu = E.showMenu(menu);

    curMenuName = cur;
  };

  mainMenu[""] = {
    "title": "BLE Advert",
  };
  (mainMenu[""] as any).scroll = mainMenuScroll; // typehack

  mainMenu["Acceleration"]                              = showMenu(accMenu, 0, "acc");
  mainMenu["Barometer" + onOff(settings.barEnabled)]    = showMenu(barMenu, 1, "bar");
  mainMenu["GPS" + onOff(settings.gpsEnabled)]          = showMenu(gpsMenu, 2, "gps");
  mainMenu["Heart Rate" + onOff(settings.hrmEnabled)]   = showMenu(hrmMenu, 3, "hrm");
  mainMenu["Magnetometer" + onOff(settings.magEnabled)] = showMenu(magMenu, 4, "mag");
  mainMenu["Exit"]                                      = () => (load as any)(); // avoid `this` + typehack

  curMenu = E.showMenu(mainMenu);
  curMenuName = "main";
};

const optionsCommon = {
  back: showMainMenu,
};

const accMenu = {
  "": { "title" : "Acceleration", ...optionsCommon },
  "Active": { value: "true (fixed)" },
  "x": { value: "" },
  "y": { value: "" },
  "z": { value: "" },
};

const barMenu = {
  "": { "title" : "Barometer", ...optionsCommon },
  "Active": {
    value: settings.barEnabled,
    onchange: (v: boolean) => updateSetting('barEnabled', v),
  },
  "Altitude": { value: "" },
  "Press": { value: "" },
  "Temp": { value: "" },
};

const gpsMenu = {
  "": { "title" : "GPS", ...optionsCommon },
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
  "": { "title" : "Heart Rate", ...optionsCommon },
  "Active": {
    value: settings.hrmEnabled,
    onchange: (v: boolean) => updateSetting('hrmEnabled', v),
  },
  "BPM": { value: "" },
  "Confidence": { value: "" },
};

const magMenu = {
  "": { "title" : "Magnetometer", ...optionsCommon },
  "Active": {
    value: settings.magEnabled,
    onchange: (v: boolean) => updateSetting('magEnabled', v),
  },
  "x": { value: "" },
  "y": { value: "" },
  "z": { value: "" },
  "Heading": { value: "" },
};

const redrawMenu = (newMenu: Menu) => {
  const scroll = (curMenu as any).scroller.scroll;

  curMenu = E.showMenu(newMenu);

  // FIXME: doesn't work for promenu
  (curMenu as any).scroller.scroll = scroll; // typehack
  curMenu.draw();
};

const updateMenu = () => {
  switch (curMenuName) {
    case "acc":
      if (acc) {
        accMenu.x.value = acc.x.toFixed(2);
        accMenu.y.value = acc.y.toFixed(2);
        accMenu.z.value = acc.z.toFixed(2);
        redrawMenu(accMenu);
      } else if (accMenu.x.value !== "...") {
        accMenu.x.value = accMenu.y.value = accMenu.z.value = "...";
        redrawMenu(accMenu);
      }
      break;

    case "bar":
      if (bar) {
        barMenu.Altitude.value = bar.altitude.toFixed(1) + 'm';
        barMenu.Press.value = bar.pressure.toFixed(1) + 'mbar';
        barMenu.Temp.value = bar.temperature.toFixed(1) + 'C';
        redrawMenu(barMenu);
      } else if (barMenu.Altitude.value !== "...") {
        barMenu.Altitude.value = barMenu.Press.value = barMenu.Temp.value = "...";
        redrawMenu(accMenu);
      }
      break;

    case "gps":
      if (gps) {
        gpsMenu.Lat.value = gps.lat.toFixed(4);
        gpsMenu.Lon.value = gps.lon.toFixed(4);
        gpsMenu.Altitude.value = gps.alt + 'm';
        gpsMenu.Satellites.value = "" + gps.satellites;
        gpsMenu.HDOP.value = (gps.hdop * 5).toFixed(1) + 'm';
        redrawMenu(gpsMenu);
      } else if (gpsMenu.Lat.value !== "...") {
        gpsMenu.Lat.value = gpsMenu.Lon.value = gpsMenu.Altitude.value =
          gpsMenu.Satellites.value = gpsMenu.HDOP.value = "...";
        redrawMenu(gpsMenu);
      }
      break;

    case "hrm":
      if (hrm) {
        hrmMenu.BPM.value = "" + hrm.bpm;
        hrmMenu.Confidence.value = hrm.confidence + '%';
        redrawMenu(hrmMenu);
      } else if (hrmMenu.BPM.value !== "...") {
        hrmMenu.BPM.value = hrmMenu.Confidence.value = "...";
        redrawMenu(hrmMenu);
      }
      break;

    case "mag":
      if (mag) {
        magMenu.x.value = "" + mag.x;
        magMenu.y.value = "" + mag.y;
        magMenu.z.value = "" + mag.z;
        magMenu.Heading.value = mag.heading.toFixed(1);
        redrawMenu(magMenu);
      } else if (magMenu.x.value !== "...") {
        magMenu.x.value = magMenu.y.value = magMenu.z.value = magMenu.Heading.value = "...";
        redrawMenu(magMenu);
      }
      break;
  }
};

const encodeHrm: LenFunc<Hrm> = (hrm: Hrm) =>
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
  [0, hrm.bpm];
encodeHrm.maxLen = 2;

const encodePressure: LenFunc<PressureData> = (data: PressureData) =>
  toByteArray(Math.round(data.pressure * 1000), 4, false);
encodePressure.maxLen = 4;

const encodeElevation: LenFunc<PressureData> = (data: PressureData) =>
  toByteArray(Math.round(data.altitude * 100), 3, true);
encodeElevation.maxLen = 3;

const encodeTemp: LenFunc<PressureData> = (data: PressureData) =>
  toByteArray(Math.round(data.temperature * 100), 2, true);
encodeTemp.maxLen = 2;

const encodeGps: LenFunc<GPSFix> = (data: GPSFix) => {
  // flags: 16 bits
  //   bit 0: Instantaneous Speed Present
  //   bit 1: Total Distance Present
  //   bit 2: Location Present
  //   bit 3: Elevation Present
  //   bit 4: Heading Present
  //   bit 5: Rolling Time Present
  //   bit 6: UTC Time Present
  //
  //   bit 7-8: position status
  //     0 (0b00): no position
  //     1 (0b01): position ok
  //     2 (0b10): estimated position
  //     3 (0b11): last known position
  //
  //   bit 9: speed & distance format
  //     0: 2d
  //     1: 3d
  //
  //   bit 10-11: elevation source
  //     0: Positioning System
  //     1: Barometric Air Pressure
  //     2: Database Service (or similiar)
  //     3: Other
  //
  //   bit 12: Heading Source
  //     0: Heading based on movement
  //     1: Heading based on magnetic compass
  //
  // speed: u16 (m/s), 1/100
  // distance: u24, 1/10
  // lat: s32, 1/10^7
  // lon: s32, 1/10^7
  // elevation: s24, 1/100
  // heading: u16 (deg), 1/100
  // rolling time: u8 (s)
  // utc time: org.bluetooth.characteristic.date_time

  const speed = toByteArray(Math.round(1000 * data.speed / 36), 2, false);
  const lat = toByteArray(Math.round(data.lat * 10000000), 4, true);
  const lon = toByteArray(Math.round(data.lon * 10000000), 4, true);
  const elevation = toByteArray(Math.round(data.alt * 100), 3, true);
  const heading = toByteArray(Math.round(data.course * 100), 2, false);

  return [
      0x9d, // 0b10011101: speed, location, elevation, heading [...]
      0x2,  // 0b00000010: position ok, 3d speed/distance(?)
      speed[0]!, speed[1]!,
      lat[0]!, lat[1]!, lat[2]!, lat[3]!,
      lon[0]!, lon[1]!, lon[2]!, lon[3]!,
      elevation[0]!, elevation[1]!, elevation[2]!,
      heading[0]!, heading[1]!
  ];
};
encodeGps.maxLen = 17;

const encodeMag: LenFunc<CompassData> = (data: CompassData) => {
  const x = toByteArray(data.x, 2, true);
  const y = toByteArray(data.y, 2, true);
  const z = toByteArray(data.z, 2, true);

  return [ x[0]!, x[1]!, y[0]!, y[1]!, z[0]!, z[1]! ];
};
encodeMag.maxLen = 6;

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
  if (!settings.barEnabled)
    bar = undefined;

  Bangle.setGPSPower(settings.gpsEnabled, "btadv");
  if (!settings.gpsEnabled)
    gps = undefined;

  Bangle.setHRMPower(settings.hrmEnabled, "btadv");
  if (!settings.hrmEnabled)
    hrm = undefined;

  Bangle.setCompassPower(settings.magEnabled, "btadv");
  if (!settings.magEnabled)
    mag = undefined;
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

const serviceActive = (serv: BleServ): boolean => {
  switch (serv) {
    case BleServ.HRM: return !!hrm;
    case BleServ.EnvSensing: return !!(bar || mag);
    case BleServ.LocationAndNavigation: return !!(gps && gps.lat && gps.lon);
  }
};

const serviceToAdvert = (serv: BleServ, initial = false): BleServAdvert => {
  switch (serv) {
    case BleServ.HRM:
      if (hrm || initial) {
        const o: BleCharAdvert = {
          maxLen: encodeHrm.maxLen,
          readable: true,
          notify: true,
        };
        if (hrm) {
          o.value = encodeHrm(hrm);
        }

        return { [BleChar.HRM]: o };
      }
      return {};

    case BleServ.LocationAndNavigation:
      if (gps || initial) {
        const o: BleCharAdvert = {
          maxLen: encodeGps.maxLen,
          readable: true,
          notify: true,
        };
        if (gps) {
          o.value = encodeGps(gps);
        }

        return { [BleChar.LocationAndSpeed]: o };
      }
      return {};

    case BleServ.EnvSensing: {
      const o: BleServAdvert = {};

      if (bar || initial) {
          o[BleChar.Elevation] = {
            maxLen: encodeElevation.maxLen,
            readable: true,
            notify: true,
          };
          o[BleChar.TempCelsius] = {
            maxLen: encodeTemp.maxLen,
            readable: true,
            notify: true,
          };
          o[BleChar.Pressure] = {
            maxLen: encodePressure.maxLen,
            readable: true,
            notify: true,
          };

          if (bar) {
            o[BleChar.Elevation]!.value = encodeElevation(bar);
            o[BleChar.TempCelsius]!.value = encodeTemp(bar);
            o[BleChar.Pressure]!.value = encodePressure(bar);
          }
      }

      if (mag || initial) {
        o[BleChar.MagneticFlux3D] = {
          maxLen: encodeMag.maxLen,
          readable: true,
          notify: true,
        };

        if (mag) {
          o[BleChar.MagneticFlux3D]!.value = encodeMag(mag);
        }
      }

      return o;
    }
  }
};

const getBleAdvert = <T>(map: (s: BleServ) => T, all = false) => {
  const advert: { [key in BleServ]?: T } = {};

  for (const serv of services) {
    if (all || serviceActive(serv)) {
      advert[serv] = map(serv);
    }
  }

  return advert;
};

// TODO: call this at the start, set the advert
const updateBleAdvert = () => {
  let bleAdvert: ReturnType<typeof getBleAdvert<undefined>>;

  if (!(bleAdvert = (Bangle as any).bleAdvert)) {
    bleAdvert = getBleAdvert(_ => undefined);

    (Bangle as any).bleAdvert = bleAdvert;
  }

  try {
    NRF.setAdvertising(bleAdvert);
  } catch (e) {
    console.log("setAdvertising(): " + e);
  }
};

// call this when settings changes, or when we have new data to send/serve
const updateServices = () => {
  const newAdvert = getBleAdvert(serviceToAdvert);

  NRF.updateServices(newAdvert);
};

Bangle.on('accel', newAcc => acc = newAcc);
Bangle.on('pressure', newBar => bar = newBar);
Bangle.on('GPS', newGps => gps = newGps);
Bangle.on('HRM', newHrm => hrm = newHrm);
Bangle.on('mag', newMag => mag = newMag);

// show widgets to affect appRect
Bangle.loadWidgets();
Bangle.drawWidgets();

// show UI
showMainMenu();
const menuInterval = setInterval(updateMenu, Intervals.MENU_WAKE);
Bangle.on("lock", locked => {
  changeInterval(
    menuInterval,
    locked ? Intervals.MENU_SLEEP : Intervals.MENU_WAKE,
  );
});

// turn things on
enableSensors();

// set services/advert once at startup:
{
  // must have fixed services from the start:
  const ad = getBleAdvert(serv => serviceToAdvert(serv, true), /*all*/true);

  NRF.setServices(
    ad,
    {
      // FIXME: go via setAdvertising(), merge wth Bangle.bleAdvert
      advertise: Object
        .keys(ad)
        .map((k: string) => k.replace("0x", ""))

      // TODO: uart: false,
    },
  );
}

let iv: undefined | number;
const setIntervals = (connected: boolean) => {
  if (connected) {
    if (iv) {
      changeInterval(iv, Intervals.BLE);
    } else {
      iv = setInterval(
        updateServices,
        Intervals.BLE
      );
    }
  } else if (iv) {
    clearInterval(iv);
    iv = undefined;
  }
};

setIntervals(NRF.getSecurityStatus().connected);
NRF.on("connect", () => {
  setIntervals(true);
});
NRF.on("disconnect", () => {
  setIntervals(false);
});
