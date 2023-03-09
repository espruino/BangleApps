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

  type VibratePattern = "." | "," | "-" | ":" | ";" | "=";

  type Sched = {
    id?: string,
    appid?: string,
    on: boolean,
    dow?: number,
    msg: string,
    last: number,
    vibrate?: VibratePattern,
    hidden?: boolean,
    as?: boolean, // auto snooze
    del?: boolean,
    js?: string,
    data?: unknown,
  } & (
    {
      t: number, // time of day since midnight (in ms, set automatically when timer starts)
    } | {
      timer: number, // this is a timer - the time in ms
    }
  ) & (
    {
      date: `${number}-${number}-${number}`,
      rp?: Repeat,
    } | {
      date: undefined,
      rp: boolean,
    }
  );

  type Repeat = {
    num: number,
    interval: "day" | "week" | "month" | "year",
  };

  type SchedSettings = {
    unlockAtBuzz: boolean,
    defaultSnoozeMillis: number,
    defaultAutoSnooze: boolean,
    defaultDeleteExpiredTimers: boolean,
    buzzCount: number,
    buzzIntervalMillis: number,
    defaultAlarmPattern: string,
    defaultTimerPattern: string,
  };

  function getAlarms(): Sched[];

  function setAlarms(alarms: readonly Sched[]): void;

  function getAlarm(id: string): Sched | undefined;

  function getActiveAlarms (alarms: Sched[], time?: Date): Sched[];

  function setAlarm(id: string, alarm?: Sched): void;

  function getTimeToAlarm(alarm: Sched, time?: Date): number | undefined;
  function getTimeToAlarm(alarm?: undefined | null, time?: Date): undefined;

  function reload(): void;

  function newDefaultAlarm(): Sched;

  function newDefaultTimer(): Sched;

  function getSettings(): SchedSettings;

  function setSettings(settings: SchedSettings): void;
}
