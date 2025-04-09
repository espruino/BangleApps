type RecorderWidget = Widget & {
	isRecording(): boolean,

	setRecording(
		isOn: boolean,
		options?: { force?: "append" | "new" | "overwrite" },
	): Promise<boolean>;

	plotTrack(
		m: unknown /* osm module */,
		options?: {
			async: true,
			callback?: ()=>void,
		}
	): { stop(): void };
	plotTrack(
		m: unknown /* osm module */,
		options?: {
			async?: false,
			callback?: ()=>void,
		}
	): void;
};

type Recorders = {
	[key: string]: Recorder;
};

type Recorder = () => {
	name: string,
	fields: string[],
	getValues(): unknown[],
	start(): void,
	stop(): void,
	draw(x: number, y: number): void,
};
