exports.input = function(options) {
  options = options||{};
  var selectedDate;
  if (options.datetime instanceof Date) {
    selectedDate = new Date(options.datetime.getTime());
  } else {
    selectedDate = new Date();
    selectedDate.setMinutes(0);
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);
    selectedDate.setHours(selectedDate.getHours() + 1);
  }

  var R;
  var tip = {w: 12, h: 10};
  var arrowRectArray;
  var dragging = null;
  var startPos = null;
  var dateAtDragStart = null;
  var SELECTEDFONT = '6x8:2';

  function drawDateTime() {
    g.clearRect(R.x+tip.w,R.y,R.x2-tip.w,R.y+40);
    g.clearRect(R.x+tip.w,R.y2-60,R.x2-tip.w,R.y2-40);

    g.setFont(SELECTEDFONT).setColor(g.theme.fg).setFontAlign(-1, -1, 0);
    var dateUtils = require('date_utils');
    g.drawString(selectedDate.getFullYear(), R.x+tip.w+10, R.y+15)
    .drawString(dateUtils.month(selectedDate.getMonth()+1,1), R.x+tip.w+65, R.y+15)
    .drawString(selectedDate.getDate(), R.x2-tip.w-40, R.y+15)
    .drawString(`${dateUtils.dow(selectedDate.getDay(), 1)}  ${selectedDate.toLocalISOString().slice(11,16)}`, R.x+tip.w+10, R.y2-60);
  }

  let dragHandler = function(event) {
    "ram";

    if (event.b) {
      if (dragging === null) {
        // determine which component we are affecting
        var rect = arrowRectArray.find(rect => rect.y2
          ? (event.y >= rect.y && event.y <= rect.y2 && event.x >= rect.x - 10 && event.x <= rect.x + tip.w + 10)
          : (event.x >= rect.x && event.x <= rect.x2 && event.y >= rect.y - tip.w - 5 && event.y <= rect.y + 5));
        if (rect) {
          dragging = rect;
          startPos = dragging.y2 ? event.y : event.x;
          dateAtDragStart = selectedDate;
        }
      }

      if (dragging) {
        dragging.swipe(dragging.y2 ? startPos - event.y : event.x - startPos);
        drawDateTime();
      }
    } else {
      dateAtDragStart = null;
      dragging = null;
      startPos = null;
    }
  };

  let catchSwipe = ()=>{
    E.stopEventPropagation&&E.stopEventPropagation();
  };

  return new Promise((resolve,reject) => {
    // Interpret touch input
    Bangle.setUI({
      mode: 'custom',
      back: ()=>{
        Bangle.setUI();
        Bangle.prependListener&&Bangle.removeListener('swipe', catchSwipe); // Remove swipe listener if it was added with `Bangle.prependListener()` (fw2v19 and up).
        g.clearRect(Bangle.appRect);
        resolve(selectedDate);
      },
      drag: dragHandler
    });
    Bangle.prependListener&&Bangle.prependListener('swipe', catchSwipe); // Intercept swipes on fw2v19 and later. Should not break on older firmwares.

    R = Bangle.appRect;
    g.clear();
    Bangle.loadWidgets();
    Bangle.drawWidgets();

    function drawArrow(rect) {
      if(rect.x2) {
        g.fillRect(rect.x + tip.h, rect.y - tip.w + 4, rect.x2 - tip.h, rect.y - 4)
        .fillPoly([rect.x + tip.h, rect.y, rect.x + tip.h, rect.y - tip.w, rect.x, rect.y - (tip.w / 2)])
        .fillPoly([rect.x2-tip.h, rect.y, rect.x2 - tip.h, rect.y - tip.w, rect.x2, rect.y - (tip.w / 2)]);
      } else {
        g.fillRect(rect.x + 4, rect.y + tip.h, rect.x + tip.w - 4, rect.y2 - tip.h)
        .fillPoly([rect.x, rect.y + tip.h, rect.x + tip.w, rect.y + tip.h, rect.x + (tip.w / 2), rect.y])
        .fillPoly([rect.x, rect.y2 - tip.h, rect.x + tip.w, rect.y2 - tip.h, rect.x + (tip.w / 2), rect.y2]);
      }

    }

    var yearArrowRect = {x: R.x, y: R.y, y2: R.y + (R.y2 - R.y) * 0.4, swipe: d => {
      selectedDate = new Date(dateAtDragStart.valueOf());
      selectedDate.setFullYear(dateAtDragStart.getFullYear() + Math.floor(d/10));
      if (dateAtDragStart.getDate() != selectedDate.getDate()) selectedDate.setDate(0);
    }};

    var weekArrowRect = {x: R.x, y: yearArrowRect.y2 + 10, y2: R.y2 - tip.w - 5, swipe: d => {
      selectedDate = new Date(dateAtDragStart.valueOf());
      selectedDate.setDate(dateAtDragStart.getDate() + (Math.floor(d/10) * 7));
    }};

    var dayArrowRect = {x: R.x2 - tip.w, y: R.y, y2: R.y + (R.y2 - R.y) * 0.4, swipe: d => {
      selectedDate = new Date(dateAtDragStart.valueOf());
      selectedDate.setDate(dateAtDragStart.getDate() + Math.floor(d/10));
    }};

    var fifteenMinutesArrowRect = {x: R.x2 - tip.w, y: dayArrowRect.y2 + 10, y2: R.y2 - tip.w - 5, swipe: d => {
      selectedDate = new Date(dateAtDragStart.valueOf());
      selectedDate.setMinutes((((dateAtDragStart.getMinutes() - (dateAtDragStart.getMinutes() % 15) + (Math.floor(d/14) * 15)) % 60) + 60) % 60);
    }};

    var weekdayArrowRect = {x: R.x, y: R.y2, x2: (R.x2 - R.x) * 0.3 - 5, swipe: d => {
      selectedDate = new Date(dateAtDragStart.valueOf());
      selectedDate.setDate(dateAtDragStart.getDate() + Math.floor(d/10));
    }};

    var hourArrowRect = {x: weekdayArrowRect.x2 + 5, y: R.y2, x2: weekdayArrowRect.x2 + (R.x2 - R.x) * 0.38, swipe: d => {
      selectedDate = new Date(dateAtDragStart.valueOf());
      selectedDate.setHours((((dateAtDragStart.getHours() + Math.floor(d/10)) % 24) + 24) % 24);
    }};

    var minutesArrowRect = {x: hourArrowRect.x2 + 5, y: R.y2, x2: R.x2, swipe: d => {
      selectedDate = new Date(dateAtDragStart.valueOf());
      selectedDate.setMinutes((((dateAtDragStart.getMinutes() + Math.floor(d/7)) % 60) + 60) % 60);
    }};

    var monthArrowRect = {x: (R.x2 - R.x) * 0.2, y: R.y2 / 2 + 5, x2: (R.x2 - R.x) * 0.8, swipe: d => {
      selectedDate = new Date(dateAtDragStart.valueOf());
      selectedDate.setMonth(dateAtDragStart.getMonth() + Math.floor(d/10));
      if (dateAtDragStart.getDate() != selectedDate.getDate()) selectedDate.setDate(0);
    }};

    arrowRectArray = [yearArrowRect, weekArrowRect, dayArrowRect, fifteenMinutesArrowRect,
                  weekdayArrowRect, hourArrowRect, minutesArrowRect, monthArrowRect];

    drawDateTime();
    arrowRectArray.forEach(drawArrow);
  });
};
