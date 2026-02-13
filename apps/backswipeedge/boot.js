{
  let sui = Bangle.setUI;
  let back = null;
  Bangle.setUI = function(mode, cb) {
    if (typeof mode == "object" && typeof mode.back == "function") {
      back = mode.back;
    } else {
      back = null;
    }
    sui(mode, cb);
  };
  
  let cal = {};
  {
    // touchscreen coords are calculated from calibration like this:
    // touchXCalibrated = (touchXRaw - touchX1) * g.getWidth() / (touchX2 - touchX1)
    // so we need to do:
    // touchXRaw = touchX1 + ((touchXCalibrated * (touchX2 - touchX1)) / g.getWidth())
    // precalculate as much as possible
    let opts = Bangle.getOptions();
    let x1 = opts.touchX1;
    let x2 = opts.touchX2;
    cal.add = x1;
    cal.mult = (x2 - x1) / g.getWidth();
  }
  
  // drag started
  let drag = false;
  // backswipe triggered
  let trig = false;

  Bangle.prependListener("drag", (e) => {
    // do nothing when showing the clock
    if (Bangle.CLOCK === 1) {
      drag = false;
      trig = false;
      return;
    }
    // undo touch screen calibration
    let x = (cal.add + e.x * cal.mult ) | 0;
    // where did the drag event start?
    let xBefore = x - e.dx;
    if (xBefore >= 173) {
      // drag from the right side of the screen started
      drag = true;
    }
    if (!drag) return;
    E.stopEventPropagation();
    if (!trig) {
      if (x <= 135) {
        // dragged enough to the left to trigger backswipe
        // will go back on finger up
        trig = true;
        Bangle.buzz(50, 0.6);
      }
    } else {
      if (x >= 140) {
        // dragged enough to the right to cancel backswipe
        trig = false;
        Bangle.buzz(50, 0.6);
      }
    }
    if (e.b == 0) {
      if (trig) {
        if (back != null) {
          back();
        } else {
          Bangle.load();
        }
      }
      drag = false;
      trig = false;
    }
  });
  Bangle.prependListener("swipe", (lr, ud) => {
    if (drag && lr == -1) {
      // backswipe drag is already started
      // eat this event
      E.stopEventPropagation();
    }
  });
}
