type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type ExtractIds<T extends Layout.Hierarchy, Depth extends Prev[number] = 9> =
	[Depth] extends [never]
	? never
	: (T extends { id: infer Id extends string } ? Id : never)
	|
	(
		T extends { c: Array<infer Sub extends Layout.Hierarchy> }
		? ExtractIds<Sub, Prev[Depth]>
		: never
	);

declare module Layout {
	type Layouter<T extends Hierarchy> =
		{
			[k in ExtractIds<T>]: number;
		} & {
			// these actually change T
			render(l?: T): void;
			layout(l: T): void;

			debug(l?: T, c?: ColorResolvable): void;
			update(): void; // changes layoutObject into a RenderedHierarchy
			clear(obj?: T): void;

			forgetLazyState(): void;

			setUI(): void;
		};

	var Layout: {
		new <T extends Hierarchy>(
			hier: T,
			options?: {
				lazy: boolean,
				btns: {
					label: string,
					cb: () => void,
					cbl: () => void,
				}[],
				back: () => void,
				remove: () => void,
			},
		): Layouter<T>;
	};

	export type Layout = typeof Layout;

	type Image = string;

	type Fill = 0 | 1 | 2; // 0=no, 1=yes, 2=2x more space

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
			col: ColorResolvable,
			bgCol: ColorResolvable,
			pad: number,
			fillx: Fill,
			filly: Fill,
			width?: number,
			height?: number,
		} & (
			{
				r?: number, // 0: 0°, 1: 90°, 2: 180°, 3: 270°.
			} | {
				wrap?: boolean,
			}
		);

	type Align = -1 | 0 | 1;

	type HierarchyParts =
		{
			type: "v",
			c: Hierarchy[],
			halign: Align,
		} | {
			type: "h"
			c: Hierarchy[],
			valign: Align,
		} | {
			type: "txt",
			label: string,
			font: FontNameWithScaleFactor,
		} | {
			type: undefined,
		} | (
			{
				type: "btn",
				src: Image,
				cb: () => void,
			} | {
				type: "btn",
				cb: () => void,
				label: string,
				font: FontNameWithScaleFactor,
				scale: number,
			}
		) | {
			type: "img",
			src: Image | (() => Image),
		} | {
			type: "custom",
			render: (h: Hierarchy) => void,
		};
}
