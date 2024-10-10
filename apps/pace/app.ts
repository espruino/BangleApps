{
const Layout = require("Layout");
const time_utils = require("time_utils");
const exs = require("exstats").getStats(
  ["dist", "pacec"],
  {
   notify: {
      dist: {
        increment: 1000,
      },
    },
  },
);

let drawTimeout: TimeoutId | undefined;
let lastUnlazy = 0;

const splits: number[] = []; // times
let splitOffset = 0, splitOffsetPx = 0;

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

const calculatePace = (time: number, dist: number) => {
  if (dist === 0) return 0;
  return time / dist / 1000 / 60;
};

const draw = () => {
  if (!exs.state.active) {
    // no draw-timeout here, only on user interaction
    drawSplits();
    return;
  }

  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(draw, 1000);

  const now = Date.now();

  let pace: string;
  if ("time" in exs.state.thisGPS
  && now - (exs.state.thisGPS.time as unknown as number) < GPS_TIMEOUT_MS)
  {
    pace = exs.stats.pacec.getString()
  }else{
    pace = "No GPS";
  }

  const tm = time_utils.decodeTime(exs.state.duration);
  layout["time"]!.label = tm.d ? time_utils.formatDuration(tm) : time_utils.formatTime(tm); // formatTime throws if tm.d > 0
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
    drawSplit(i, y, splitPace);
  }

  const pace = exs.stats.pacec.getString();

  const y = Bangle.appRect.y + i * (barSize + barSpacing) + barSpacing / 2;
  drawSplit(i, y, pace);
};

const drawSplit = (i: number, y: number, pace: number | string) => {
  g
    .setColor("#fff")
    .drawString(
      `${i + 1 + splitOffset} ${typeof pace === "number" ? pace.toFixed(2) : pace}`,
      0,
      y
    );
};

const pauseRun = () => {
  exs.stop();
  Bangle.setGPSPower(0, "pace")
  draw();
};

const resumeRun = () => {
  exs.resume();
  Bangle.setGPSPower(1, "pace");

  g.clearRect(Bangle.appRect); // splits -> layout, clear. layout -> splits, fine
  layout.forgetLazyState();
  draw();
};

const onButton = () => {
  if (exs.state.active)
    pauseRun();
  else
    resumeRun();
};

exs.stats.dist.on("notify", (dist) => {
  const prev = splits[splits.length - 1] || 0;
  const totalDist = dist.getValue();
  let thisSplit = totalDist - prev;
  const prevTime = splits.reduce((a, b) => a + b, 0);
  let time = exs.state.duration - prevTime;

  while(thisSplit > 0) {
    splits.push(time);
    time = 0; // if we've jumped more than 1k, credit the time to the first split
    thisSplit -= 1000;
  }
});

Bangle.on('lock', locked => {
  // treat an unlock (while running) as a pause
  if(!locked && exs.state.active) onButton();
});

setWatch(() => onButton(), BTN1, { repeat: true });

Bangle.on('drag', e => {
  if (exs.state.active || e.b === 0) return;

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
