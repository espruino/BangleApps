// TODO: buzz on stage change, better setTimeout()
// TODO: fastload: scoping, unregister layout handlers etc
// TODO: spaces vs tabs
// TODO: const colfg=g.theme.fg, colbg=g.theme.bg;

const Layout = require("Layout");

type Rep = {
	dur: number,
	label: string,
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

	// {dur:4, label:"jog"},
	// {dur:4, label:"recovery"},

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
];

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
			id: "duration",
			lazyBuster: 1,
			type: "custom",
			font: `Vector:${fontSzMain}` as FontNameWithScaleFactor, // modified in draw
			fillx: 1,
			filly: 1,
			render: (l: Layout_.RenderedHierarchy) => {
				let lbl;

				g.clearRect(l.x, l.y, l.x+l.w, l.y+l.h);

				if(state){
					const elapsed = getElapsed(state);
					const i = currentRepIndex(elapsed);

					if(i == null){
						// FIXME: dodgy end-of-rep handling
						lbl = msToHM(elapsed);
					}else{
						const thisDur = repDuration(reps[i]!);
						const remaining = thisDur - elapsed;
						lbl = msToHM(remaining);

						const fract = elapsed / thisDur;
						g.setColor("#00f")
							.fillRect(
								l.x,
								l.y,
								l.x + fract * l.w,
								l.y+l.h
							);
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
	if(!state){
		state = {
			begin: Date.now(),
			accumulated: 0,
		};
		play(true, state);
	}else{
		play(paused, state);
	}

	drawRep();
};

const onPrev = () => {
};

const onNext = () => {
};

const play = (p: boolean, state: State) => {
	if(p){
		layout["play"]!.label = "Pause";

		state.begin = Date.now();

		drawInterval = setInterval(drawRep, 1000);
	}else{
		layout["play"]!.label = "Play";

		const diff = Date.now() - state.begin;
		state.accumulated += diff;

		clearInterval(drawInterval!);
	}

	paused = !p;
}

type State = { begin: number, accumulated: number };

let state: State | undefined;
//let drawTimeout: number | undefined;
let paused = false; // TODO: ditch this, used drawInterval
let drawInterval: IntervalId | undefined;

const currentRepIndex = (elapsedMs: number) => {
	let total = 0;
	let ent;
	for(let i = 0; ent = reps[i]; i++){
		total += repDuration(ent);
		if(elapsedMs <= total)
			return i;
	}
	return null;
};

const repToLabel = (i: number, id: string) => {
	const rep = reps[i];
	if(rep){
		layout[`${id}_name`]!.label = `${i+1}: ${rep.label} / ${rep.dur.toFixed(0)}m`;
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

const repDuration = (rep: Rep) => rep.dur * 60 * 1000;

const getElapsed = (state: State) =>
	Date.now() - state.begin + state.accumulated;

const msToHM = (ms: number) => {
	const sec = Math.round(ms / 1000);
	const min = Math.round(sec / 60);
	return min.toFixed(0) + ":" + pad2(sec % 60);
};

const drawRep = () => {
	(layout["duration"] as any).lazyBuster ^= 1;

	if(state){
		// TODO: layout.clear(layout.next_name); layout.render(layout.next_name)

		const elapsed = getElapsed(state);
		const i = currentRepIndex(elapsed);
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
