/*~ These are the type declarations for Espruino on the Bangle.JS.
 *~ Reference: https://banglejs.com/reference
 */

/// <reference path="globals.d.ts" />
/// <reference path="bangle.d.ts" />
/// <reference path="espruino.d.ts" />
/// <reference path="graphics.d.ts" />
/// <reference path="i2c.d.ts" />
/// <reference path="serial.d.ts" />
/// <reference path="spi.d.ts" />
/// <reference path="storage.d.ts" />

declare const Graphics: GraphicsApi;
declare const g: GraphicsApi;

type WidgetArea = "tl" | "tr" | "bl" | "br";
type Widget = {
  area: WidgetArea;
  width: number;
  draw: (this: { x: number; y: number }) => void;
};

declare const WIDGETS: { [key: string]: Widget };

declare let exports: any;
