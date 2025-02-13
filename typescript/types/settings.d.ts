type Settings = {
	beep: boolean,
	vibrate: boolean,
	quiet: number,

	ble: boolean,
	blerepl: boolean,
	bleprivacy?: NRFSecurityStatus["privacy"],
	blename?: boolean,
	HID?: false | "kbmedia" | "kb" | "com" | "joy",

	passkey?: string,
	whitelist_disabled?: boolean,
	whitelist: string[],

	theme: Theme,

	brightness: number,
	timeout: number,
	rotate: number,

	options: SettingsOptions,

	timezone: number,
	log: number,

	clock: string,
	clockHasWidgets: boolean,
	launcher: string,
};

type SettingsTheme = {
	fg: string,
	bg: string,
	fg2: string,
	bg2: string,
	fgH: string,
	bgH: string,
	dark: boolean,
};

type SettingsOptions = {
	wakeOnBTN1: boolean,
	wakeOnBTN2: boolean,
	wakeOnBTN3: boolean,
	wakeOnFaceUp: boolean,
	wakeOnTouch: boolean,

	wakeOnTwist: boolean,
	twistThreshold: number,
	twistMaxY: number,
	twistTimeout: number,
};
