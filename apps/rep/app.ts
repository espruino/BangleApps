type RepSettings = {
	record: boolean,
	recordStopOnExit: boolean,
	stepMs: number,
};

{
const L = require("Layout");

type StoreRep = {
	/// duration in ms
	dur: number,
	/// label of this rep
	label: string,
};

type Rep = StoreRep & {
	/// cumulative duration (ms)
	accDur: number,
};

const storeReps = require("Storage")
	.readJSON("rep.json") as Rep[] | undefined;

if(storeReps == null){
	E.showAlert("No reps in storage\nLoad them on with the app loader")
		.then(() => load());

	throw new Error("no storage");
}

const reps = storeReps.map((r: StoreRep, i: number, a: Rep[]): Rep => {
	const r2 = r as Rep;
	r2.accDur = i > 0
		? a[i-1]!.accDur + r.dur
		: r.dur;
	return r2;
});

const settings = (require("Storage").readJSON("rep.setting.json", true) || {}) as RepSettings;
settings.record ??= false;
settings.recordStopOnExit ??= false;
settings.stepMs ??= 5 * 1000;

const fontSzMain = 54;
const fontScaleRep = 2;
const fontSzRep = 20;
const fontSzRepDesc = 12;
const blue = "#205af7";
const ffStep = settings.stepMs;

let state: State | undefined;
let drawInterval: IntervalId | undefined;
let lastRepIndex: number | null = null;
let firstTime = true;

const renderDuration = (l: Layout.RenderedHierarchy) => {
	let lbl;

	g.clearRect(l.x, l.y, l.x+l.w, l.y+l.h);

	if(state){
		const [i, repElapsed] = state.currentRepPair();

		if(i !== null){
			let thisDur = reps[i]!.dur;

			const remaining = thisDur - repElapsed;
			lbl = msToMinSec(remaining);

			const fract = repElapsed / thisDur;
			g.setColor(blue)
				.fillRect(
					l.x,
					l.y,
					l.x + fract * l.w,
					l.y + l.h
				);
		}else{
			lbl = msToMinSec(repElapsed);
		}
	}else{
		lbl = "RDY";
	}

	if(l.font)
		g.setFont(l.font); // don't chain - might be undefined

	g.setColor(l.col || g.theme.fg)
		.setFontAlign(0, 0)
		.drawString(
			lbl,
			l.x+(l.w>>1),
			l.y+(l.h>>1)
		);
};

const layout = new L({
	type: "v",
	c: [
		{
			type: "h",
			c: [
				{
					id: "duration",
					lazyBuster: 1,
					type: "custom",
					font: `Vector:${fontSzMain}` as FontNameWithScaleFactor,
					fillx: 1,
					filly: 1,
					render: renderDuration,
				},
				{
					id: "repIdx",
					type: "txt",
					font: `6x8:${fontScaleRep}`,
					label: "---",
					r: Layout.Rotation.Deg90,
				},
			]
		},
		{
			type: "txt",
			font: `Vector:${fontSzRepDesc}`,
			label: "Activity / Duration",
		},
		{
			id: "cur_name",
			type: "txt",
			font: `Vector:${fontSzRep}`,
			label: "",
			col: blue,
			//pad: 4,
			fillx: 1,
		},
		{
			type: "txt",
			font: `Vector:${fontSzRepDesc}`,
			label: "Next / Duration",
		},
		{
			id: "next_name",
			type: "txt",
			font: `Vector:${fontSzRep}`,
			label: "",
			//pad: 4,
			fillx: 1,
		},
		{
			type: "h",
			c: [
				{
					id: "prev",
					type: "btn",
					label: "<<",
					fillx: 1,
					cb: () => {
						buzzInteraction();
						state?.rewind();
						drawRep();
					},
				},
				{
					id: "play",
					type: "btn",
					label: "Play",
					fillx: 1,
					cb: () => {
						buzzInteraction();
						if(!state)
							state = new State();

						state.toggle();

						if(state.paused){
							clearInterval(drawInterval!);
							drawInterval = undefined;
						}else{
							drawInterval = setInterval(drawRep, 1000);
						}

						drawRep();
					},
				},
				{
					id: "next",
					type: "btn",
					label: ">>",
					fillx: 1,
					cb: () => {
						buzzInteraction();
						state?.forward();
						drawRep();
					},
				}
			]
		}
	]
} as const, {lazy: true});

class State {
	paused: boolean = true;
	begin: number = Date.now(); // only valid if !paused
	accumulated: number = 0;

	toggle() {
		if(this.paused){
			this.begin = Date.now();
		}else{
			const diff = Date.now() - this.begin;
			this.accumulated += diff;
		}

		this.paused = !this.paused;
	}

	getElapsedTotal() {
		return (this.paused ? 0 : Date.now() - this.begin) + this.accumulated;
	}

	getElapsedForRep() {
		return this.currentRepPair()[1];
	}

	currentRepPair(): [number | null, number] {
		const elapsed = this.getElapsedTotal();
		const i = this.currentRepIndex();
		const repElapsed = elapsed - (i! > 0 ? reps[i!-1]!.accDur : 0);

		return [i, repElapsed];
	}

	currentRepIndex() {
		const elapsed = this.getElapsedTotal();
		let ent;
		for(let i = 0; (ent = reps[i]); i++)
			if(elapsed < ent.accDur)
				return i;
		return null;
	}

	forward() {
		this.accumulated += ffStep;
	}

	rewind() {
		this.accumulated -= ffStep;
	}
}

const repToLabel = (i: number, id: "cur" | "next") => {
	const rep = reps[i];
	if(rep)
		layout[`${id}_name`]!.label = `${rep.label} / ${msToMinSec(rep.dur)}`;
	else
		emptyLabel(id);
};

const emptyLabel = (id: "cur" | "next") => {
	layout[`${id}_name`]!.label = "<none> / 0m";
};

const pad2 = (s: number) => ('0' + s.toFixed(0)).slice(-2);

const msToMinSec = (ms: number) => {
	const sec = Math.floor(ms / 1000);
	const min = Math.floor(sec / 60);
	return min.toFixed(0) + ":" + pad2(sec % 60);
};

const drawRep = () => {
	(layout["duration"] as any).lazyBuster ^= 1;

	if(state){
		const i = state.currentRepIndex();

		if(i !== lastRepIndex){
			buzzNewRep();
			lastRepIndex = i;

			const repIdx = layout["repIdx"]!;
			repIdx.label = i !== null ? `Rep ${i+1}` : "Done";

			// work around a bug in clearing a rotated txt(?)
			layout.forgetLazyState();
			layout.clear();
		}

		layout["play"]!.label = state.paused ? "Play" : "Pause";

		if(i !== null){
			repToLabel(i, "cur");
			repToLabel(i+1, "next");
		}else{
			emptyLabel("cur");
			emptyLabel("next");
		}
	}

	layout.render();
};

const buzzInteraction = () => Bangle.buzz(250);
const buzzNewRep = () => {
	let n = firstTime ? 1 : 3;
	firstTime = false;
	const buzz = () => {
		Bangle.buzz(1000).then(() => {
			if (--n <= 0)
				return;
			setTimeout(buzz, 250);
		});
	};
	buzz();
};

const init = () => {
	g.clear();
	layout.setUI();
	drawRep();

	Bangle.drawWidgets();
};

Bangle.loadWidgets();
if (settings.record && WIDGETS["recorder"]) {
  (WIDGETS["recorder"] as RecorderWidget)
    .setRecording(true)
    .then(init);

  if (settings.recordStopOnExit)
    E.on('kill', () => (WIDGETS["recorder"] as RecorderWidget).setRecording(false));
} else {
	init();
}

}
