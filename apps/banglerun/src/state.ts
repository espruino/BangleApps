enum ActivityStatus {
  Stopped = 'STOP',
  Paused = 'PAUSE',
  Running = 'RUN',
}

interface AppState {
  // GPS NMEA data
  fix: number;
  lat: number;
  lon: number;
  alt: number;
  vel: number;
  dop: number;
  gpsValid: boolean;

  // Absolute position data
  x: number;
  y: number;
  z: number;
  // Last fix time
  t: number;
  // Last time we saved log info
  timeSinceLog : number;

  // HRM data
  hr: number,
  hrError: number,

  // Logger data
  file: File;
  fileWritten: boolean;

  // Drawing data
  drawing: boolean;

  // Activity data
  status: ActivityStatus;
  duration: number;
  distance: number;
  speed: number;
  steps: number;
  cadence: number;
}

interface File {
  read: Function;
  write: Function;
  erase: Function;
}

function initState(): AppState {
  return {
    fix: NaN,
    lat: NaN,
    lon: NaN,
    alt: NaN,
    vel: NaN,
    dop: NaN,
    gpsValid: false,

    x: NaN,
    y: NaN,
    z: NaN,
    t: NaN,
    timeSinceLog : 0,

    hr: 60,
    hrError: 100,

    file: null,
    fileWritten: false,

    drawing: false,

    status: ActivityStatus.Stopped,
    duration: 0,
    distance: 0,
    speed: 0,
    steps: 0,
    cadence: 0,
  }
}

export { ActivityStatus, AppState, File, initState };
