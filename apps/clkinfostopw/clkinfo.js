(() => {
  let durationOnPause = "---";
  let redrawInterval;
  let startTime;

  const unqueueRedraw = () => {
    if (redrawInterval) clearInterval(redrawInterval);
    redrawInterval = undefined;
  };

  const queueRedraw = function() {
    unqueueRedraw();
    redrawInterval = setInterval(() => this.emit('redraw'), 100);
  };

  const duration = () => ((Date.now() - startTime) / 1000).toFixed(1);

  return {
    name: "timer",
    items: [
      {
        name: "stopw",
        get: () => ({
          text: startTime
            ? duration()
            : durationOnPause,
          img: atob("GBiBAAAAAAB+AAB+AAAAAAB+AAH/sAOB8AcA4A4YcAwYMBgYGBgYGBg8GBg8GBgYGBgAGAwAMA4AcAcA4AOBwAH/gAB+AAAAAAAAAA==")
        }),
        show: queueRedraw,
        hide: unqueueRedraw,
        run: function() { // tapped
          if (startTime) {
            durationOnPause = duration();
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
