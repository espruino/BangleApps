((): ClockInfo.Menu => {
  let durationOnPause = "---";
  let redrawInterval: number | undefined;
  let startTime: number | undefined;

  const unqueueRedraw = () => {
    if (redrawInterval) clearInterval(redrawInterval);
    redrawInterval = undefined;
  };

  const queueRedraw = function(this: ClockInfo.MenuItem) {
    unqueueRedraw();
    redrawInterval = setInterval(() => this.emit('redraw'), 100);
  };

  const pad2 = (s: number) => ('0' + s.toFixed(0)).slice(-2);

  const duration = (start: number) => {
    let seconds = (Date.now() - start) / 1000;

    if (seconds < 60)
      return seconds.toFixed(1);

    let mins = seconds / 60;
    seconds %= 60;

    if (mins < 60)
      return `${pad2(mins)}m${pad2(seconds)}s`;

    let hours = mins / 60;
    mins %= 60;

    return `${Math.round(hours)}h${pad2(mins)}m${pad2(seconds)}s`;
  };

  const img = () => atob("GBiBAAAAAAB+AAB+AAAAAAB+AAH/sAOB8AcA4A4YcAwYMBgYGBgYGBg8GBg8GBgYGBgAGAwAMA4AcAcA4AOBwAH/gAB+AAAAAAAAAA==");

  return {
    name: "timer",
    img: img(),
    items: [
      {
        name: "stopw",
        get: () => ({
          text: startTime
            ? duration(startTime)
            : durationOnPause,
          img: img(),
        }),
        show: queueRedraw,
        hide: unqueueRedraw,
        run: function() { // tapped
          if (startTime) {
            durationOnPause = duration(startTime);
            startTime = undefined;
            unqueueRedraw();
          } else {
            queueRedraw.call(this);
            startTime = Date.now();
          }
        }
      }
    ]
  };
})
