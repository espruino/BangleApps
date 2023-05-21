// TODO: buzz on stage change, better setTimeout()
// TODO: fastload: scoping, unregister layout handlers etc
// TODO: spaces vs tabs
// TODO: const colfg=g.theme.fg, colbg=g.theme.bg;

const Layout = require("Layout");

type Rep = {
	dur: number,
	label: string,
	accDur: number,
};

const reps: Rep[] = [
	// 1 X 4 mins - 4 min recovery
	// 2 X 2 mins - 2 min recoveries
	// 4 X 1 min - 1 min recoveries (turn for home after the 2nd minute)
	// 8 X 30 secs - 30 sec recoveries
	// 3 min static recovery
	// 1 X 4 mins to finish

	{dur:3/60, label:"1st-sec"},
	{dur:5/60, label:"5-sec"},

	{dur:4/60, label:"jog"},
	{dur:4/60, label:"recovery"},

	// {dur:2, label:"jog"},
	// {dur:2, label:"recovery"},
	// {dur:2, label:"jog"},
	// {dur:2, label:"recovery"},

	// {dur:1, label:"jog"},
	// {dur:1, label:"recovery"},
	// {dur:1, label:"jog"},
	// {dur:1, label:"recovery"},
	// {dur:1, label:"jog"},
	// {dur:1, label:"recovery"},
	// {dur:1, label:"jog"},
	// {dur:1, label:"recovery"},

	// {dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	// {dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	// {dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	// {dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	// {dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	// {dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	// {dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	// {dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},

	// {dur:3, label:"static recovery"},
	// {dur:4, label:"finish"},
].map(((r: Rep, i: number, a: Rep[]): Rep => {
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

// FIXME: `Layout_` name, e.g. Layout_.Align.Right

// top: show current rep: name & duration
// middle: show time left on current rep
// bottom: show next rep
// ctrl: play/pause button. back & forward?
const layout = new Layout({
	type: "v",
	c: [
		{
			id: "repIdx",
			type: "txt",
			label: "Rep 1", // TODO: update in render
			font: `Vector:${fontSzRepDesc}`,
		},
		{
			id: "duration",
			lazyBuster: 1,
			type: "custom",
			font: `Vector:${fontSzMain}` as FontNameWithScaleFactor,
			fillx: 1,
			filly: 1,
			render: (l: Layout_.RenderedHierarchy) => {
				let lbl;

				g.clearRect(l.x, l.y, l.x+l.w, l.y+l.h);

				if(state){
					// TODO: inefficient
					const i = state.currentRepIndex();
					const repElapsed = state.getElapsedForRep();

					if(i !== null){
						let thisDur = reps[i]!.dur;

						const remaining = thisDur - repElapsed;
						lbl = msToMinSec(remaining);

						const fract = repElapsed / thisDur;
						g.setColor("#86caf7")
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

				g.setColor(l.col || g.theme.fg)
					.setFont(l.font!)
					.setFontAlign(0, 0)
					.drawString(
						lbl,
						l.x+(l.w>>1),
						l.y+(l.h>>1)
					);
			},
		},
		{
			type: "txt",
			font: `Vector:${fontSzRepDesc}`,
			label: "Activity / Duration",
		},
		{
			id: `cur_name`,
			type: "txt",
			font: `Vector:${fontSzRep}`,
			label: "",
			//pad: 4,
			fillx: 1,
		},
		{
			type: "txt",
			font: `Vector:${fontSzRepDesc}`,
			label: "Next / Duration",
		},
		{
			id: `next_name`,
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
					label: "<",
					fillx: 1,
					cb: () => onPrev(),
				},
				{
					id: "play",
					type: "btn",
					label: "Play", // TODO: change
					fillx: 1,
					cb: () => onToggle(),
				},
				{
					id: "next",
					type: "btn",
					label: ">",
					fillx: 1,
					cb: () => onNext(),
				}
			]
		}
	]
}, {lazy: true});

const onToggle = () => {
	if(!state)
		state = new State();
	state.toggle();
	drawRep();
};

const onPrev = () => {
};

const onNext = () => {
};

class State {
	paused: boolean = true;
	begin: number = Date.now(); // only valid if !paused
	accumulated: number = 0;

	toggle() {
		if(this.paused){
			this.begin = Date.now();

			// TODO: move draw out
			drawInterval = setInterval(drawRep, 1000);
		}else{
			const diff = Date.now() - this.begin;
			this.accumulated += diff;

			clearInterval(drawInterval!);
		}

		this.paused = !this.paused;
	}

	getElapsedTotal() {
		return (this.paused ? 0 : Date.now() - this.begin) + this.accumulated;
	}

	getElapsedForRep() {
		const elapsed = this.getElapsedTotal();
		const i = this.currentRepIndex();

		return elapsed - (i! > 0 ? reps[i!-1]!.accDur : 0);
	}

	currentRepIndex() {
		const elapsed = this.getElapsedTotal();
		let ent;
		for(let i = 0; ent = reps[i]; i++)
			if(elapsed < ent.accDur)
				return i;
		return null;
	}
}

let state: State | undefined;
let drawInterval: IntervalId | undefined;

const repToLabel = (i: number, id: string) => {
	const rep = reps[i];
	if(rep){
		layout[`${id}_name`]!.label = `${rep.label} / ${msToMinSec(rep.dur)}`;
		// FIXME: display time, i.e. hh:mm
		//layout[`${id}_dur`]!.label = ``;
	}else{
		emptyLabel(id);
	}
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
		// TODO: layout.clear(layout.next_name); layout.render(layout.next_name)

		layout["play"]!.label = state.paused ? "Play" : "Pause";

		const i = state.currentRepIndex();
		if(i !== null){
			repToLabel(i, "cur");
			repToLabel(i+1, "next");
		}else{
			emptyLabel("cur");
			emptyLabel("next");
		}
	}

	layout.render();

	/*
	// TODO: figure out next rep change time? or every 5s, then countdown from 10-->0
	// TODO: and then use that to Bangle.buzz() on next rep
	if (drawTimeout) clearTimeout(drawTimeout);
	drawTimeout = setTimeout(function() {
		drawTimeout = undefined;
		drawRep();
	}, 1000 - (Date.now() % 1000));
	*/
};

g.clear();
drawRep();

// TODO: swipe handlers
//Bangle.setUI

// TODO: widgets
