/*~ This file declares the Graphics class.
 *~ Reference: https://banglejs.com/reference#Graphics
 */

type Image = {
  width: number;
  height: number;
  buffer: ArrayBuffer | string;
  bpp?: number;
  transparent?: number;
  palette?: Uint16Array;
};

type Theme = {
  fg: number;
  bg: number;
  fg2: number;
  bg2: number;
  fgH: number;
  bgH: number;
  dark: boolean;
};

type Layer = {
  x: number;
  y: number;
  image: string | Image | ArrayBuffer;
  scale?: number;
  rotate?: number;
  center?: boolean;
  repeat?: boolean;
  nobounds?: boolean;
};

type GraphicsApi = {
  asBMP: () => string | undefined;

  asImage: ((type: "object" | undefined) => object) &
    ((type: "string") => string);

  asURL: () => string | undefined;

  blit: (options: {
    x1: number;
    y1: number;
    w: number;
    h: number;
    x2: number;
    y2: number;
    setModified?: boolean;
  }) => GraphicsApi;

  buffer: ArrayBuffer;

  clear: (reset?: boolean) => GraphicsApi;

  clearRect: ((x1: number, y1: number, x2: number, y2: number) => GraphicsApi) &
    ((options: {
      x: number;
      y: number;
      x2: number;
      y2: number;
    }) => GraphicsApi) &
    ((options: { x: number; y: number; w: number; h: number }) => GraphicsApi);

  createArrayBuffer: (
    width: number,
    height: number,
    bpp: number,
    options?: {
      zigzag?: boolean;
      vertical_byte?: boolean;
      msb?: boolean;
      interleavex?: boolean;
      color_order?: "rgb" | "rbg" | "grb" | "gbr" | "brg" | "bgr";
    }
  ) => GraphicsApi;

  createCallback: (
    width: number,
    height: number,
    bpp: number,
    callback: ((x: number, y: number, colour: number) => void) & {
      setPixel: (x: number, y: number, colour: number) => void;
      fillRect: (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        colour: number
      ) => void;
    }
  ) => GraphicsApi;

  createImage: (str: string) => Image;

  drawCircle: (x: number, y: number, radius: number) => GraphicsApi;

  drawCircleAA: (x: number, y: number, radius: number) => GraphicsApi;

  drawEllipse: (x1: number, y1: number, x2: number, y2: number) => GraphicsApi;

  drawImage: (
    image: string | Image | ArrayBuffer,
    xOffset: number,
    yOffset: number,
    options?: {
      rotate?: number;
      scale?: number;
      frame?: number;
    }
  ) => GraphicsApi;

  drawImages: (
    layers: [Layer?, Layer?, Layer?],
    options?: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) => GraphicsApi;

  drawLine: (x1: number, y1: number, x2: number, y2: number) => GraphicsApi;

  drawLineAA: (x1: number, y1: number, x2: number, y2: number) => GraphicsApi;

  // TODO: Somehow define that poly must have an even number of items
  drawPoly: (poly: number[], closed?: boolean) => GraphicsApi;

  drawPolyAA: (poly: number[], closed?: boolean) => GraphicsApi;

  drawRect: (x1: number, y1: number, x2: number, y2: number) => GraphicsApi;

  drawString: (
    str: string | number | boolean,
    x: number,
    y: number,
    solid?: boolean
  ) => GraphicsApi;

  dump: () => void;

  fillCircle: (x: number, y: number, radius: number) => GraphicsApi;

  fillEllipse: (x1: number, y1: number, x2: number, y2: number) => GraphicsApi;

  fillPoly: (poly: number[], closed?: boolean) => GraphicsApi;

  fillPolyAA: (poly: number[], closed?: boolean) => GraphicsApi;

  fillRect: (x1: number, y1: number, x2: number, y2: number) => GraphicsApi;

  flip: (all?: boolean) => GraphicsApi;

  getBgColor: () => number;

  getBPP: () => number;

  getColor: () => number;

  getFont: () => string;

  getFontHeight: () => number;

  getFonts: () => string[];

  getHeight: () => number;

  getInstance: () => GraphicsApi | undefined;

  getModified: (
    reset?: boolean
  ) => { x1: number; y1: number; x2: number; y2: number } | undefined;

  getPixel: (x: number, y: number) => number;

  getWidth: () => number;

  imageMetrics: (image: string | GraphicsApi | Image | ArrayBuffer) =>
    | {
        width: number;
        height: number;
        bpp: number;
        transparent: number;
      }
    | undefined;

  lineTo: (x: number, y: number) => GraphicsApi;

  moveTo: (x: number, y: number) => GraphicsApi;

  quadraticBezier: (
    vertices: [
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ],
    points?: number
  ) => number[];

  reset: () => GraphicsApi;

  scroll: (x: number, y: number) => GraphicsApi;

  setBgColor: ((color: string) => GraphicsApi) &
    ((color: number) => GraphicsApi) &
    ((r: number, g: number, b: number) => GraphicsApi);

  setClipRect: (x1: number, y1: number, x2: number, y2: number) => GraphicsApi;

  setColor: ((color: string) => GraphicsApi) &
    ((color: number) => GraphicsApi) &
    ((r: number, g: number, b: number) => GraphicsApi);

  setFont: (name?: string, size?: number) => GraphicsApi;

  setFontAlign: (
    x: -1 | 0 | 1,
    y: -1 | 0 | 1,
    rotation?: 0 | 1 | 2 | 3
  ) => GraphicsApi;

  setFontBitmap: () => GraphicsApi;

  setFontCustom: (
    bitmap: ArrayBuffer,
    firstChar: number,
    width: number | string,
    height: number
  ) => GraphicsApi;

  setFontVector: (size: number) => GraphicsApi;

  setPixel: (
    x: number,
    y: number,
    colour: number | string | undefined
  ) => GraphicsApi;

  setRotation: (rotation: 0 | 1 | 2 | 3, reflect?: boolean) => GraphicsApi;

  setTheme: (theme: Theme) => GraphicsApi;

  stringMetrics: (str: string) => { width: number; height: number };

  stringWidth: (str: string) => number;

  theme: Theme;

  toColor: ((color: string) => number) &
    ((color: number) => number) &
    ((r: number, g: number, b: number) => number);

  transformVertices: (
    verts: number[],
    transformation:
      | { x?: number; y?: number; scale?: number; rotate?: number }
      | [number, number, number, number, number, number] // 2D transformation matrix
  ) => number[];

  wrapString: (str: string, maxWidth: number) => string[];
};
