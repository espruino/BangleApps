{
const Layout = require("Layout");

const enum RunState {
  RUNNING,
  PAUSED
}

let state = RunState.PAUSED;
let drawTimeout: TimeoutId | undefined;
let lastUnlazy = 0;

let lastResumeTime = Date.now();
let splitTime = 0;
let totalTime = 0;

const splits: number[] = [];
let splitDist = 0;
let splitOffset = 0, splitOffsetPx = 0;

let lastGPS = 0;
const GPS_TIMEOUT_MS = 30000;

const layout = new Layout({
  type: "v",
  c: [
    {
      type: "txt",
      font: "6x8:2",
      label: "Pace",
      id: "paceLabel",
      pad: 4
    },
    {
      type: "txt",
      font: "Vector:40",
      label: "",
      id: "pace",
      halign: 0
    },
    {
      type: "txt",
      font: "6x8:2",
      label: "Time",
      id: "timeLabel",
      pad: 4
    },
    {
      type: "txt",
      font: "Vector:40",
      label: "",
      id: "time",
      halign: 0
    },
  ]
}, {
  lazy: true
});

const formatTime = (ms: number) => {
  let totalSeconds = Math.floor(ms / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const calculatePace = (time: number, dist: number) => {
  if (dist === 0) return 0;
  return time / dist / 1000 / 60;
};

const draw = () => {
  if (state === RunState.PAUSED) {
    // no draw-timeout here, only on user interaction
    drawSplits();
    return;
  }

  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(draw, 1000);

  const now = Date.now();

  const elapsedTime = formatTime(totalTime + (state === RunState.RUNNING ? now - lastResumeTime : 0));

  let pace: string;
  if (now - lastGPS <= GPS_TIMEOUT_MS) {
    pace = calculatePace(thisSplitTime(), splitDist).toFixed(2);
  }else{
    pace = "No GPS";
  }

  layout["time"]!.label = elapsedTime;
  layout["pace"]!.label = pace;
  layout.render();

  if (now - lastUnlazy > 30000)
    layout.forgetLazyState(), lastUnlazy = now;
};

const drawSplits = () => {
  g.clearRect(Bangle.appRect);

  const barSize = 20;
  const barSpacing = 10;
  const w = g.getWidth();
  const h = g.getHeight();

  const max = splits.reduce((a, x) => Math.max(a, x), 0);

  g.setFont("6x8", 2).setFontAlign(-1, -1);

  let i = 0;
  for(; ; i++) {
    const split = splits[i + splitOffset];
    if (split == null) break;

    const y = Bangle.appRect.y + i * (barSize + barSpacing) + barSpacing / 2;
    if (y > h) break;

    const size = w * split / max; // Scale bar height based on pace
    g.setColor("#00f").fillRect(0, y, size, y + barSize);

    const splitPace = calculatePace(split, 1); // Pace per km
    g.setColor("#fff").drawString(`${i + 1 + splitOffset} @ ${splitPace.toFixed(2)}`, 0, y);
  }

  const splitTime = thisSplitTime();
  const pace = calculatePace(splitTime, splitDist);
  g.setColor("#fff").drawString(
    `${i + 1 + splitOffset} @ ${pace} (${(splitTime / 1000).toFixed(2)})`,
    0,
    Bangle.appRect.y + i * (barSize + barSpacing) + barSpacing / 2,
  );
};

const thisSplitTime = () => {
  if (state === RunState.PAUSED) return splitTime;
  return Date.now() - lastResumeTime + splitTime;
};

const pauseRun = () => {
  state = RunState.PAUSED;
  const now = Date.now();
  totalTime += now - lastResumeTime;
  splitTime += now - lastResumeTime;
  Bangle.setGPSPower(0, "pace")
  Bangle.removeListener('GPS', onGPS);
  draw();
};

const resumeRun = () => {
  state = RunState.RUNNING;
  lastResumeTime = Date.now();
  Bangle.setGPSPower(1, "pace");
  Bangle.on('GPS', onGPS);

  g.clearRect(Bangle.appRect); // splits -> layout, clear. layout -> splits, fine
  layout.forgetLazyState();
  draw();
};

const onGPS = (fix: GPSFix) => {
  if (fix && fix.speed && state === RunState.RUNNING) {
    const now = Date.now();

    const elapsedTime = now - lastGPS; // ms
    splitDist += fix.speed * elapsedTime / 3600000; // ms in one hour (fix.speed is in km/h)

    while (splitDist >= 1) {
      splits.push(thisSplitTime());
      splitDist -= 1;
      splitTime = 0;
    }

    lastGPS = now;
  }
};

const onButton = () => {
  switch (state) {
    case RunState.RUNNING:
      pauseRun();
      break;
    case RunState.PAUSED:
      resumeRun();
      break;
  }
};

Bangle.on('lock', locked => {
  // treat an unlock (while running) as a pause
  if(!locked && state == RunState.RUNNING) onButton();
});

setWatch(() => onButton(), BTN1, { repeat: true });

Bangle.on('drag', e => {
  if (state !== RunState.PAUSED || e.b === 0) return;

  splitOffsetPx -= e.dy;
  if (splitOffsetPx > 20) {
    if (splitOffset < splits.length-3) splitOffset++, Bangle.buzz(30);
    splitOffsetPx = 0;
  } else if (splitOffsetPx < -20) {
    if (splitOffset > 0) splitOffset--, Bangle.buzz(30);
    splitOffsetPx = 0;
  }
  draw();
});

Bangle.loadWidgets();
Bangle.drawWidgets();

g.clearRect(Bangle.appRect);
draw();
}
