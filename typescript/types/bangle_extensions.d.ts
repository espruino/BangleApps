type BangleHandler<T extends (...args: any[]) => any> = T | (T | undefined)[];

type BangleEvents = {
  ["#ontap"]?: BangleHandler<(data: { dir: "left" | "right" | "top" | "bottom" | "front" | "back", double: boolean, x: TapAxis, y: TapAxis, z: TapAxis }) => void>,
  ["#ongesture"]?: BangleHandler<(xyz: Int8Array) => void>,
  ["#onswipe"]?: BangleHandler<SwipeCallback>,
  ["#ontouch"]?: BangleHandler<TouchCallback>,
  ["#ondrag"]?: BangleHandler<DragCallback>,
  ["#onstroke"]?: BangleHandler<(event: { xy: Uint8Array, stroke?: string }) => void>,
};

declare var settings: {}; // settings is commonly used by apps, so declare it here to avoid overwriting it in boot/clkinfo/widgets/etc
