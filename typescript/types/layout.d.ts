type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type ExtractIds<T extends Layout.Hierarchy, Depth extends Prev[number] = 9> =
  [Depth] extends [never]
  ? never
  : (T extends { id?: infer Id extends string }
    ? {
      [k in Id]: {
        -readonly [P in keyof T]:
          T[P] extends string
            ? string
            : T[P] extends number
            ? number | undefined
            : T[P]
      }
    }
    : never)
  |
  (
    T extends { c: Array<infer Sub extends Layout.Hierarchy> }
    ? ExtractIds<Sub, Prev[Depth]>
    : never
  );

declare module Layout {
  type Layouter<T extends Hierarchy> =
    UnionToIntersection<ExtractIds<T>>
    &
    {
      // these actually change T
      render(l?: Hierarchy): void;
      layout(l: Hierarchy): void;

      debug(l?: Hierarchy, c?: ColorResolvable): void;
      update(): void; // changes layoutObject into a RenderedHierarchy
      clear(obj?: Hierarchy): void;

      forgetLazyState(): void;

      setUI(): void;
    };

  // Note: you must use new Layout({...} as const) to have ids inferred
  var Layout: {
    new <T extends Hierarchy>(
      hier: T,
      options?: {
        lazy: boolean,
        btns?: {
          label: string,
          cb: () => void,
          cbl: () => void,
        }[],
        back?: () => void,
        remove?: () => void,
      },
    ): Layouter<T>;
  };

  export type Layout = typeof Layout;

  type Image = string;

  type Fill = number; // fill a proportion of space, relative to sibling `filly`s

  type RenderedHierarchy =
    Hierarchy & {
      // top left position
      x: number,
      y: number,
      // width and height
      w: number,
      h: number,
      // minimum width and height
      _w: number,
      _h: number,
    };

  type Hierarchy =
    HierarchyParts & {
      id?: string,
      font?: FontNameWithScaleFactor,
      scale?: number,
      col?: ColorResolvable,
      bgCol?: ColorResolvable,
      pad?: number,
      fillx?: Fill,
      filly?: Fill,
      width?: number,
      height?: number,

      // technically only on children of a h/v
      halign?: Align, // children of a v
      valign?: Align, // children of a h
    } & (
      {
        r?: number, // 0: 0°, 1: 90°, 2: 180°, 3: 270°.
      } | {
        wrap?: boolean,
      }
    );

  const enum Align {
    Left = -1,
    Top = -1,
    Center = 0,
    Right = 1,
    Bottom = -1,
  }

  const enum Rotation {
    None = 0,
    Deg90 = 1,
    Deg180 = 2,
    Deg270 = 3,
  }

  type HierarchyParts =
    {
      type: "v",
      c: Hierarchy[],
    } | {
      type: "h"
      c: Hierarchy[],
    } | {
      type: "txt",
      label: string,
      font: FontNameWithScaleFactor,
    } | {
      type: undefined, // blank, for padding
    } | (
      {
        type: "btn",
        src: Image,
        cb: () => void,
        r?: Rotation,
        btnBorder?: ColorResolvable,
      } | {
        type: "btn",
        cb: () => void,
        label: string,
        font?: FontNameWithScaleFactor,
        scale?: number,
        r?: Rotation,
        btnBorder?: ColorResolvable,
      }
    ) | {
      type: "img",
      src: Image | (() => Image),
      r?: Rotation,
    } | {
      type: "custom",
      render: (this: RenderedHierarchy, h: RenderedHierarchy) => void,
    };
}
