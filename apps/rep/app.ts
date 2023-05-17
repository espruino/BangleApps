// TODO: buzz on stage change, better setTimeout()
// TODO: fastload: scoping, unregister layout handlers etc

const Layout = require("Layout");

const entries /*: {dur: number, label: string}[]*/ = [
	// 1 X 4 mins - 4 min jog recovery
	// 2 X 2 mins - 2 min jog recoveries
	// 4 X 1 min - 1 min jog recoveries (turn for home after the 2nd minute)
	// 8 X 30 secs - 30 sec jog recoveries
	// 3 min static recovery
	// 1 X 4 mins to finish

	{dur:4, label:"jog"},
	{dur:4, label:"jog recovery"},

	{dur:2, label:"jog"},
	{dur:2, label:"jog recovery"},
	{dur:2, label:"jog"},
	{dur:2, label:"jog recovery"},

	{dur:1, label:"jog"},
	{dur:1, label:"jog recovery"},
	{dur:1, label:"jog"},
	{dur:1, label:"jog recovery"},
	{dur:1, label:"jog"},
	{dur:1, label:"jog recovery"},
	{dur:1, label:"jog"},
	{dur:1, label:"jog recovery"},

	{dur:0.5, label:"jog"}, {dur:0.5, label:"jog recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"jog recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"jog recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"jog recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"jog recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"jog recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"jog recovery"},
	{dur:0.5, label:"jog"}, {dur:0.5, label:"jog recovery"},

	{dur:3, label:"static recovery"},
	{dur:4, label:"finish"},
];

const repLayout = (id: string): (Layout_.Hierarchy & {type:"txt"})[] => [
	{
		id: `${id}_name`,
		type: "txt",
		font: "Vector:30",
		label: "Name PH",
		pad: 4,
	}, {
		id: `${id}_dur`,
		type: "txt",
		font: "Vector:30",
		label: "DURATION",
		pad: 4,
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
			type: "h",
			c: repLayout("cur"),
			filly: 1,
		},
		{
			id: "cur_time",
			type: "txt",
			font: "Vector:40", // FIXME: bigger
			label: "MM:SS", // TODO: empty strings
			fillx: 1,
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
				type: "btn",
				label: "Play", // TODO: change
				cb: () => {
					console.log("cb()");
				},
				filly: 1,
			}]
		}
	]
}, {lazy: true});

let index = 0;
let begin: Date | undefined;
let drawTimeout: number | undefined;
let paused = true;
let positioned = false;

const pad2 = (s: number) => ('0' + s.toFixed(0)).slice(-2);

const drawRep = () => {
	// TODO: layout.clear(layout.next_name); layout.render(layout.next_name)

	layout["next_name"]!.label = "next";
	layout["next_dur"]!.label = `${30}`;
	layout["cur_name"]!.label = "next";
	layout["cur_dur"]!.label = `${30}`;

	layout["cur_time"]!.label = "1:23";

	if(!positioned){
		positioned = true;
		layout.update(); // position
	}

	layout.render();

	/*
	const x = g.getWidth() / 2;
	const y = g.getHeight() / 2;
	const now = new Date();

	const elapsed = now.getDate() - begin.getDate();

	const sec = Math.round(elapsed / 1000) % 60;
	const min = Math.round(sec / 60);

	const timeStr = min + ":" + pad2(sec);
	let current;
	let i;
	let total = 0;
	for(i = 0; entries[i]; i++){
		const ent = entries[i];
		total += ent.dur;
		if(total > elapsed)
			break;
		current = ent;
	}

	g.reset()
	.clearRect(Bangle.appRect)
	.setFontAlign(0, 0)
	.setFont("Vector", 55)
	.drawString(timeStr, x, y)
	.setFont("Vector", 33)
	.drawString(current ? current.label + " for " + current.dur : "<done>", x, y+48);

	if (drawTimeout) clearTimeout(drawTimeout);
	drawTimeout = setTimeout(function() {
		drawTimeout = undefined;
		drawRep();
	}, 1000 - (Date.now() % 1000));

	if(paused){
		g.reset()
		.clearRect(Bangle.appRect)
		.setFontAlign(0, 0)
		.setFont("Vector", 55)
		.drawString("Start", g.getWidth() / 2, g.getHeight() / 2);
	}
	*/
};

g.clear();
drawRep();

// TODO: widgets
