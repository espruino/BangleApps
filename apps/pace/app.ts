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
const S = require("Storage");

let drawTimeout: TimeoutId | undefined;

type Dist = number & { brand: 'dist' };
type Time = number & { brand: 'time' };

type Split = {
  dist: Dist,
  time: Time,
};

const splits: Split[] = []; // times
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

  layout["time"]!.label = formatDuration(exs.state.duration);
  layout["pace"]!.label = pace;
  layout.render();
};

const pad2 = (n: number) => `0${n}`.substr(-2);

const formatDuration = (ms: number) => {
  const tm = time_utils.decodeTime(ms);
  if(tm.h)
    return `${tm.h}:${pad2(tm.m)}:${pad2(tm.s)}`;
  return `${pad2(tm.m)}:${pad2(tm.s)}`;
};

// divide by actual distance, scale to milliseconds
const calculatePace = (split: Split) => formatDuration(split.time / split.dist * 1000);

const drawSplits = () => {
  g.clearRect(Bangle.appRect);

  const barSize = 20;
  const barSpacing = 10;
  const w = g.getWidth();
  const h = g.getHeight();

  const max = splits.reduce((a, s) => Math.max(a, s.time), 0);

  g.setFont("6x8", 2).setFontAlign(-1, -1);

  let y = Bangle.appRect.y + barSpacing / 2;
  g
    .setColor(g.theme.fg)
    .drawString(formatDuration(exs.state.duration), 0, y);

  let i = 0;
  for(; ; i++) {
    const split = splits[i + splitOffset];
    if (split == null) break;

    const y = Bangle.appRect.y + (i + 1) * (barSize + barSpacing) + barSpacing / 2;
    if (y > h) break;

    const size = w * split.time / max; // Scale bar height based on pace
    g.setColor("#00f").fillRect(0, y, size, y + barSize);

    const splitPace = calculatePace(split); // Pace per km
    g.setColor(g.theme.fg)
    drawSplit(i, y, splitPace);
  }

  const pace = exs.stats.pacec.getString();

  y = Bangle.appRect.y + (i + 1) * (barSize + barSpacing) + barSpacing / 2;
  drawSplit(i, y, pace);
};

const drawSplit = (i: number, y: number, pace: number | string) =>
  g
    .drawString(
      `${i + 1 + splitOffset} ${typeof pace === "number" ? pace.toFixed(2) : pace}`,
      0,
      y
    );

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

exs.start(); // aka reset

exs.stats.dist.on("notify", (dist) => {
  const prev = { time: 0, dist: 0 };
  for(const s of splits){
    prev.time += s.time;
    prev.dist += s.dist;
  }

  const totalDist = dist.getValue();
  let thisSplit = totalDist - prev.dist;
  let thisTime = exs.state.duration - prev.time;

  if (thisSplit > 1000) {
    if (thisTime > 0) {
      // if we have splits, or time isn't ridiculous, store the split
      // (otherwise we're initialising GPS and it's inaccurate)
      if (splits.length || thisTime > 1000 * 60)
        splits.push({ dist: thisSplit as Dist, time: thisTime as Time });
    }

    thisSplit %= 1000;
  }

  // subtract <how much we're over> off the next split notify
  exs.state.notify.dist.next -= thisSplit;

  S.writeJSON("pace.json", { splits });
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

Bangle.on('twist', () => {
  Bangle.setBacklight(1);
});

Bangle.on('tap', _e => {
  if(exs.state.active) return;

  const menu: Menu = {
    "": {
      remove: () => {
        draw();
      },
    },
    "< Back": () => {
      Bangle.setUI(); // calls `remove`, which handles redrawing
    },
    "Zero time": () => {
      exs.start(); // calls reset
      exs.stop(); // re-pauses
      Bangle.setUI();
    },
    "Clear splits": () => {
      splits.splice(0, splits.length);
      Bangle.setUI();
    },
  };

  E.showMenu(menu);
});

Bangle.loadWidgets();
Bangle.drawWidgets();

g.clearRect(Bangle.appRect);
draw();
}
