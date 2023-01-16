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
		show(): void,
		hide(): void,
		on(what: "redraw", cb: () => void): void, // extending from Object
		run?(): void,
	} & (
		{
			hasRange: true,
			get(): RangeItem,
		} | {
			hasRange: false,
			get(): Item,
		}
	);

	type Item = {
		text: string,
		short?: string,
		img?: string,
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
