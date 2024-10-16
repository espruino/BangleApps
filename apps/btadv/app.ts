{
// @ts-expect-error helper

const __assign = Object.assign;

const Layout = require("Layout");

Bangle.loadWidgets();
Bangle.drawWidgets();

const enum Intervals {
  // BLE_ADVERT = 60 * 1000,
  BLE = 1000, // info screen
  BLE_BACKGROUND = 5000, // button screen
  UI_INFO = 5 * 1000, // info refresh, wake
  UI_INFO_SLEEP = 15 * 1000, // info refresh, asleep
}

type Hrm = { bpm: number, confidence: number };

const HRM_MIN_CONFIDENCE = 75;

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

  // org.microbit.service.accelerometer
  // contains: Acc
  Acc = "E95D0753251D470AA062FA1922DFA9A8",
}

const services = [
    BleServ.HRM,
    BleServ.EnvSensing,
    BleServ.LocationAndNavigation,
    BleServ.Acc,
];

const enum BleChar {
  // org.bluetooth.characteristic.heart_rate_measurement
  // <see encode function>
  HRM = "0x2a37",

  // org.bluetooth.characteristic.body_sensor_location
  // u8
  SensorLocation = "0x2a38",

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

  // org.microbit.characteristic.accelerometer_data
  // s16 x3, -1024 .. 1024
  // docs: https://lancaster-university.github.io/microbit-docs/ble/accelerometer-service/
  Acc = "E95DCA4B251D470AA062FA1922DFA9A8",
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

const enum SensorLocations {
  Other = 0,
  Chest = 1,
  Wrist = 2,
  Finger = 3,
  Hand = 4,
  EarLobe = 5,
  Foot = 6,
}

let acc: undefined | AccelData;
let bar: undefined | PressureData;
let gps: undefined | GPSFix;
let hrm: undefined | Hrm;
let hrmAny: undefined | Hrm;
let mag: undefined | CompassData;
let btnsShown = false;
let prevBtnsShown: boolean | undefined = undefined;
let hrmAnyClear: undefined | number;

type BtAdvType<IncludeAcc = false> = "bar" | "gps" | "hrm" | "mag" | (IncludeAcc extends true ? "acc" : never);
type BtAdvMap<T, IncludeAcc = false> = { [key in BtAdvType<IncludeAcc>]: T };

const settings: BtAdvMap<boolean> = {
  bar: false,
  gps: false,
  hrm: false,
  mag: false,
};

const idToName: BtAdvMap<string> = {
  bar: "Barometer",
  gps: "GPS",
  hrm: "HRM",
  mag: "Magnetometer",
};

// 15 characters per line
const infoFont: FontNameWithScaleFactor = "6x8:2";

const colour = {
  on: "#0f0",
  off: "#fff",
} as const;

const makeToggle = (id: BtAdvType) => () => {
  settings[id] = !settings[id];

  const entry = btnLayout[id]!;
  const col = settings[id] ? colour.on : colour.off;

  entry.btnBorder = entry.col = col;

  btnLayout.update();
  btnLayout.render();

  //require('Storage').writeJSON(SETTINGS_FILENAME, settings);
  enableSensors();
};

const btnStyle: {
  font: FontNameWithScaleFactor,
  fillx?: 1,
  filly?: 1,
  col: ColorResolvable,
  bgCol: ColorResolvable,
  btnBorder: ColorResolvable,
} = {
  font: "Vector:14",
  fillx: 1,
  filly: 1,
  col: g.theme.fg,
  bgCol: g.theme.bg,
  btnBorder: "#fff",
};

const btnLayout = new Layout(
  {
    type: "v",
    c: [
      {
        type: "h",
        c: [
          {
            type: "btn",
            label: idToName.bar,
            id: "bar",
            cb: makeToggle('bar'),
            ...btnStyle,
          },
          {
            type: "btn",
            label: idToName.gps,
            id: "gps",
            cb: makeToggle('gps'),
            ...btnStyle,
          },
        ]
      },
      {
        type: "h",
        c: [
          // hrm, mag
          {
            type: "btn",
            label: idToName.hrm,
            id: "hrm",
            cb: makeToggle('hrm'),
            ...btnStyle,
          },
          {
            type: "btn",
            label: idToName.mag,
            id: "mag",
            cb: makeToggle('mag'),
            ...btnStyle,
          },
        ]
      },
      {
        type: "h",
        c: [
          {
            type: "btn",
            label: "Back",
            cb: () => {
              setBtnsShown(false);
            },
            ...btnStyle,
          },
        ]
      }
    ]
  },
  {
    lazy: true,
    back: () => {
      setBtnsShown(false);
    },
  },
);

const setBtnsShown = (b: boolean) => {
  btnsShown = b;

  hook(!btnsShown);
  setIntervals();

  redraw();
};

const drawInfo = (force?: true) => {
  let { y, x, w } = Bangle.appRect;
  const mid = x + w / 2
  let drawn = false;

  if (!force && !bar && !gps && !hrm && !mag)
    return;

  g.reset()
    .clearRect(Bangle.appRect)
    .setFont(infoFont)
    .setFontAlign(0, -1);

  if (bar) {
    g.drawString(`${bar.altitude.toFixed(1)}m`, mid, y);
    y += g.getFontHeight();

    g.drawString(`${bar.pressure.toFixed(1)} hPa`, mid, y);
    y += g.getFontHeight();

    g.drawString(`${bar.temperature.toFixed(1)}C`, mid, y);
    y += g.getFontHeight();

    drawn = true;
  }

  if (gps) {
    g.drawString(
      `${gps.lat.toFixed(4)} lat, ${gps.lon.toFixed(4)} lon`,
      mid,
      y,
    );
    y += g.getFontHeight();

    g.drawString(
      `${gps.alt}m (${gps.satellites} sat)`,
      mid,
      y,
    );
    y += g.getFontHeight();

    drawn = true;
  }

  if (hrm) {
    g.drawString(`${hrm.bpm} BPM (${hrm.confidence}%)`, mid, y);
    y += g.getFontHeight();

    drawn = true;
  } else if (hrmAny) {
    g.drawString(`~${hrmAny.bpm} BPM (${hrmAny.confidence}%)`, mid, y);
    y += g.getFontHeight();

    drawn = true;

    if (!settings.hrm && !hrmAnyClear) {
        // hrm is erased, but hrmAny will remain until cleared (or reset)
        // if it runs via health check, we reset it here
        hrmAnyClear = setTimeout(() => {
            hrmAny = undefined;
            hrmAnyClear = undefined;
        }, 10000);
    }
  }

  if (mag) {
    g.drawString(
      `${mag.x} ${mag.y} ${mag.z}`,
      mid,
      y
    );
    y += g.getFontHeight();

    g.drawString(
      `heading: ${mag.heading.toFixed(1)}`,
      mid,
      y
    );
    y += g.getFontHeight();

    drawn = true;
  }

  if (!drawn) {
    if (!force || Object.values(settings).every((x: boolean) => !x)) {
      g.drawString(`swipe to enable`, mid, y);
    } else {
      g.drawString(`events pending`, mid, y);
    }
    y += g.getFontHeight();
  }
};

const onTap = (/* _: { ... } */) => {
  setBtnsShown(true);
};

const redraw = () => {
  if (btnsShown) {
    if (!prevBtnsShown) {
      prevBtnsShown = btnsShown;

      Bangle.removeListener("swipe", onTap);

      btnLayout.setUI();
      btnLayout.forgetLazyState();
      g.clearRect(Bangle.appRect); // in case btnLayout isn't full screen
    }

    btnLayout.render();
  } else {
    if (prevBtnsShown) {
      prevBtnsShown = btnsShown;

      Bangle.setUI(); // remove all existing input handlers
      Bangle.on("swipe", onTap);

      drawInfo(true);
    } else {
      drawInfo();
    }
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
  toByteArray(Math.round(data.pressure * 10), 4, false);
encodePressure.maxLen = 4;

const encodeElevation: LenFunc<PressureData> = (data: PressureData) =>
  toByteArray(Math.round(data.altitude * 100), 3, true);
encodeElevation.maxLen = 3;

const encodeTemp: LenFunc<PressureData> = (data: PressureData) =>
  toByteArray(Math.round(data.temperature * 10), 2, true);
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
      0b10011101, // speed, location, elevation, heading [...]
      0b00000010, // position ok, 3d speed/distance
      speed[0]!, speed[1]!,
      lat[0]!, lat[1]!, lat[2]!, lat[3]!,
      lon[0]!, lon[1]!, lon[2]!, lon[3]!,
      elevation[0]!, elevation[1]!, elevation[2]!,
      heading[0]!, heading[1]!
  ];
};
encodeGps.maxLen = 17;

const encodeGpsHeadingOnly: LenFunc<CompassData> = (data: CompassData) => {
  // see encodeGps()
  const heading = toByteArray(Math.round(data.heading * 100), 2, false);

  return [
      0b00010000, // heading present
      0b00010000, // heading source: mag
      heading[0]!, heading[1]!
  ];
};
encodeGpsHeadingOnly.maxLen = 17;

const encodeMag: LenFunc<CompassData> = (data: CompassData) => {
  const x = toByteArray(data.x, 2, true);
  const y = toByteArray(data.y, 2, true);
  const z = toByteArray(data.z, 2, true);

  return [ x[0]!, x[1]!, y[0]!, y[1]!, z[0]!, z[1]! ];
};
encodeMag.maxLen = 6;

const encodeAcc: LenFunc<AccelData> = (data: AccelData) => {
  const x = toByteArray(data.x * 1000, 2, true);
  const y = toByteArray(data.y * 1000, 2, true);
  const z = toByteArray(data.z * 1000, 2, true);

  return [ x[0]!, x[1]!, y[0]!, y[1]!, z[0]!, z[1]! ];
};
encodeAcc.maxLen = 6;

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
  Bangle.setBarometerPower(settings.bar, "btadv");
  if (!settings.bar)
    bar = undefined;

  Bangle.setGPSPower(settings.gps, "btadv");
  if (!settings.gps)
    gps = undefined;

  Bangle.setHRMPower(settings.hrm, "btadv");
  if (!settings.hrm)
    hrm = hrmAny = undefined;

  Bangle.setCompassPower(settings.mag, "btadv");
  if (!settings.mag)
    mag = undefined;
};

// ----------------------------

const haveServiceData = (serv: BleServ): boolean => {
  switch (serv) {
    case BleServ.HRM: return !!hrm;
    case BleServ.EnvSensing: return !!(bar || mag);
    case BleServ.LocationAndNavigation: return !!(gps && gps.lat && gps.lon || mag);
    case BleServ.Acc: return !!acc;
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
        const os: BleCharAdvert = {
          maxLen: 1,
          readable: true,
          notify: true,
        };

        if (hrm) {
          o.value = encodeHrm(hrm);
          os.value = [SensorLocations.Wrist];
          hrm = undefined;
        }

        return {
          [BleChar.HRM]: o,
          [BleChar.SensorLocation]: os,
        };
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
          gps = undefined;
        }

        return { [BleChar.LocationAndSpeed]: o };
      } else if (mag) {
        const o: BleCharAdvert = {
          maxLen: encodeGpsHeadingOnly.maxLen,
          readable: true,
          notify: true,
          value: encodeGpsHeadingOnly(mag),
        };

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
            bar = undefined;
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

    case BleServ.Acc: {
      const o: BleServAdvert = {};

      if (acc || initial) {
          o[BleChar.Acc] = {
            maxLen: encodeAcc.maxLen,
            readable: true,
            notify: true,
          };

          if (acc) {
            o[BleChar.Acc]!.value = encodeAcc(acc);
            acc = undefined;
          }
      }

      return o;
    }
  }
};

const getBleAdvert = <T>(map: (s: BleServ) => T, all = false) => {
  const advert: { [key in BleServ]?: T } = {};

  for (const serv of services) {
    if (all || haveServiceData(serv)) {
      advert[serv] = map(serv);
    }
  }

  // clear mag only after both EnvSensing and LocationAndNavigation have run
  mag = undefined;

  return advert;
};

// done via advertise in setServices()
//const updateBleAdvert = () => {
//  require("ble_advert").set(...)
//
//  let bleAdvert: ReturnType<typeof getBleAdvert<undefined>>;
//
//  if (!(bleAdvert = (Bangle as any).bleAdvert)) {
//    bleAdvert = getBleAdvert(_ => undefined);
//
//    (Bangle as any).bleAdvert = bleAdvert;
//  }
//
//  try {
//    NRF.setAdvertising(bleAdvert);
//  } catch (e) {
//    console.log("couldn't setAdvertising():", e);
//  }
//};

const updateServices = () => {
  const newAdvert = getBleAdvert(serviceToAdvert);

  NRF.updateServices(newAdvert);
};

const onAccel = (newAcc: NonNull<typeof acc>) => acc = newAcc;
const onPressure = (newBar: NonNull<typeof bar>) => bar = newBar;
const onGPS = (newGps: NonNull<typeof gps>) => gps = newGps;
const onHRM = (newHrm: NonNull<typeof hrm>) => {
    if (newHrm.confidence >= HRM_MIN_CONFIDENCE)
        hrm = newHrm;
    hrmAny = newHrm;
};
const onMag = (newMag: NonNull<typeof mag>) => mag = newMag;

const hook = (enable: boolean) => {
  // need to disable for perf reasons, when buttons are shown
  if (enable) {
    Bangle.on("accel", onAccel);
    Bangle.on("pressure", onPressure);
    Bangle.on("GPS", onGPS);
    Bangle.on("HRM", onHRM);
    Bangle.on("mag", onMag);
  } else {
    Bangle.removeListener("accel", onAccel);
    Bangle.removeListener("pressure", onPressure);
    Bangle.removeListener("GPS", onGPS);
    Bangle.removeListener("HRM", onHRM);
    Bangle.removeListener("mag", onMag);
  }
}

// --- intervals ---

const setIntervals = (
  locked: ShortBoolean = Bangle.isLocked(),
  connected: boolean = NRF.getSecurityStatus().connected,
) => {
  changeInterval(
    redrawInterval,
    locked ? Intervals.UI_INFO_SLEEP : Intervals.UI_INFO,
  );

  if (connected) {
    const interval = btnsShown ? Intervals.BLE_BACKGROUND : Intervals.BLE;

    if (bleInterval) {
      changeInterval(bleInterval, interval);
    } else {
      bleInterval = setInterval(updateServices, interval);
    }
  } else if (bleInterval) {
    clearInterval(bleInterval);
    bleInterval = undefined;
  }
};

const redrawInterval = setInterval(redraw, /*replaced*/1000);
Bangle.on("lock", locked => setIntervals(locked));

let bleInterval: undefined | IntervalId;
NRF.on("connect", () => setIntervals(undefined, true));
NRF.on("disconnect", () => setIntervals(undefined, false));

setIntervals();

// turn things on
setBtnsShown(true);
enableSensors();

// set services/advert once at startup:
{
  // must have fixed services from the start:
  const ad = getBleAdvert(serv => serviceToAdvert(serv, true), /*all*/true);

  NRF.setServices(
    ad,
    {
      uart: false,
    },
  );

  for(const id in ad){
    const serv = ad[id as BleServ];
    let value;

    // pick the first characteristic to advertise
    for(const ch in serv){
      value = serv[ch as BleChar]!.value;
      break;
    }

    require("ble_advert").set(id, value || []);
  }
}
}
