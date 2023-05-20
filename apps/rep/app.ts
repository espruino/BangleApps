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

	{dur:1/60, label:"1st-sec"},
	{dur:5/60, label:"5-sec"},

	{dur:4, label:"jog"},
	{dur:4, label:"recovery"},

	{dur:2, label:"jog"},
	{dur:2, label:"recovery"},
	{dur:2, label:"jog"},
	{dur:2, label:"recovery"},

	{dur:1, label:"jog"},
	{dur:1, label:"recovery"},
	{dur:1, label:"jog"},
	{dur:1, label:"recovery"},
	{dur:1, label:"jog"},
	{dur:1, label:"recovery"},
	{dur:1, label:"jog"},
	{dur:1, label:"recovery"},

	{dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"recovery"},

	{dur:3, label:"static recovery"},
	{dur:4, label:"finish"},
];

const fontSzMain = 64;
const fontSzRep = 20;

// FIXME: `Layout_` name
const repLayout = (id: string): (Layout_.Hierarchy & {type:"txt"})[] => [
	{
		id: `${id}_name`,
		type: "txt",
		font: `Vector:${fontSzRep}`,
		label: "Name PH",
		//pad: 4,
		fillx: 1,
	}, {
		id: `${id}_dur`,
		type: "txt",
		font: `Vector:${fontSzRep}`,
		label: "DURATION",
		halign: Layout_.Align.Right,
	}
];

// top: show current rep: name & duration
// middle: show time left on current rep
// bottom: show next rep
// ctrl: play/pause button. back & forward?
const layout = new Layout({
	type: "v",
	c: [
		{
			id: "cur_time",
			type: "txt",
			font: `Vector:${fontSzMain}` as FontNameWithScaleFactor, // modified in draw
			label: "MM:SS", // TODO: empty strings
			fillx: 1,
			filly: 1,
		},
		{
			type: "h",
			c: repLayout("cur"),
			filly: 1,
		},
		{
			type: "h",
			c: repLayout("next"),
			filly: 1,
		},
		{
			type: "h",
			c: [{
				id: "play",
				type: "btn",
				label: "Play", // TODO: change
				fillx: 1,
				cb: () => {
					console.log("cb()");
				},
				filly: 1,
			}]
		}
	]
}, {lazy: true});

let index = 0;
let begin: number | undefined = Date.now(); // TODO: start null
let drawTimeout: number | undefined;
let paused = false;
let positioned = false;

const pad2 = (s: number) => ('0' + s.toFixed(0)).slice(-2);

const currentRepIndex = (elapsedMs: number) => {
	let total = 0;
	let ent;
	for(let i = 0; ent = reps[i]; i++){
		total += ent.dur * 60 * 1000;
		if(elapsedMs < total)
			return i;
	}
	return null;
};

const repToLabel = (i: number, id: string) => {
	const rep = reps[i];
	if(rep){
		layout[`${id}_name`]!.label = `${i+1}: ${rep.label}`;
		// FIXME: display time, i.e. hh:mm
		layout[`${id}_dur`]!.label = `${rep.dur.toFixed(0)}m`;
	}else{
		emptyLabel(id);
	}
};

const emptyLabel = (id: string) => {
	layout[`${id}_name`]!.label = "<none>";
	layout[`${id}_dur`]!.label = `0m`;
};

const drawRep = () => {
	if(paused || !begin){ // TODO: separate case for paused
		layout.clear();
		layout["cur_time"]!.label = "Ready";

		if(!positioned){
			positioned = true;
			layout.update(); // position
		}

		layout.render(layout["play"]);
		layout.render(layout["cur_time"]);
		return;
	}

	// TODO: layout.clear(layout.next_name); layout.render(layout.next_name)

	const now = Date.now();

	const elapsed = now - begin;
	const sec = Math.round(elapsed / 1000);
	const min = Math.round(sec / 60);
	const timeStr = min.toFixed(0) + ":" + pad2(sec % 60);
	layout["cur_time"]!.label = timeStr;

	const i = currentRepIndex(elapsed);
	if(i !== null){
		repToLabel(i, "cur");
		repToLabel(i+1, "next");
	}else{
		emptyLabel("cur");
		emptyLabel("next");
	}

	if(!positioned){
		positioned = true;
		layout.update(); // position
	}

	layout.render();


	/*
	g.reset()
	.clearRect(Bangle.appRect)
	.setFontAlign(0, 0)
	.setFont("Vector", 55)
	.drawString(timeStr, x, y)
	.setFont("Vector", 33)
	.drawString(current ? current.label + " for " + current.dur : "<done>", x, y+48);

	// TODO: figure out next rep change time? or every 5s, then countdown from 10-->0
	if (drawTimeout) clearTimeout(drawTimeout);
	drawTimeout = setTimeout(function() {
		drawTimeout = undefined;
		drawRep();
	}, 1000 - (Date.now() % 1000));

	*/
};

g.clear();
var drawInterval = setInterval(drawRep, 1000);
drawRep();

// TODO: widgets
