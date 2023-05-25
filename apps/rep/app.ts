{
const Layout = require("Layout");

type Rep = {
	dur: number,
	label: string,
	accDur: number,
};

const reps: Rep[] = (require("Storage")
	.readJSON("rep.json") as Rep[] | undefined /* TODO */)
	.map(((r: Rep, i: number, a: Rep[]): Rep => {
		const r2 = r as Rep;

		r2.dur = r2.dur * 60 * 1000;

		r2.accDur = i > 0
			? a[i-1]!.accDur + r.dur
			: r.dur;

		return r as Rep;
	}) as any);

const fontSzMain = 64;
const fontSzRep = 20;
const fontSzRepDesc = 12;
const blue = "#86caf7";
const step = 5 * 1000;

let state: State | undefined;
let drawInterval: IntervalId | undefined;
let lastRepIndex: number | null = null;

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

	g.setFont(l.font!); // don't chain - might be undefined (TODO: typings)

	g.setColor(l.col || g.theme.fg)
		.setFontAlign(0, 0)
		.drawString(
			lbl,
			l.x+(l.w>>1),
			l.y+(l.h>>1)
		);
};

const layout = new Layout({
	type: "v",
	c: [
		{
			id: "repIdx",
			type: "txt",
			label: "Begin",
			font: `Vector:${fontSzRepDesc}`,
		},
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
					},
				}
			]
		}
	]
}, {lazy: true});

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
		for(let i = 0; ent = reps[i]; i++)
			if(elapsed < ent.accDur)
				return i;
		return null;
	}

	forward() {
		this.accumulated += step;
	}

	rewind() {
		this.accumulated -= step;
	}
}

const repToLabel = (i: number, id: string) => {
	const rep = reps[i];
	if(rep)
		layout[`${id}_name`]!.label = `${rep.label} / ${msToMinSec(rep.dur)}`;
	else
		emptyLabel(id);
};

const emptyLabel = (id: string) => {
	layout[`${id}_name`]!.label = "<none> / 0m";
};

const pad2 = (s: number) => ('0' + s.toFixed(0)).slice(-2);

const msToMinSec = (ms: number) => {
	const sec = Math.round(ms / 1000);
	const min = Math.round(sec / 60);
	return min.toFixed(0) + ":" + pad2(sec % 60);
};

const drawRep = () => {
	(layout["duration"] as any).lazyBuster ^= 1;

	if(state){
		const i = state.currentRepIndex();

		if(i !== lastRepIndex){
			buzzNewRep();
			lastRepIndex = i;
		}

		layout["play"]!.label = state.paused ? "Play" : "Pause";

		if(i !== null){
			layout["repIdx"]!.label = `Rep ${i+1}`;
			repToLabel(i, "cur");
			repToLabel(i+1, "next");
		}else{
			layout["repIdx"]!.label = "Done";
			emptyLabel("cur");
			emptyLabel("next");
		}
	}

	layout.render();
};

const buzzInteraction = () => Bangle.buzz(20);
const buzzNewRep = () => Bangle.buzz(500);

Bangle.loadWidgets();

g.clear();
drawRep();

Bangle.drawWidgets();
}
