declare const g: Graphics;

type WidgetArea = "tl" | "tr" | "bl" | "br";
type Widget = {
  area: WidgetArea;
  width: number;
  draw: (this: { x: number; y: number }) => void;
};
declare const WIDGETS: { [key: string]: Widget };
