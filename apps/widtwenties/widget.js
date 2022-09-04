// WIDGETS = {}; // <-- for development only

/* run widgets in their own function scope so
they don't interfere with currently-running apps */
(() => {
  const move = 20 * 60 * 1000; // 20 minutes
  const look = 20 * 1000;      // 20 seconds

  buzz = _ => {
    Bangle.buzz().then(_ => {
      setTimeout(Bangle.buzz, look);
    });
  };

  // add widget
  WIDGETS.twenties = {
    buzz: buzz,
    draw: _ => { return null; },
  };

  setInterval(WIDGETS.twenties.buzz, move); // buzz to stand / sit
})();

// Bangle.drawWidgets(); // <-- for development only