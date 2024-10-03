declare module Sched {
  const enum Dow {
    SUN = 1,
    MON = 2,
    TUE = 4,
    WED = 8,
    THU = 16,
    FRI = 32,
    SAT = 64,
  }

  type Dows = number;
  type Milliseconds = number;

  // slight hack - all objects have a `on()`, this unions with that type so we can add it to an object
  type OnBoolean<T extends boolean = boolean>
    = T | Object["on"];

  type VibratePattern = string; // "." | "," | "-" | ":" | ";" | "="

  type DateString = `${number}-${number}-${number}`;

  type NewSched = {
    msg?: string,
    appid?: string,
    dow?: Dows,
    on?: OnBoolean<false>,
    js?: string,
  } & (NewTimer | NewAlarm);

  type NewTimer = { timer: number };
  type NewAlarm = { t: number, date?: DateString };

  type DefaultSched = {
    on: OnBoolean<true>,
    del: boolean,
    rp: false,
    as: false,
    dow: Dows,
    last: number,
    vibrate: VibratePattern,
  };

  type DefaultAlarm = DefaultSched & { t: number };

  type DefaultTimer = DefaultSched & { timer: number };

  type Sched = {
    // from NewSched / set in setAlarm()
    msg: string,
    appid?: string,
    dow: Dows,
    on: OnBoolean,
    timer?: Milliseconds, // this is a timer

    // setAlarm adds:
    id: string,
    t: Milliseconds, // time of day since midnight (in ms)

    // optional NewSched
    vibrate?: VibratePattern,
    hidden?: boolean,
    as?: boolean, // auto snooze
    del?: boolean,
    js?: string,
    data?: unknown,

    // set by sched
    last?: number,
  } & (
    {
      date: DateString,
      rp?: Repeat,
    } | {
      date: undefined,
      rp: boolean,
    }
  );

  type Timer = Sched & { timer: Milliseconds };

  type Repeat = {
    num: number,
    interval: "day" | "week" | "month" | "year",
  };

  type SchedSettings = {
    unlockAtBuzz: boolean,
    defaultSnoozeMillis: number,
    defaultAutoSnooze: boolean,
    defaultDeleteExpiredTimers: boolean,
    buzzCount: number | null, // null means buzz forever
    buzzIntervalMillis: number,
    defaultAlarmPattern: string,
    defaultTimerPattern: string,
  };

  function getAlarms(): Sched[];

  function setAlarms(alarms: readonly Sched[]): void;

  function getAlarm(id: string): Sched | undefined;

  function getActiveAlarms(alarms: Sched[], time?: Date): Sched[];

  function setAlarm(id: string, alarm?: NewSched): void;

  function resetTimer(alarm: Timer, time?: Date): void;

  function getTimeToAlarm(alarm: Sched | undefined | null, time?: Date): number | undefined;
  function getTimeToAlarm(alarm?: undefined | null, time?: Date): undefined;

  function reload(): void;

  function newDefaultAlarm(): DefaultAlarm;

  function newDefaultTimer(): DefaultTimer;

  function getSettings(): SchedSettings;

  function setSettings(settings: SchedSettings): void;
}
