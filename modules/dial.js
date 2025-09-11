function dial(cb, options) {
  "ram";
  const SCREEN_W = g.getWidth();
  const SCREEN_H = g.getHeight();

  options = Object.assign(
    { stepsPerWholeTurn : 7, // 7 chosen as it felt the best in use.
      dialRect : {
        x: 0,
        y: 0,
        w: SCREEN_W,
        h: SCREEN_H,
      },
    }, options);

  const DIAL_RECT = options.dialRect;

  const CENTER = {
    x: DIAL_RECT.x + DIAL_RECT.w / 2,
    y: DIAL_RECT.y + DIAL_RECT.h / 2,
  };

  const BASE_SCREEN_W = 176;
  const STEPS_PER_TURN = options.stepsPerWholeTurn;
  const BASE_THRESHOLD = 50;
  const THRESHOLD =
    BASE_THRESHOLD *
      (10 / STEPS_PER_TURN) *
      (DIAL_RECT.w / BASE_SCREEN_W);

  let cumulative = 0;

  function onDrag(e) {
    "ram";

    if (
      e.x < DIAL_RECT.x ||
        e.x > DIAL_RECT.x+DIAL_RECT.w-1 ||
        e.y < DIAL_RECT.y ||
        e.y > DIAL_RECT.y+DIAL_RECT.h-1
    ) {
      return;
    }

    if (e.y < CENTER.y) {
      cumulative += e.dx;
    } else {
      cumulative -= e.dx;
    }

    if (e.x < CENTER.x) {
      cumulative -= e.dy;
    } else {
      cumulative += e.dy;
    }

    function stepHandler(step) {
      cumulative -= THRESHOLD * step;
      cb(step);
    }

    while (cumulative > THRESHOLD) {
      stepHandler(1);
    }
    while (cumulative < -THRESHOLD) {
      stepHandler(-1);
    }

    E.stopEventPropagation();
  }

  return onDrag;
}

exports = dial;
