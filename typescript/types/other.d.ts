// Bangle.js globals
declare const g: Graphics;

type WidgetArea = "tl" | "tr" | "bl" | "br";
type Widget = {
  area: WidgetArea;
  width: number;
  draw: (this: { x: number; y: number }) => void;
};
declare const WIDGETS: { [key: string]: Widget };

// Required for TypeScript to work properly
interface NewableFunction extends Function {}
interface CallableFunction extends Function {}
interface IArguments {
  [index: number]: any;
  length: number;
  callee: Function;
}

// Helper type
type Exclude<T, U> = T extends U ? never : T;
