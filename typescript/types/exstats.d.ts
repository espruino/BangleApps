declare module ExStats {
	type StatsId = "time" | "dist" | "step" | "bpm" | "maxbpm" | "pacea" | "pacec" | "speed" | "caden" | "altg" | "altb";

	function getList(): { name: string, id: StatsId }[];

	function getStats<Ids extends StatsId>(
		ids: Ids[],
		options?: Options<Ids>
	): StatsInst<Ids>;

	type Options<Ids> = {
		paceLength?: number,
		notify?: NotifyInput<Ids>,
	};

	type Notify<Ids> = {
		[key in Ids & ("dist" | "step" | "time")]: {
			increment: number,
			next: number,
		}
	};

	type NotifyInput<Ids> = {
		[K in keyof Notify<Ids>]?:
			Omit<
				Notify<Ids>[K], "next"
			> & {
				next?: number,
			};
	};

	type StatsInst<Ids extends StatsId> = {
		stats: Stats<Ids>,
		state: State<Ids>,
		start(): void,
		stop(): void,
		resume(): void,
	};

	type State<Ids> = {
		notify: Notify<Ids>,

		active: boolean,
		duration: number,
		startTime: number,
		lastTime: number,

		BPM: number,
		BPMage: number,
		maxBPM: number,

		alt: number | undefined,
		alti: number,

		avrSpeed: number,
		curSpeed: number,
		distance: number,

		startSteps: number,
		lastSteps: number,
		stepHistory: Uint8Array,
		stepsPerMin: number,

		thisGPS: GPSFix | {},
		lastGPS: GPSFix | {},
	};

	type Stats<Ids extends StatsId> = {
		[key in Ids]: Stat
	};

	type Stat = {
		title: string,
		getValue(): number,
		getString(): string,
		id: StatsId,

		on(what: "changed", cb: (stat: Stat) => void): void;

		// emitted by dist|step|time
		on(what: "notify", cb: (stat: Stat) => void): void;
	};
}
