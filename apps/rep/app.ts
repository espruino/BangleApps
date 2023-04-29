// TODO: buzz on stage change, better setTimeout()

const entries: {dur: number, label: string}[] = [
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

let index = 0;
let begin: Date | undefined;
let drawTimeout: number | undefined;

const pad2 = (s: number) => ('0' + s.toFixed(0)).slice(-2);

const drawNamespace = () => {
	const x = g.getWidth() / 2;
	const y = g.getHeight() / 2;
	const now = new Date();

	const elapsed = now.getDate() - begin!.getDate();

	const sec = Math.round(elapsed / 1000) % 60;
	const min = Math.round(sec / 60);

	const timeStr = min + ":" + pad2(sec);
	let current;
	let i;
	let total = 0;
	for(i = 0; entries[i]; i++){
		const ent = entries[i]!;
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
		drawNamespace();
	}, 1000 - (Date.now() % 1000));
};

g.reset().clearRect(Bangle.appRect);
g.setFontAlign(0, 0).setFont("Vector", 55).drawString(
	"Start",
	g.getWidth() / 2,
	g.getHeight() / 2
);

Bangle.on("touch", (_btn, _xy) => {
	begin = new Date();
	index = 0;
	drawNamespace();
});
