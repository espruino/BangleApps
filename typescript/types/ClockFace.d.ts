declare module ClockFace_ {
  export class ClockFace {
    constructor(options: Options | Draw);

    is12Hour: boolean;
    paused: boolean;
    showDate: boolean; // default true
    loadWidgets: boolean; // default true

    start(): void;

    tick(): void;
    pause(): void;
    resume(): void;
    remove(): void;
    redraw(): void;
  }

  type Options = {
    precision?: number, // seconds

    init?: () => void,

    pause?: () => void,
    resume?: () => void,
    remove?: () => void,

    settingsFile?: string,
  } & (
    {
      draw: Draw
    } | {
      update: Update,
    } | {
      draw: Draw,
      update: Update,
    }
  ) & (
    {
      up?: () => void,
      down?: () => void,
    } | {
      upDown?: (dir: -1 | 1) => void,
    }
  );

  type Draw = (d: Date, changed: Changed<true>) => void;
  type Update = (d: Date, changed: Changed) => void;

  type Changed<T extends boolean = boolean> = {
    d: T,
    h: T,
    m: T,
    s: T,
  }
}
