// TODO:
// [ ] fix format of EnvSensing data
// [-] handle NaNs in data
// [x] fix sending of HRM / changing service?
// [.] fix menu scrolling/jumping
// [.] fix resetting to accel menu

const Layout = require("Layout") as Layout_.Layout;

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
let btnsShown = false;
let prevBtnsShown: boolean | undefined = undefined;

type BtAdvType<IncludeAcc = false> = "bar" | "gps" | "hrm" | "mag" | (IncludeAcc extends true ? "acc" : never);
type BtAdvMap<T, IncludeAcc = false> = { [key in BtAdvType<IncludeAcc>]: T };

const settings: BtAdvMap<boolean> = {
  bar: false,
  gps: false,
  hrm: false,
  mag: false,
};

const idToName: BtAdvMap<string, true> = {
  acc: "Acceleration",
  bar: "Barometer",
  gps: "GPS",
  hrm: "HRM",
  mag: "Magnetometer",
};

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
            label: idToName.acc,
            id: "acc",
            cb: () => {},
            ...btnStyle,
            col: colour.on,
            btnBorder: colour.on,
          },
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
  g.clearRect(Bangle.appRect);
  redraw();
};

const infoFont: FontNameWithScaleFactor = "6x8:2";
const infoCommon = {
  type: "txt",
  label: "",
  font: infoFont,
  pad: 5,
} as const;

const infoLayout = new Layout(
  {
    type: "v",
    c: [
      {
        type: "h",
        c: [
          { id: "bar_alti", ...infoCommon },
          { id: "bar_pres", ...infoCommon },
          { id: "bar_temp", ...infoCommon },
        ]
      },
      {
        type: "h",
        c: [
          { id: "gps_lat", ...infoCommon },
          { id: "gps_lon", ...infoCommon },
          { id: "gps_altitude", ...infoCommon },
          { id: "gps_satellites", ...infoCommon },
          { id: "gps_hdop", ...infoCommon },
        ]
      },
      {
        type: "h",
        c: [
          { id: "hrm_bpm", ...infoCommon },
          { id: "hrm_confidence", ...infoCommon },
        ]
      },
      {
        type: "h",
        c: [
          { id: "mag_x", ...infoCommon },
          { id: "mag_y", ...infoCommon },
          { id: "mag_z", ...infoCommon },
          { id: "mag_heading", ...infoCommon },
        ]
      },
      {
        type: "btn",
        label: "Set",
        cb: () => {
          setBtnsShown(true);
        },
        ...btnStyle,
      },
    ]
  },
  {
    lazy: true,
    // back: () => (load as any)(),
  }
);

const showElem = (
  layout: Layout_.Hierarchy & { type: "txt" },
  s: string,
) => {
  layout.label = s;
  // delete layout.width; TODO?
  delete layout.height;
};

const hideElem = (layout: Layout_.Hierarchy) => {
  layout.height = 0;
};

const populateInfo = () => {
  if (bar) {
    showElem(infoLayout["bar_alti"]!, `${bar.altitude.toFixed(1)}m`);
    showElem(infoLayout["bar_pres"]!, `${bar.pressure.toFixed(1)}mbar`);
    showElem(infoLayout["bar_temp"]!, `${bar.temperature.toFixed(1)}C`);
  } else {
    hideElem(infoLayout["bar_alti"]!);
    hideElem(infoLayout["bar_pres"]!);
    hideElem(infoLayout["bar_temp"]!);
  }

  if (gps) {
    showElem(infoLayout["gps_lat"]!, gps.lat.toFixed(4));
    showElem(infoLayout["gps_lon"]!, gps.lon.toFixed(4));
    showElem(infoLayout["gps_altitude"]!, `${gps.alt}m`);
    showElem(infoLayout["gps_satellites"]!, `${gps.satellites}`);
    showElem(infoLayout["gps_hdop"]!, `${(gps.hdop * 5).toFixed(1)}m`);
  } else {
    hideElem(infoLayout["gps_lat"]!);
    hideElem(infoLayout["gps_lon"]!);
    hideElem(infoLayout["gps_altitude"]!);
    hideElem(infoLayout["gps_satellites"]!);
    hideElem(infoLayout["gps_hdop"]!);
  }

  if (hrm) {
    showElem(infoLayout["hrm_bpm"]!, `${hrm.bpm}`);
    showElem(infoLayout["hrm_confidence"]!, `${hrm.confidence}%`);
  } else {
    hideElem(infoLayout["hrm_bpm"]!);
    hideElem(infoLayout["hrm_confidence"]!);
  }

  if (mag) {
    showElem(infoLayout["mag_x"]!, `${mag.x}`);
    showElem(infoLayout["mag_y"]!, `${mag.y}`);
    showElem(infoLayout["mag_z"]!, `${mag.z}`);
    showElem(infoLayout["mag_heading"]!, mag.heading.toFixed(1));
  } else {
    hideElem(infoLayout["mag_x"]!);
    hideElem(infoLayout["mag_y"]!);
    hideElem(infoLayout["mag_z"]!);
    hideElem(infoLayout["mag_heading"]!);
  }
};

const redraw = () => {
  let layout;

  if (btnsShown) {
    layout = btnLayout;
  } else {
    populateInfo();
    infoLayout.update();

    layout = infoLayout;
  }

  if (btnsShown !== prevBtnsShown) {
    prevBtnsShown = btnsShown;
    layout.forgetLazyState();
    layout.setUI();
  }
  layout.render();
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
  Bangle.setBarometerPower(settings.bar, "btadv");
  if (!settings.bar)
    bar = undefined;

  Bangle.setGPSPower(settings.gps, "btadv");
  if (!settings.gps)
    gps = undefined;

  Bangle.setHRMPower(settings.hrm, "btadv");
  if (!settings.hrm)
    hrm = undefined;

  Bangle.setCompassPower(settings.mag, "btadv");
  if (!settings.mag)
    mag = undefined;

  console.log("enableSensors():", settings);
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

// show UI
Bangle.loadWidgets();
Bangle.drawWidgets();

setBtnsShown(true);

const redrawInterval = setInterval(redraw, Intervals.MENU_WAKE);
Bangle.on("lock", locked => {
  changeInterval(
    redrawInterval,
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

// setIntervals(NRF.getSecurityStatus().connected);
// NRF.on("connect", () => {
//   setIntervals(true);
// });
// NRF.on("disconnect", () => {
//   setIntervals(false);
// });
