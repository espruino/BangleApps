type Accel = {
  x: number;
  y: number;
  z: number;
  diff: number;
  td: number;
  mag: number;
};

type Mag = {
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
  heading: number;
};

type GPS = {
  lat: number;
  lon: number;
  alt: number;
  speed: number;
  course: number;
  time: Date;
  stallites: number;
  fix: number;
  hdop: number;
};

type HealthStatus = {
  movement: number;
  steps: number;
  bpm: number;
  bpmConfidence: number;
};

type BangleOptions = {
  wakeOnBTN1: boolean;
  wakeOnBTN2: boolean;
  wakeOnBTN3: boolean;
  wakeOnFaceUp: boolean;
  wakeOnTouch: boolean;
  wakeOnTwist: boolean;
  twistThreshold: number;
  twistMaxY: number;
  twistTimeout: number;
  gestureStartThresh: number;
  gestureEndThresh: number;
  gestureInactiveCount: number;
  gestureMinLength: number;
  powerSave: boolean;
  lockTimeout: number;
  lcdPowerTimeout: number;
  backlightTimeout: number;
  hrmPollInterval: number;
};

type Optional<T> = {
  [key in keyof T]?: T[key];
};

type LCDMode = "direct" | "doublebuffered" | "120x120" | "80x80";

declare const Bangle: {
  accelRd: ((register: any, length: number) => number[]) &
    ((register: any) => number);
  accelWr: (register: any, data: number[] | number) => void;
  appRect: {
    x: number;
    y: number;
    w: number;
    h: number;
    x2: number;
    y2: number;
  };
  beep: (time?: number, frequency?: number) => Promise<void>;
  buzz: (time?: number, strength?: number) => Promise<void>;
  compassRd: ((register: any, length: number) => number[]) &
    ((register: any) => number);
  compassWr: (register: any, data: number[] | number) => void;
  dbg: () => any;
  drawWidgets: () => void;
  F_BEEPSET: boolean;
  getAccel: () => Accel;
  getCompass: () => Mag;
  getGPSFix: () => GPS;
  getHealthStatus: (range?: "current" | "last" | "day") => HealthStatus;
  getLCDMode: () => LCDMode;
  getLogo: () => string;
  getOptions: () => BangleOptions;
  getStepCount: () => number;
  hrmRd: ((register: any, length: number) => number[]) &
    ((register: any) => number);
  ioWr: (mask: Pin, isOn: boolean) => void;
  isCharging: () => boolean;
  isCompassOn: () => boolean;
  isGPSOn: () => boolean;
  isHRMOn: () => boolean;
  isLCDOn: () => boolean;
  isLocked: () => boolean;
  lcdWr: (register: any, data: number[] | number) => void;
  loadWidgets: () => void;
  off: () => void;
  on: ((event: "accel", listener: (xyz: Accel) => void) => void) &
    ((
      event: "aiGesture",
      listener: (
        gesture: string | number | undefined,
        weights: number[]
      ) => void
    ) => void) &
    ((event: "charging", listener: (charging: boolean) => void) => void) &
    ((
      event: "drag",
      listener: (event: {
        x: number;
        y: number;
        dx: number;
        dy: number;
        b: number;
      }) => void
    ) => void) &
    ((event: "faceUp", listener: (up: boolean) => void) => void) &
    ((event: "gesture", listener: (xyz: Int8Array) => void) => void) &
    ((event: "GPS", listener: (gps: GPS) => void) => void) &
    ((
      event: "GPS-raw",
      listener: (nmea: string, dataLoss: boolean) => void
    ) => void) &
    ((event: "health", listener: (info: HealthStatus) => void) => void) &
    ((
      event: "HRM",
      listener: (hrm: {
        bpm: number;
        confidence: number;
        raw: Uint8Array;
      }) => void
    ) => void) &
    ((
      event: "HRM-raw",
      listener: (hrm: {
        raw: number;
        filt: number;
        bpm: number;
        confidence: number;
      }) => void
    ) => void) &
    ((event: "lcdPower", listener: (on: boolean) => void) => void) &
    ((event: "lock", listener: (on: boolean) => void) => void) &
    ((event: "mag", listener: (mag: Mag) => void) => void) &
    ((event: "midnight", listener: () => void) => void) &
    ((
      event: "pressure",
      listener: (info: {
        temperature: number;
        pressure: number;
        altitude: number;
      }) => void
    ) => void) &
    ((event: "step", listener: (up: number) => void) => void) &
    ((event: "swipe", listener: (direction: number) => void) => void) &
    ((
      event: "tap",
      listener: (data: {
        dir: string;
        double: boolean;
        x: number;
        y: number;
        z: number;
      }) => void
    ) => void) &
    ((
      event: "touch",
      listener: (button: number, xy: { x: number; y: number }) => void
    ) => void) &
    ((event: "twist", listener: () => void) => void);
  project: (latlon: { lat: number; lon: number }) => { x: number; y: number };
  resetCompass: () => void;
  setCompassPower: (isOn: boolean, appID: string) => boolean;
  setGPSPower: (isOn: boolean, appID: string) => boolean;
  setHRMPower: (isOn: boolean, appID: string) => boolean;
  setLCDBrightness: (brightness: number) => void;
  setLCDMode: (mode?: LCDMode) => void;
  setLCDOffset: (y: number) => void;
  setLCDPower: (isOn: boolean, appID: string) => boolean;
  setLCDTimeout: (timeout: number) => void;
  setLocked: (isLocked: boolean) => void;
  setOptions: (options: Optional<BangleOptions>) => void;
  setPollInterval: (timeout: number) => void;
  setStepCount: (timeout: number) => void;
  setUI: (
    type?:
      | "updown"
      | "leftright"
      | "clock"
      | "clockupdown"
      | {
          mode: "custom";
          back?: () => void;
          touch?: (n: number, e: number) => void;
          swipe?: (dir: number) => void;
          drag?: (e: number) => void;
          btn?: (n: number) => void;
        },
    callback?: (direction: number) => void
  ) => void;
  showLauncher: () => void;
  softOff: () => void;
};
