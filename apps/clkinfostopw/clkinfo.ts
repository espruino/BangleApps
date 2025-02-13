(() => {
  let durationOnPause = "---";
  let redrawInterval: IntervalId | undefined;
  let startTime: number | undefined;
  let showMillis = true;
  const milliTime = 60;

  const unqueueRedraw = () => {
    if (redrawInterval) clearInterval(redrawInterval);
    redrawInterval = undefined;
  };

  const queueRedraw = function(this: ClockInfo.MenuItem) {
    unqueueRedraw();
    redrawInterval = setInterval(() => {
        if (startTime) {
            if (showMillis && Date.now() - startTime > milliTime * 1000) {
                showMillis = false;
                changeInterval(redrawInterval!, 1000);
            }
        } else {
            unqueueRedraw();
        }
        this.emit('redraw')
    }, 100);
  };

  const pad2 = (s: number) => ('0' + s.toFixed(0)).slice(-2);

  const duration = (start: number) => {
    let seconds = (Date.now() - start) / 1000;

    if (seconds < milliTime)
      return seconds.toFixed(1);

    let mins = seconds / 60;
    seconds %= 60;

    if (mins < 60)
      return `${mins.toFixed(0)}:${pad2(seconds)}`;

    let hours = mins / 60;
    mins %= 60;

    return `${hours.toFixed(0)}:${pad2(mins)}:${pad2(seconds)}`;
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
        show: function(this: ClockInfo.MenuItem) {
          if(startTime){ // only queue if active
            queueRedraw.call(this);
          }else{
            this.emit('redraw')
          }
        },
        hide: unqueueRedraw,
        run: function() { // tapped
          if (startTime) {
            durationOnPause = duration(startTime);
            startTime = undefined; // this also unqueues the redraw
          } else {
            queueRedraw.call(this);
            showMillis = true;
            startTime = Date.now();
          }
        }
      }
    ]
  };
}) satisfies ClockInfoFunc // FIXME: semi-colon added automatically when Typescript generates Javascript file?
