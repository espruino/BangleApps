const dayInMS = 86400000;

var Layout = require("Layout");
const Locale = require("locale");

function getCurrentEvents() {
  const now = Date.now();

  const current = hebrewCalendar.filter(
    (x) => x.startEvent < now && x.endEvent > now
  );

  return current.map((event) => {
    return {
      type: "txt",
      font: "12x20",
      id: "currentEvents",
      label: event.desc,
      pad: 5,
      bgCol: g.theme.bg,
    };
  });
}

function getUpcomingEvents() {
  const now = Date.now();

  const futureEvents = hebrewCalendar
    .filter((x) => x.startEvent > now && x.startEvent < now + dayInMS);

  let warning;
  let eventsLeft = hebrewCalendar
    .filter((x) => x.startEvent > now && x.startEvent < now + dayInMS*14).length;

  if (eventsLeft < 14) {
    warning = {
        startEvent: 0,
        type: "txt",
        font: "4x6",
        id: "warning",
        label: 'only '+ eventsLeft+' events left in calendar; update soon',
        pad: 5,
        bgCol: g.theme.bg,
      };
  }

  return futureEvents
    .slice(0, 5)
    .map((event) => {
      return {
        startEvent: event.startEvent,
        type: "txt",
        font: "4x6",
        id: "upcomingEvents",
        label: event.desc + " at " + Locale.time(new Date(event.startEvent), 1),
        pad: 5,
        bgCol: g.theme.bg,
      };
    })
    .concat(warning)
    .sort(function (a, b) {
      return a.startEvent - b.startEvent;
    });
}

function dateTime() {
  return Locale.dow(new Date(), 1) + ' ' + Locale.date(new Date(), 1) + " " + Locale.time(new Date(), 1);
}

let layout = new Layout(
  {
    type: "v",
    c: [
      {
        type: "txt",
        font: "6x8",
        id: "title",
        label: "-- Hebrew Calendar Events --",
        pad: 2,
        bgCol: g.theme.bg2,
      },
      {
        type: "txt",
        font: "6x8",
        id: "currently",
        label: "Currently",
        pad: 2,
        bgCol: g.theme.bgH,
      },
    ]
      .concat(getCurrentEvents())
      .concat([
        {
          type: "txt",
          font: "6x8",
          label: "Upcoming",
          id: "upcoming",
          pad: 2,
          bgCol: g.theme.bgH,
        },
      ])
      .concat(getUpcomingEvents())
      .concat([
        {
          type: "txt",
          font: "6x8",
          id: "gregorian",
          label: "Gregorian",
          pad: 2,
          bgCol: g.theme.bg2,
        },
        {
          type: "txt",
          font: "6x8",
          id: "time",
          label: dateTime(),
          pad: 5,
          bgCol: undefined,
        },
      ]),
  },
  { lazy: true }
);

// see also https://www.espruino.com/Bangle.js+Layout#updating-the-screen

// timeout used to update every minute
let drawTimeout;

function draw() {
  layout.time.label = dateTime();
  layout.render();

  // schedule a draw for the next minute
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    draw();
    console.log("updated time");
  }, 60000 - (Date.now() % 60000));
}

// update time and draw
g.clear();
Bangle.drawWidgets();
draw();

function updateCalendar() {
  layout.upcomingEvents = getUpcomingEvents();
  layout.currentEvents = getCurrentEvents();
  layout.render();
  console.log("updated events");
}

setTimeout(updateCalendar, 500);

setInterval(updateCalendar, 1000*60*30);

Bangle.setUI("clock");