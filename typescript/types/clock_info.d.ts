declare module ClockInfo {
  function load(): Menu[];
  function addInteractive(menu: Menu[], options: Options): InteractiveOptions;

  type Menu = {
    name: string,
    img: string,
    dynamic?: boolean,
    items: MenuItem[],
  };

  type MenuItem = {
    name: string,
    show(options: InteractiveOptions): void,
    hide(options: InteractiveOptions): void,
    on(what: "redraw", cb: () => void): void, // extending from Object
    run?(options: InteractiveOptions): void,
    focus?(options: InteractiveOptions): void | false,
    blur?(options: InteractiveOptions): void | false,
  } & (
    {
      hasRange: true,
      get(): RangeItem,
    } | {
      hasRange?: false,
      get(): Item,
    }
  );

  type Item = {
    text: string,
    short?: string,
    img?: Image,
  };

  type RangeItem =
    Item & {
      v: number,
      min: number,
      max: number,
    };

  type Options =  {
    x: number,
    y: number,
    w: number,
    h: number,
    draw(itm: MenuItem, info: Item, options: InteractiveOptions): void,
    app?: string, // used to remember clock_info locations, per app
  };

  type InteractiveOptions =
    Options & {
      index: number,
      menuA: number,
      menuB: number,
      remove(): void,
      redraw(): void,
      focus: boolean,
    };
}

interface BangleExt {
  CLKINFO_FOCUS?: number;
}
