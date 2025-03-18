{
  /* Requires */
  const weather = require('weather');
  require("Font6x12").add(Graphics);
  require("Font8x16").add(Graphics);
  const SETTINGS_FILE = "rebbleagenda.json";
  const settings = require("Storage").readJSON(SETTINGS_FILE, 1) || {'system':true, 'bg': '#fff','fg': '#000','acc': '#0FF'};

  /* Layout consts */
  const MARKER_SIZE = 4;
  const BORDER_SIZE = 6;
  const WIDGET_SIZE = 24;
  const PRIMARY_OFFSET = WIDGET_SIZE + BORDER_SIZE + MARKER_SIZE - 20 / 2;
  const SECONDARY_OFFSET = g.getHeight() - WIDGET_SIZE - 16 - 20;
  const MARKER_POS_UPPER = Uint8Array([g.getWidth() - BORDER_SIZE - MARKER_SIZE, WIDGET_SIZE + BORDER_SIZE + MARKER_SIZE]);
  const PIN_SIZE = 10;
  const ACCENT_WIDTH = 2 * BORDER_SIZE + 2 * MARKER_SIZE; // �=2r, borders each side.

  const TEXT_COLOR = settings.system?g.theme.fg:settings.fg;
  const BG_COLOR = settings.system?g.theme.bg:settings.bg;
  const ACCENT_COLOR = settings.system?g.theme.bgH:settings.acc;
  const SUN_COLOR_START = 0xF800;
  const SUN_COLOR_END = 0xFFE0;
  const SUN_FACE = 0x0000;

  /* Animation polygon sets*/
  const CLEAR_POLYS_1 = [
    new Uint8Array([0, 176, 0, 0, 176, 0, 176, 0, 0, 0, 0, 176]),
    new Uint8Array([0, 176, 0, 0, 176, 0, 170, 7, 10, 12, 7, 168]),
    new Uint8Array([0, 176, 0, 0, 176, 0, 139, 49, 41, 45, 43, 125]),
    new Uint8Array([0, 176, 0, 0, 176, 0, 90, 81, 82, 86, 85, 94]),
    new Uint8Array([0, 176, 0, 0, 176, 0, 91, 85, 85, 85, 85, 91])
  ];

  const CLEAR_POLYS_2 = [
    new Uint8Array([0, 176, 176, 176, 176, 0, 176, 0, 176, 176, 0, 176]),
    new Uint8Array([0, 176, 176, 176, 176, 0, 170, 7, 162, 161, 7, 168]),
    new Uint8Array([0, 176, 176, 176, 176, 0, 139, 49, 130, 126, 43, 125]),
    new Uint8Array([0, 176, 176, 176, 176, 0, 90, 81, 95, 89, 85, 94]),
    new Uint8Array([0, 176, 176, 176, 176, 0, 91, 85, 91, 91, 85, 91])
  ];

  const BREATHING_POLYS = [
    new Uint8Array([72, 88, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 84, 88]),
    new Uint8Array([63, 88, 64, 73, 78, 73, 78, 73, 78, 73, 78, 73, 92, 73, 93, 88]),
    new Uint8Array([60, 88, 56, 76, 78, 60, 78, 60, 78, 60, 78, 60, 100, 76, 96, 88]),
    new Uint8Array([56, 88, 50, 78, 64, 54, 78, 54, 78, 54, 92, 54, 106, 78, 100, 88]),
    new Uint8Array([53, 88, 47, 80, 52, 53, 78, 41, 78, 41, 104, 53, 109, 80, 103, 88]),
    new Uint8Array([50, 88, 43, 81, 43, 51, 63, 32, 92, 32, 113, 51, 113, 81, 106, 88])];
  const SUN_EYE_LEFT_POLY = new Uint8Array([56, 52, 64, 44, 72, 52, 72, 55, 69, 54, 64, 50, 58, 55, 56, 55]);
  const SUN_EYE_RIGHT_OFFSET = 30;
  const MOUTH_POLY = new Uint8Array([78, 77, 68, 75, 67, 73, 69, 71, 78, 73, 87, 71, 89, 73, 88, 75]);

  /* Animation timings */
  const TIME_CLEAR_ANIM = 400;
  const TIME_CLEAR_BREAK = 10;
  const TIME_DEFAULT_ANIM = 300;
  const TIME_BUMP_ANIM = 200;
  const TIME_EXIT_ANIM = 500;
  const TIME_EVENT_CHANGE = 150;
  const TIME_EVENT_BREAK_IN = 300;
  const TIME_EVENT_BREAK_ANIM = 800;
  const TIME_EVENT_BREAK_HALT = 500;
  const TIME_EVENT_BREAK_OUT = 500;

  /* Utility functions */

  /**
   * Check if two dates occur on the same day
   * @param {Date} d1 The first date to compare
   * @param {Date} d2 The second date to compare
   * @returns {Boolean} The two dates are on the same day
   */
  const isSameDay = function (d1, d2) {
    return (d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear());
  };

  /**
   * Apply sinusoidal easing to a value 0-1
   * @param {Number} x Number to ease
   * @returns {Number} Ease of x
   */
  const ease = function (x) {
    "jit";
    return 1 - (Math.cos(Math.PI * x) + 1) / 2;
  };

  /**
   * Map from 0-1 to a number interval
   * @param {Number} outMin Minimum output number
   * @param {Number} outMax Maximum output number
   * @param {Number} x Number between 0 and 1 to map from
   * @returns {Number} x mapped between min and max
   */
  const map = function (outMin, outMax, x) {
    "jit";
    return outMin + x * (outMax - outMin);
  };

  /**
   * Return [0-1] progress through an interval
   * @param {Number} start When the interval was started in ms
   * @param {Number} end When the interval is supposed to stop in ms
   * @returns {Number} Value between 0 and 1 reflecting progress through interval
   */
  const timeProgress = function (start, end) {
    "jit";
    const length = end - start;
    const delta = Date.now() - start;
    return Math.min(Math.max(delta / length, 0), 1);
  };

  /**
   * Interpolate between sets of polygon coordinates
   * @param {Array} polys An array of arrays, each containing an equally long set of coordinates
   * @param {Number} pos Progress through interpolation [0-1]
   * @returns {Array} Interpolation between the two closest sets of coordinates
   */
  const interpolatePoly = function (polys, pos) {
    const span = polys.length - 1;
    pos = pos * span;
    pos = pos > span ? span : pos;
    const upper = polys[Math.ceil(pos)];
    const lower = polys[Math.floor(Math.max(pos - 0.000001, 0))];
    const interp = pos - Math.floor(pos - 0.000001);
    return upper.map((up, i) => {
      return Math.round(up * interp + lower[i] * (1 - interp));
    });
  };

  /**
   * Repeatedly call callback with progress through an interval of length time
   * @param {Function} anim Callback which takes i, animation progress [0-1]
   * @param {Number} time How many ms the animation should last
   * @returns {void}
   */
  const doAnim = function (anim, time) {
    const animStart = Date.now();
    const animEnd = animStart + time;
    let i = 0;
    do {
      i = timeProgress(animStart, animEnd);
      anim(i);
    } while (i < 1);
    anim(1);
  };

  /* Screen draw functions */

  /**
   * Draw an event
   * @param {Number} index Index in the events array of event to draw
   * @param {Number} yOffset Vertical pixel offset of the draw
   * @param {Boolean} drawSecondary Should secondary event be drawn if possible?
   */
  const drawEvent = function (index, yOffset, drawSecondary) {
    g.setColor(TEXT_COLOR);
    // Draw the event time
    g.setFontAlign(-1, -1, 0);
    g.setFont("Vector", 20);
    g.drawString(events[index].time, BORDER_SIZE, PRIMARY_OFFSET + yOffset);

    // Draw the event title
    g.setFont("8x16");
    g.drawString(events[index].title, BORDER_SIZE, PRIMARY_OFFSET + 20 + yOffset);

    // And the event description
    g.setFont("6x12");
    g.drawString(events[index].description, BORDER_SIZE, PRIMARY_OFFSET + 20 + 12 + 2 + yOffset);

    // Draw a secondary event if asked to and exists
    if (drawSecondary) {
      if (index + 1 < events.length) {
        if (events[index].date != events[index + 1].date) {
          // If event belongs to another day, draw circle
          g.fillCircle((g.getWidth() - ACCENT_WIDTH) / 2, g.getHeight() - MARKER_SIZE - WIDGET_SIZE - BORDER_SIZE + yOffset, MARKER_SIZE);
        } else {
          // Draw event time and title
          g.setFont("Vector", 20);
          g.drawString(events[index + 1].time, BORDER_SIZE, SECONDARY_OFFSET + yOffset);
          g.setFont("8x16");
          g.drawString(events[index + 1].title, BORDER_SIZE, SECONDARY_OFFSET + 20 + yOffset);
        }
      } else {
        // If no more events exist, draw end
        g.setFontAlign(0, 1, 0);
        g.setFont("Vector", 20);
        g.drawString("End", (g.getWidth() - ACCENT_WIDTH) / 2, g.getHeight() - BORDER_SIZE + yOffset);
      }
    }
  };

  /**
   * Draw a two-line caption beneath a figure (Just beneath centre)
   * @param {String} first Top string to draw
   * @param {String} second Bottom string to draw
   * @param {Number} yOffset Vertical pixel offset of the draw
   */
  const drawFigureCaption = function (first, second, yOffset) {
    g.setFontAlign(0, -1, 0);
    g.setFont("Vector", 18);
    g.setColor(TEXT_COLOR);
    g.drawString(first, (g.getWidth() - ACCENT_WIDTH) / 2, g.getHeight() / 2 + BORDER_SIZE + yOffset);
    g.drawString(second, (g.getWidth() - ACCENT_WIDTH) / 2, g.getHeight() / 2 + BORDER_SIZE + 20 + yOffset);
  };

  /**
   * Clear the contents area of the default layout
   */
  const clearContent = function () {
    g.setColor(BG_COLOR);
    g.fillRect(0, 0, g.getWidth() - ACCENT_WIDTH - PIN_SIZE, g.getHeight());
  };

  /**
   * Draw the sun figure (above centre, in content area) 
   * @param {Number} progress Progress through the sun expansion animation, between 0 and 1
   * @param {Number} yOffset Vertical pixel offset of the draw
   */
  const drawSun = function (progress, yOffset) {
    const p = ease(progress);
    const sunColor = progress == 1 ? SUN_COLOR_END : g.blendColor(SUN_COLOR_START, SUN_COLOR_END, p);
    g.setColor(sunColor);
    g.fillPoly(g.transformVertices(interpolatePoly(BREATHING_POLYS, p), { y: yOffset }));

    if (progress > 0.6) {
      const faceP = ease((progress - 0.6) * 2.5);
      g.setColor(g.blendColor(sunColor, SUN_FACE, faceP));
      g.fillPoly(g.transformVertices(SUN_EYE_LEFT_POLY, { y: map(20, 0, faceP) + yOffset }));
      g.fillPoly(g.transformVertices(SUN_EYE_LEFT_POLY, { x: SUN_EYE_RIGHT_OFFSET, y: map(20, 0, faceP) + yOffset }));
      g.fillPoly(g.transformVertices(MOUTH_POLY, { y: map(10, 0, faceP) + yOffset }));
    }

    g.setColor(TEXT_COLOR);
    g.fillRect({
      x: map((g.getWidth() - ACCENT_WIDTH) / 2 - MARKER_SIZE, 20, p),
      y: map(g.getHeight() / 2 - MARKER_SIZE, g.getHeight() / 2 - MARKER_SIZE / 2, p) + yOffset,
      x2: map((g.getWidth() - ACCENT_WIDTH) / 2 + MARKER_SIZE, (g.getWidth() - ACCENT_WIDTH) - 20, p),
      y2: map(g.getHeight() / 2 + MARKER_SIZE / 2, g.getHeight() / 2, p) + yOffset
    });
  };

  /* Animation functions */

  /**
   * Animate clearing the screen to accent color with a single dot in the middle
   */
  const animClearScreen = function () {
    let oldPoly1 = CLEAR_POLYS_1[0];
    let oldPoly2 = CLEAR_POLYS_2[0];
    doAnim(i => {
      i = ease(i);
      const poly1 = interpolatePoly(CLEAR_POLYS_1, i);
      const poly2 = interpolatePoly(CLEAR_POLYS_2, i);
      // Fill in black line
      g.setColor(TEXT_COLOR);
      g.fillPoly(poly1);
      g.fillPoly(poly2);

      // Fill in outer shape
      g.setColor(ACCENT_COLOR);
      g.fillPoly(oldPoly1);
      g.fillPoly(oldPoly2);
      g.flip();

      // Save poly for next loop outer shape
      oldPoly1 = poly1;
      oldPoly2 = poly2;
    }, TIME_CLEAR_ANIM);

    // Draw circle
    g.setColor(TEXT_COLOR);
    g.fillCircle(g.getWidth() / 2, g.getHeight() / 2, MARKER_SIZE);
    g.flip();
  };

  /**
   * Animate from a cleared screen and dot to the default layout
   */
  const animDefaultScreen = function () {
    doAnim(i => {
      // Draw the circle moving into the corner
      i = ease(i);
      const circleX = map(g.getWidth() / 2, MARKER_POS_UPPER[0], i);
      const circleY = map(g.getHeight() / 2, MARKER_POS_UPPER[1], i);
      g.setColor(TEXT_COLOR);
      g.fillCircle(circleX, circleY, MARKER_SIZE);

      // Move the background poly in from the left
      g.setColor(BG_COLOR);
      const accentX = map(0, g.getWidth() - ACCENT_WIDTH, i);
      g.fillPoly([0, 0, accentX, 0, accentX, MARKER_POS_UPPER[1] - PIN_SIZE, accentX - PIN_SIZE, MARKER_POS_UPPER[1], accentX, MARKER_POS_UPPER[1] + PIN_SIZE, accentX, 176, 0, 176]);
      g.flip();

      // Clear the circle for the next loop
      g.setColor(ACCENT_COLOR);
      g.fillCircle(circleX, circleY, MARKER_SIZE + 2);
    }, TIME_DEFAULT_ANIM);

    // Finish up the circle
    const w = weather.get();
    if (w && (w.code || w.txt)) {
      doAnim(i => {
        weather.drawIcon(w, MARKER_POS_UPPER[0], MARKER_POS_UPPER[1], MARKER_SIZE * 2);
        g.setColor(TEXT_COLOR);
        g.fillCircle(MARKER_POS_UPPER[0], MARKER_POS_UPPER[1], MARKER_SIZE * ease(1 - i));
        g.flip();
      }, 100);
    } else {
      g.setColor(TEXT_COLOR);
      g.fillCircle(MARKER_POS_UPPER[0], MARKER_POS_UPPER[1], MARKER_SIZE);
    }
  };

  /**
   * Animate the sun figure expand or shrink fully
   * @param {Number} direction Direction in which to animate. +1 = Expand. -1 = Shrink
   */
  const animSun = function (direction) {
    doAnim(i => {
      // Clear and redraw just the sun area
      g.setColor(BG_COLOR);
      g.fillRect(0, 31, g.getWidth() - ACCENT_WIDTH - PIN_SIZE, g.getHeight() / 2 + 4);
      drawSun((direction == 1 ? 0 : 1) + i * direction, 0);
      g.flip();
    }, TIME_EVENT_BREAK_ANIM);
  };

  /**
   * Animate from centre dot to an event or backwards. Used for entering (forwards) or leaving (backwards) the day-change animation
   * @param {Number} index Index of the event to draw animate in or out
   * @param {Number} direction Direction of the animation. +1 = Event -> Dot. -1 = Dot -> Event
   */
  const animEventToMarker = function (index, direction) {
    doAnim(i => {
      let ei = direction == 1 ? ease(i) : ease(1 - i);
      clearContent();
      drawEvent(index, -(SECONDARY_OFFSET - PRIMARY_OFFSET) * ei, false);
      g.fillCircle((g.getWidth() - ACCENT_WIDTH) / 2, map(g.getHeight() - MARKER_SIZE - WIDGET_SIZE - BORDER_SIZE, g.getHeight() / 2, ei), MARKER_SIZE);
      g.flip();
    }, TIME_EVENT_BREAK_IN);

  };

  /**
   * Blit the current contents of content area out of screen, replacing it with something. Currently only for moving stuff upwards.
   * @param {Function} thing Callback for the new thing to draw on the screen
   * @param {Number} time How long the animation should last
   */
  const animBlitToX = function (thing, time) {
    let oldI = 0;
    doAnim(i => {
      // Move stuff out of frame, index into frame
      g.blit({
        x1: 0,
        y1: 0,
        w: g.getWidth() - ACCENT_WIDTH - PIN_SIZE,
        h: ease(1 - oldI) * g.getHeight(),
        x2: 0,
        y2: - (ease(i) - ease(oldI)) * g.getHeight(),
        setModified: true
      });
      g.setColor(BG_COLOR);
      // Only clear where old stuff no longer is
      g.fillRect(0, g.getHeight() * (1 - ease(i)), g.getWidth() - ACCENT_WIDTH - PIN_SIZE, g.getHeight());
      thing(i);
      g.flip();
      oldI = i;
    }, time);
  };

  /**
   * Transition between one event and another, showing a day-change animation if needed
   * @param {Number} startIndex The event index that we are animating out of
   * @param {Number} endIndex The event index that we are animating into
   */
  const animEventTransition = function (startIndex, endIndex) {
    if (events[startIndex].date == events[endIndex].date) {
      // If both events are within the same day, just scroll from one to the other.
      // First determine which event is on top and which direction we are animating in
      let topIndex = (startIndex < endIndex) ? startIndex : endIndex;
      let botIndex = (startIndex < endIndex) ? endIndex : startIndex;
      let direction = (startIndex < endIndex) ? 1 : -1;
      let offset = (startIndex < endIndex) ? 0 : 1;

      doAnim(i => {
        // Animate the two events moving towards their destinations
        clearContent();
        drawEvent(topIndex, -(SECONDARY_OFFSET - PRIMARY_OFFSET) * ease(offset + direction * i), false);
        drawEvent(botIndex, (SECONDARY_OFFSET - PRIMARY_OFFSET) - (SECONDARY_OFFSET - PRIMARY_OFFSET) * ease(offset + direction * i), true);
        g.flip();
      }, TIME_EVENT_CHANGE);

      // Finally, reset contents and redraw for good measure
      clearContent();
      drawEvent(endIndex, 0, true);
      g.flip();
    } else {
      // The events are on different days, trigger day-change animation
      if (startIndex < endIndex) {
        // Destination is later, Stuff moves upwards
        animEventToMarker(startIndex, 1); // The day-end dot moves to center of screen
        drawFigureCaption(events[endIndex].weekday, events[endIndex].date, 0); // Caption between sun appears, no need to continuously redraw
        animSun(1); // Animate the sun expanding
        doAnim(i => { }, TIME_EVENT_BREAK_HALT); // Wait for a moment
        animBlitToX(i => { drawEvent(endIndex, g.getHeight() - g.getHeight() * ease(i), true); }, TIME_EVENT_BREAK_OUT); // Blit the sun and caption out, replacing with destination event
      } else {
        // Destination is earlier, content moves downwards
        doAnim(i => {
          // Can't animBlit, draw sun and figure caption replacing origin event
          clearContent();
          drawEvent(startIndex, g.getHeight() * ease(i), true);
          drawSun(1, - g.getHeight() * ease(1 - i));
          drawFigureCaption(events[endIndex].weekday, events[endIndex].date, - g.getHeight() * ease(1 - i));
          g.flip();
        }, TIME_EVENT_BREAK_OUT);
        doAnim(i => { }, TIME_EVENT_BREAK_HALT); // Wait for a moment
        animSun(-1); // Collapse the sun
        animEventToMarker(endIndex, -1); // Animate from dot to destination event
      }
    }
    g.flip();
  };

  /**
   * Bump the event because we've reached an end
   * @param {Number} index The index of the event which we are currently at (probably last)
   * @param {Number} direction Which direction to bump. +1 = content moves down, then up. -1 = content moves up, back down
   */
  const animEventBump = function (index, direction) {
    doAnim(i => {
      clearContent();
      drawEvent(index, Math.sin(Math.PI * i) * 24 * direction, true);
      g.flip();
    }, TIME_BUMP_ANIM);
  };

  /**
   * Run the exit animation of the application
   */
  const animExit = function () {
    // First, move out (downwards) the current event
    doAnim(i => {
      clearContent();
      drawEvent(currentEventIndex, ease(i) * g.getHeight(), true);
      g.flip();
    }, TIME_EXIT_ANIM / 3 * 2);

    // Clear the screen leftwards with the accent color
    g.setColor(ACCENT_COLOR);
    doAnim(i => {
      g.fillRect(ease(1 - i) * g.getWidth(), 0, g.getWidth(), g.getHeight());
      g.flip();
    }, TIME_EXIT_ANIM / 3);
  };

  /**
   * Animate from empty default screen to the first event to show.
   * If the event we're moving to is not later today, show the date first.
   */
  const animFirstEvent = function () {
    if (!isSameDay(new Date(events[currentEventIndex].timestamp * 1000), new Date())) {
      drawFigureCaption(events[currentEventIndex].weekday, events[currentEventIndex].date, 0);
      animSun(1);
      doAnim(i => { }, TIME_EVENT_BREAK_HALT);
      animBlitToX(i => { drawEvent(currentEventIndex, g.getHeight() - g.getHeight() * ease(i), true); }, TIME_EVENT_BREAK_OUT, 1);
    } else {
      drawEvent(currentEventIndex, 0, true);
    }
  };

  /* Setup */

  /* Load events */
  const today = new Date();
  const tomorrow = new Date();
  const yesterday = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  yesterday.setDate(yesterday.getDate() - 1);
  g.setFont("6x12");
  const locale = require("locale");

  let events = (require("Storage").readJSON("android.calendar.json", true) || []).map(event => {
    // Title uses 8x16 font, 8 px wide characters. Limit title to fit on a line.
    let title = event.title;
    if (title.length > (g.getWidth() - 2 * BORDER_SIZE - ACCENT_WIDTH) / 8) {
      title = title.slice(0, ((g.getWidth() - 2 * BORDER_SIZE - ACCENT_WIDTH) / 8) - 3) + "...";
    }

    // Wrap description to fit four lines of content 
    let description = g.wrapString(event.description, g.getWidth() - 2 * BORDER_SIZE - ACCENT_WIDTH - PIN_SIZE).slice(0, 4).join("\n");

    // Set weekday text
    let eventDate = new Date(event.timestamp * 1000);
    let weekday = locale.dow(eventDate);
    if (isSameDay(eventDate, today)) {
      weekday = /*LANG*/"Today";
    } else if (isSameDay(eventDate, tomorrow)) {
      weekday = /*LANG*/"Tomorrow";
    } else if (isSameDay(eventDate, yesterday)) {
      weekday = /*LANG*/"Yesterday";
    }

    return {
      timestamp: event.timestamp,
      weekday: weekday,
      date: locale.date(eventDate, 1),
      time: locale.time(eventDate, 1) + locale.meridian(eventDate),
      title: title,
      description: description
    };
  }).sort((a, b) => { return a.timestamp - b.timestamp; });

  // If no events, add a note.
  if (events.length == 0) {
    events[0] = {
      timestamp: Date.now() / 1000,
      weekday: /*LANG*/"Today",
      date: require("locale").date(new Date(), 1),
      time: require("locale").time(new Date(), 1),
      title: /*LANG*/"No events",
      description: /*LANG*/"Nothing to do"
    };
  }

  // We should start at the first event later than now
  let currentEventIndex = events.findIndex((event) => { return event.timestamp * 1000 > Date.now(); });
  if (currentEventIndex == -1) currentEventIndex = 0; // Or just first event if none found

  // Setup the UI with remove to support fast load
  Bangle.setUI({
    mode: "custom",
    btn: () => { animExit(); Bangle.load(); },
    remove: function () {
      require("widget_utils").show();
      delete Graphics.prototype.Font6x12;
      delete Graphics.prototype.Font8x16;
      Bangle.removeListener('swipe', onSwipe);
    },
  });

  /**
  * Callback for swipe gesture. Transitions between adjacent events.
  * @param {Number} directionLR Unused.
  * @param {Number} directionUD Whether swipe direction is up or down
  */
  const onSwipe = function (directionLR, directionUD) {
    if (directionUD == -1) {
      // Swiping up
      if (currentEventIndex + 1 < events.length) {
        // Animate to the next event
        animEventTransition(currentEventIndex, currentEventIndex + 1);
        currentEventIndex += 1;
      } else {
        // We've hit the end, bump
        animEventBump(currentEventIndex, -1);
      }
    } else if (directionUD == 1) {
      //Swiping down
      if (currentEventIndex > 0) {
        // Animate to the previous event
        animEventTransition(currentEventIndex, currentEventIndex - 1);
        currentEventIndex -= 1;
      } else {
        // If swiping earlier than earliest event, exit back to watchface
        animExit();
        Bangle.load();
      }
    }
  };

  // Ready animations for showing the first event, then register swipe listener for switching events
  setTimeout(() => {
    animDefaultScreen();
    animFirstEvent();
    Bangle.on('swipe', onSwipe);
  }, TIME_CLEAR_ANIM + TIME_CLEAR_BREAK);
  animClearScreen(); // Start visible changes by clearing the screen

  // Load and hide widgets to background
  Bangle.loadWidgets();
  require("widget_utils").hide();
}