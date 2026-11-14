const DIGITS = [
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AAAAAAA//gAAAAAAAAAAAA////AAAAAAAAAAAH////4AAAAAAAAAA//////AAAAAAAAAD//////wAAAAAAAAP//////8AAAAAAAA////////AAAAAAAD////////wAAAAAAH////////4AAAAAAP////////+AAAAAA//////////AAAAAB//////////gAAAAD//////////wAAAAH//////////4AAAAP//////////8AAAAf//////////+AAAA////////////AAAB////////////gAAD////////////wAAD////////////4AAH////////////4AAP////////////8AAf////////////+AAf////////////+AA//////gB//////AA/////8AAP/////AB/////wAAB/////gB/////AAAA/////gD////8AAAAP////wD////4AAAAH////wH////wAAAAD////4H////gAAAAB////4H////AAAAAA////4P///+AAAAAAf///8P///8AAAAAAP///8P///8AAAAAAH///8f///4AAAAAAH///+f///4AAAAAAD///+f///wAAAAAAD///+f///wAAAAAAD///+f///gAAAAAAB///+f///gAAAAAAB////////gAAAAAAB////////AAAAAAAA////////AAAAAAAA////////AAAAAAAA////////AAAAAAAA////////AAAAAAAA////////AAAAAAAA////////AAAAAAAA////////AAAAAAAA////////AAAAAAAA////////AAAAAAAA////////gAAAAAAB////////gAAAAAAB////f///gAAAAAAB///+f///wAAAAAAB///+f///wAAAAAAD///+f///wAAAAAAD///+f///4AAAAAAH///+P///8AAAAAAH///8P///8AAAAAAP///8P///+AAAAAAf///8H////AAAAAA////8H////gAAAAA////4H////wAAAAB////4D////4AAAAH////wD////8AAAAP////wB////+AAAAf////wB/////gAAB/////gA/////8AAH/////gA//////gB//////AAf////////////+AAf////////////+AAP////////////8AAH////////////4AAH////////////4AAD////////////wAAB////////////gAAA////////////AAAAf//////////+AAAAP//////////+AAAAH//////////8AAAAD//////////wAAAAB//////////gAAAAA//////////AAAAAAf////////+AAAAAAH////////4AAAAAAD////////wAAAAAAA////////AAAAAAAAP//////+AAAAAAAAD//////4AAAAAAAAA//////AAAAAAAAAAH////8AAAAAAAAAAA////AAAAAAAAAAAAB//gAAAAAA"))
	},
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AAAAAAAAAAgAAAAAAAAAAAAAABgAAAAAAAAAAAAAADgAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAPgAAAAAAAAAAAAAAfgAAAAAAAAAAAAAA/gAAAAAAAAAAAAAB/gAAAAAAAAAAAAAD/gAAAAAAAAAAAAAH/gAAAAAAAAAAAAAP/gAAAAAAAAAAAAAf/gAAAAAAAAAAAAA//gAAAAAAAAAAAAB//gAAAAAAAAAAAAD//gAAAAAAAAAAAAH//gAAAAAAAAAAAAP//gAAAAAAAAAAAAf//gAAAAAAAAAAAA///gAAAAAAAAAAAB///gAAAAAAAAAAAD///gAAAAAAAAAAAH///gAAAAAAAAAAAP///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAAAAAAAAf///gAAAAA"))
	},
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AAAAAH///8AAAAAAAAAAAP////+AAAAAAAAAAf/////wAAAAAAAAA//////8AAAAAAAAB///////AAAAAAAAD///////wAAAAAAAH///////4AAAAAAAP///////8AAAAAAAf///////+AAAAAAA/////////AAAAAAB/////////gAAAAAD/////////wAAAAAH/////////4AAAAAP/////////8AAAAAf/////////8AAAAA//////////+AAAAB//////////+AAAAD///////////AAAAH///////////AAAAP///////////gAAAf///////////gAAA////////////gAAB////////////wAAD////////////wAAAAAAAAAAD////wAAAAAAAAAAA////wAAAAAAAAAAAP///4AAAAAAAAAAAP///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAP///4AAAAAAAAAAAf///wAAAAAAAAAAA////wAAAAAAA////////wAAAAAAf////////wAAAAAD/////////wAAAAAP/////////gAAAAA//////////gAAAAD//////////gAAAAH//////////AAAAAP//////////AAAAAf/////////+AAAAA//////////+AAAAB//////////8AAAAD//////////4AAAAH//////////4AAAAP//////////wAAAAP//////////gAAAAf//////////AAAAAf/////////+AAAAA//////////8AAAAA//////////wAAAAB//////////gAAAAB/////////+AAAAAD/////////4AAAAAD/////////gAAAAAD////////4AAAAAAD////gAAAAAAAAAAD///+AAAAAAAAAAAH///8AAAAAAAAAAAH///8AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AAAH///////////4AA"))
	},
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AAAAAAB///////AAAAAAAAD///////AAAAAAAAH///////AAAAAAAAP///////AAAAAAAAf///////AAAAAAAA////////AAAAAAAB////////AAAAAAAD////////AAAAAAAH////////AAAAAAAP////////AAAAAAAf////////AAAAAAA/////////AAAAAAB/////////AAAAAAD/////////AAAAAAH/////////AAAAAAP/////////AAAAAAf/////////AAAAAA//////////AAAAAB//////////AAAAAD//////////AAAAAH//////////AAAAAP//////////AAAAAf//////////AAAAA///////////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAB////AAAAAAAAAAAB////AAAAAAAAAAAD////AAAAAAAAAAAP///+AAAAAAAAA//////+AAAAAAAAA//////+AAAAAAAAA//////+AAAAAAAAA//////8AAAAAAAAA//////8AAAAAAAAA//////8AAAAAAAAA//////4AAAAAAAAA//////4AAAAAAAAA//////wAAAAAAAAA//////wAAAAAAAAA//////gAAAAAAAAA//////AAAAAAAAAA//////AAAAAAAAAA//////gAAAAAAAAA//////wAAAAAAAAA//////wAAAAAAAAA//////4AAAAAAAAA//////4AAAAAAAAA//////8AAAAAAAAA//////8AAAAAAAAA//////8AAAAAAAAA//////+AAAAAAAAA//////+AAAAAAAAA//////+AAAAAAAAAAAP///+AAAAAAAAAAAD////AAAAAAAAAAAB////AAAAAAAAAAAB////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAB////AAAAAAAAAAAB////AAAAAAAAAAAD////AAAAAAAAAAAP///+AAAA///////////+AAAA///////////+AAAA///////////+AAAA///////////8AAAA///////////8AAAA///////////8AAAA///////////4AAAA///////////4AAAA///////////wAAAA///////////wAAAA///////////gAAAA///////////AAAAA///////////AAAAA//////////+AAAAA//////////8AAAAA//////////4AAAAA//////////wAAAAA//////////gAAAAA/////////+AAAAAA/////////8AAAAAA/////////wAAAAAA/////////AAAAAAA////////4AAAAAAA///////+AAAAAA"))
	},
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AAAAAAAA////AAAAAAAAABAA////AAAAAAAAADAA////AAAAAAAAAHAA////AAAAAAAAAPAA////AAAAAAAAAfAA////AAAAAAAAA/AA////AAAAAAAAB/AA////AAAAAAAAD/AA////AAAAAAAAH/AA////AAAAAAAAP/AA////AAAAAAAAf/AA////AAAAAAAA//AA////AAAAAAAB//AA////AAAAAAAD//AA////AAAAAAAH//AA////AAAAAAAP//AA////AAAAAAAf//AA////AAAAAAA///AA////AAAAAAB///AA////AAAAAAD///AA////AAAAAAH///AA////AAAAAAP///AA////AAAAAAf///AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////AA////AAAAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAA////////////AAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAA"))
	},
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AH////////4AAAAAAH////////8AAAAAAH////////+AAAAAAH/////////AAAAAAH/////////gAAAAAH/////////wAAAAAH/////////4AAAAAH/////////8AAAAAH/////////+AAAAAH//////////AAAAAH//////////gAAAAH//////////wAAAAH//////////4AAAAH//////////8AAAAH//////////+AAAAH///////////AAAAH///////////gAAAH///////////wAAAH///////////4AAAH///////////8AAAH///////////+AAAH////////////AAAH////////////gAAH////////////wAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH////////gAAAAAAH/////////AAAAAAH/////////4AAAAAH/////////+AAAAAH//////////AAAAAH//////////wAAAAH//////////4AAAAH//////////+AAAAH///////////AAAAH///////////gAAAH///////////wAAAH///////////wAAAH///////////4AAAH///////////8AAAH///////////8AAAH///////////+AAAH////////////AAAH////////////AAAH////////////gAAH////////////gAAH////////////gAAH////////////wAAH////////////wAAH////////////wAAAAAAAAAAB////wAAAAAAAAAAAf///4AAAAAAAAAAAP///4AAAAAAAAAAAP///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAP///4AAAAAAAAAAAP///4AAAAAAAAAAAf///4AAAAAAAAAAA////wAAH////////////wAAH////////////wAAH////////////wAAH////////////gAAH////////////gAAH////////////gAAH////////////AAAH////////////AAAH///////////+AAAH///////////+AAAH///////////8AAAH///////////4AAAH///////////4AAAH///////////wAAAH///////////gAAAH///////////AAAAH//////////+AAAAH//////////8AAAAH//////////wAAAAH//////////gAAAAH/////////+AAAAAH/////////4AAAAAH/////////AAAAAAH////////wAAAAA"))
	},
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AAAAAIAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAB4AAAAAAAAAAAAAAD4AAAAAAAAAAAAAAH4AAAAAAAAAAAAAAP4AAAAAAAAAAAAAAf4AAAAAAAAAAAAAA/4AAAAAAAAAAAAAB/4AAAAAAAAAAAAAD/4AAAAAAAAAAAAAH/4AAAAAAAAAAAAAP/4AAAAAAAAAAAAAf/4AAAAAAAAAAAAA//4AAAAAAAAAAAAB//4AAAAAAAAAAAAD//4AAAAAAAAAAAAH//4AAAAAAAAAAAAP//4AAAAAAAAAAAAf//4AAAAAAAAAAAA///4AAAAAAAAAAAB///4AAAAAAAAAAAD///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH////////wAAAAAAH/////////AAAAAAH/////////4AAAAAH/////////+AAAAAH//////////gAAAAH//////////wAAAAH//////////4AAAAH//////////+AAAAH///////////AAAAH///////////gAAAH///////////wAAAH///////////wAAAH///////////4AAAH///////////8AAAH///////////+AAAH///////////+AAAH////////////AAAH////////////AAAH////////////gAAH////////////gAAH////////////gAAH////////////wAAH////////////wAAH////////////wAAH////gAAB////wAAH///+AAAAf///4AAH///8AAAAP///4AAH///4AAAAP///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///8AAAAP///4AAH///8AAAAP///4AAH///+AAAAf///4AAH////gAAB////wAAD////////////wAAD////////////wAAD////////////wAAB////////////gAAB////////////gAAB////////////gAAA////////////AAAA////////////AAAAf//////////+AAAAf//////////+AAAAP//////////8AAAAH//////////4AAAAH//////////wAAAAD//////////wAAAAB//////////gAAAAA//////////AAAAAAf////////+AAAAAAP////////4AAAAAAD////////wAAAAAAB////////gAAAAAAAf//////+AAAAAAAAH//////4AAAAAAAAA//////AAAAAAAAAAD////wAAAAA"))
	},
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AAAAAA////////AAAAAAAB////////AAAAAAAD////////AAAAAAAH////////AAAAAAAP////////AAAAAAAf////////AAAAAAA/////////AAAAAAB/////////AAAAAAD/////////AAAAAAH/////////AAAAAAP/////////AAAAAAf/////////AAAAAA//////////AAAAAB//////////AAAAAD//////////AAAAAH//////////AAAAAP//////////AAAAAf//////////AAAAA///////////AAAAB///////////AAAAD///////////AAAAH///////////AAAAP///////////AAAAf///////////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAB////AAAAAAAAAAAB////AAAAAAAAAAAD////AAAAAAAAAAAP///+AAAAAAAAAAf////+AAAAAAAAAH/////+AAAAAAAAA//////+AAAAAAAAD//////8AAAAAAAAP//////8AAAAAAAAf//////8AAAAAAAB///////4AAAAAAAD///////4AAAAAAAH///////wAAAAAAAP///////wAAAAAAAf///////gAAAAAAA////////AAAAAAAA///////+AAAAAAAB///////+AAAAAAAD///////8AAAAAAAD///////4AAAAAAAH///////wAAAAAAAH///////AAAAAAAAP//////+AAAAAAAAP//////4AAAAAAAAP//////wAAAAAAAAf//////AAAAAAAAAf/////4AAAAAAAAAf////8AAAAAAAAAAf///8AAAAAAAAAAA////wAAAAAAAAAAA////gAAAAAAAAAAA////gAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAAAAAA////AAAAAAAA"))
	},
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AAAAAAD//wAAAAAAAAAAAA////AAAAAAAAAAAH////4AAAAAAAAAAf////+AAAAAAAAAB//////gAAAAAAAAD//////wAAAAAAAAH//////4AAAAAAAAf//////+AAAAAAAA////////AAAAAAAB////////gAAAAAAD////////wAAAAAAH////////4AAAAAAH////////4AAAAAAP////////8AAAAAAf////////+AAAAAAf////////+AAAAAA//////////AAAAAA//////////AAAAAB//////////gAAAAB//////////gAAAAB//////////gAAAAD//////////wAAAAD//////////wAAAAD//////////wAAAAD////gB////wAAAAH///+AAf///4AAAAH///8AAP///4AAAAH///8AAP///4AAAAH///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///4AAAAH///8AAP///4AAAAH///8AAP///4AAAAH///+AAf///4AAAAD////gB////wAAAAD//////////wAAAAD//////////wAAAAD//////////wAAAAB//////////gAAAAB//////////gAAAAB//////////gAAAAA//////////AAAAAA//////////AAAAAA//////////AAAAAB//////////gAAAAD//////////wAAAAH//////////4AAAAH//////////4AAAAP//////////8AAAAf//////////+AAAAf//////////+AAAA////////////AAAA////////////AAAB////////////gAAB////////////gAAB////////////gAAD////////////wAAD////////////wAAD////////////wAAD////gAAB////wAAH///+AAAAf///4AAH///8AAAAP///4AAH///8AAAAP///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///8AAAAP///4AAH///8AAAAP///4AAH///+AAAAf///4AAD////gAAB////wAAD////////////wAAD////////////wAAD////////////wAAB////////////gAAB////////////gAAB////////////gAAA////////////AAAA////////////AAAAf//////////+AAAAf//////////+AAAAP//////////8AAAAH//////////4AAAAH//////////4AAAAD//////////wAAAAB//////////gAAAAA//////////AAAAAAf////////+AAAAAAP////////8AAAAAAD////////wAAAAAAB////////gAAAAAAAf//////+AAAAAAAAH//////4AAAAAAAAA//////AAAAAAAAAAD////wAAAAA"))
	},
	{
		width: 96, height: 96, bpp: 1, transparent: 0,
		buffer: E.toArrayBuffer(atob("AAAAAD////wAAAAAAAAAA//////AAAAAAAAAH//////4AAAAAAAAf//////+AAAAAAAB////////gAAAAAAD////////wAAAAAAP////////8AAAAAAf////////+AAAAAA//////////AAAAAB//////////gAAAAD//////////wAAAAH//////////4AAAAH//////////4AAAAP//////////8AAAAf//////////+AAAAf//////////+AAAA////////////AAAA////////////AAAB////////////gAAB////////////gAAB////////////gAAD////////////wAAD////////////wAAD////////////wAAD////gAAB////wAAH///+AAAAf///4AAH///8AAAAP///4AAH///8AAAAP///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///4AAAAH///4AAH///8AAAAP///4AAH///8AAAAP///4AAH///+AAAAf///4AAD////gAAB////4AAD////////////4AAD////////////4AAD////////////4AAB////////////4AAB////////////4AAB////////////4AAA////////////4AAA////////////4AAAf///////////4AAAf///////////4AAAP///////////4AAAH///////////4AAAH///////////4AAAD///////////4AAAB///////////4AAAA///////////4AAAAf//////////4AAAAP//////////4AAAAD//////////4AAAAB//////////4AAAAAf/////////4AAAAAH/////////4AAAAAA/////////4AAAAAAD////////4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAH///4AAAAAAAAAAAD///4AAAAAAAAAAAB///4AAAAAAAAAAAA///4AAAAAAAAAAAAf//4AAAAAAAAAAAAP//4AAAAAAAAAAAAH//4AAAAAAAAAAAAD//4AAAAAAAAAAAAB//4AAAAAAAAAAAAA//4AAAAAAAAAAAAAf/4AAAAAAAAAAAAAP/4AAAAAAAAAAAAAH/4AAAAAAAAAAAAAD/4AAAAAAAAAAAAAB/4AAAAAAAAAAAAAA/4AAAAAAAAAAAAAAf4AAAAAAAAAAAAAAP4AAAAAAAAAAAAAAH4AAAAAAAAAAAAAAD4AAAAAAAAAAAAAAB4AAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAIA"))
	}
];
const DIGIT_SIZE = 96;

let timeoutRef = null;
let shown = '';

function clearTimers() {
  if (timeoutRef) {
    clearTimeout(timeoutRef);
    timeoutRef = null;
  }
}

function drawDigit(value, x, y, scale) {
  g.drawImage(DIGITS[value], x, y, { scale: scale });
}

function drawClock() {
  const date = new Date();
  const text = ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2);
  if (text === shown) return;
  shown = text;
  const gap = 3;
  const margin = 2;
  const width = g.getWidth();
  const height = g.getHeight();
  const size = Math.floor(Math.min((width - margin * 2 - gap) / 2, (height - margin * 2 - gap) / 2));
  const blockWidth = size * 2 + gap;
  const blockHeight = size * 2 + gap;
  const x = Math.floor((width - blockWidth) / 2);
  const y = Math.floor((height - blockHeight) / 2);
  const scale = size / DIGIT_SIZE;
  g.setBgColor(0, 0, 0);
  g.clearRect(0, 0, width - 1, height - 1);
  g.setColor(1, 1, 1);
  drawDigit(text.charCodeAt(0) - 48, x, y, scale);
  drawDigit(text.charCodeAt(1) - 48, x + size + gap, y, scale);
  drawDigit(text.charCodeAt(2) - 48, x, y + size + gap, scale);
  drawDigit(text.charCodeAt(3) - 48, x + size + gap, y + size + gap, scale);
  g.flip();
}

// Statusleiste ausblenden: Ohne draw und area zeichnet Bangle.drawWidgets() beim Entsperren nichts.
// Die Uhr lädt beim Verlassen neu (setUI ohne remove), daher kein Wiederherstellen nötig.
function hideWidgets() {
  if (!global.WIDGETS) return;
  for (const id in WIDGETS) {
    WIDGETS[id].draw = () => { };
    WIDGETS[id].area = '';
  }
}

function startTimers() {
  hideWidgets();
  clearTimers();
  shown = '';
  drawClock();
  const wait = 60000 - (Date.now() % 60000);
  timeoutRef = setTimeout(function tick() {
    drawClock();
    timeoutRef = setTimeout(tick, 60000);
  }, wait);
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    startTimers();
  } else {
    clearTimers();
  }
});

Bangle.setUI('clock');
hideWidgets();
g.setBgColor(0, 0, 0);
g.clear();
startTimers();
