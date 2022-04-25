import {
  HebrewCalendar,
  HDate,
  Location,
  Zmanim,
} from "https://cdn.skypack.dev/@hebcal/core@^3?min";

function onload(event) {
  event.preventDefault();
  const latLon = getLatLonFromForm();
  const events = generateHebCal(latLon);
  const calendar = serializeEvents(events);
  console.debug(calendar);
  globalThis["cal"] = calendar;
  loadWatch(calendar);
}

function loadWatch(json) {
  sendCustomizedApp({
    id: "hebrew_calendar",

    storage: [
      {
        name: "hebrew_calendar.app.js",
        url: "app.js",
        // content below is same as app.js except for the first line which customizes the hebrewCalendar object used
        content: `
let hebrewCalendar = ${json};

const dayInMS = 86400000;

const DateProvider = { now: () => Date.now() };

const Layout = require("Layout");
const Locale = require("locale");

let nextEndingEvent;

function getCurrentEvents() {
  const now = DateProvider.now();

  const current = hebrewCalendar.filter(
    (x) => x.startEvent <= now && x.endEvent >= now
  );

  nextEndingEvent = current.reduce((acc, ev) => {
    return Math.min(acc, ev.endEvent);
  }, Infinity);

  return current.map((event, i) => {
    return {
      type: "txt",
      font: "12x20",
      id: "currentEvents" + i,
      label: event.desc,
      pad: 2,
      bgCol: g.theme.bg,
    };
  });
}

function getUpcomingEvents() {
  const now = DateProvider.now();

  const futureEvents = hebrewCalendar.filter(
    (x) => x.startEvent >= now && x.startEvent <= now + dayInMS
  );

  let warning;
  let eventsLeft = hebrewCalendar.filter(
    (x) => x.startEvent >= now && x.startEvent <= now + dayInMS * 14
  ).length;

  if (eventsLeft < 14) {
    warning = {
      startEvent: 0,
      type: "txt",
      font: "4x6",
      id: "warning",
      label: "only " + eventsLeft + " events left in calendar; update soon",
      pad: 2,
      bgCol: g.theme.bg,
    };
  }

  return futureEvents
    .slice(0, 2)
    .map((event, i) => {
      return {
        startEvent: event.startEvent,
        type: "txt",
        font: "6x8",
        id: "upcomingEvents" + 1,
        label: event.desc + " at " + Locale.time(new Date(event.startEvent), 1),
        pad: 2,
        bgCol: g.theme.bg,
      };
    })
    .concat(warning)
    .sort(function (a, b) {
      return a.startEvent - b.startEvent;
    });
}

function dateTime() {
  return (
    Locale.dow(new Date(), 1) +
    " " +
    Locale.date(new Date(), 1) +
    " " +
    Locale.time(new Date(), 1)
  );
}

function makeLayout() {
  return new Layout(
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
            font: "Vector14",
            id: "time",
            label: dateTime(),
            pad: 2,
            bgCol: undefined,
          },
        ]),
    },
    { lazy: true }
  );
}
let layout = makeLayout();
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
  }, 60000 - (DateProvider.now() % 60000));
  console.log("updated time");
}

// update time and draw
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();

function findNextEvent() {
  return hebrewCalendar.find((ev) => {
    return ev.startEvent > DateProvider.now();
  });
}

function updateCalendar() {
  layout.clear();
  layout = makeLayout();
  layout.forgetLazyState();
  layout.render();

  let nextChange = Math.min(
    findNextEvent().startEvent - DateProvider.now() + 5000,
    nextEndingEvent - DateProvider.now() + 5000
  );
  setTimeout(updateCalendar, nextChange);
  console.log("updated events");
}

updateCalendar();

Bangle.setUI("clock");
			`,
      },
    ],
  });
}

document
  .querySelector("button[type=submit]")
  .addEventListener("click", onload, false);

document.querySelector("#geoloc")?.addEventListener("click", (event) => {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const {
        coords: { latitude, longitude },
      } = pos;
      locationElements[0].value = latitude;
      locationElements[1].value = longitude;
      console.debug(pos);
    },
    (err) => {
      if (err.PERMISSION_DENIED) {
        alert("permission required to use geolocation api; enter manually");
      }
      if (err.POSITION_UNAVAILABLE) {
        alert("position unavailable; enter manually");
      }
    },
    { enableHighAccuracy: false }
  );
});

document.querySelector(
  "#hDate"
).innerText = `Today is ${new Date().toLocaleDateString()} & ${new HDate().toString()}`;

const locationElements = [
  document.querySelector("#lat"),
  document.querySelector("#lon"),
];

function getLatLonFromForm() {
  const latLon = locationElements.map((el) => el.value);
  if (locationElements.every((x) => x.checkValidity())) {
    return latLon;
  } else {
    console.debug("lat lon invalid error");
    return [0, 0];
  }
}

function groupBy(arr, fn) {
  return arr
    .map(typeof fn === "function" ? fn : (val) => val[fn])
    .reduce((acc, val, i) => {
      acc[val] = (acc[val] || []).concat(arr[i]);
      return acc;
    }, {});
}

function generateHebCal(latLon) {
  const location = new Location(
    ...latLon,
    document.querySelector("#inIL").checked
  );

  const now = new Date();

  const options = {
    year: now.getFullYear(),
    isHebrewYear: false,
    candlelighting: true,
    location,
    addHebrewDates: true,
    addHebrewDatesForEvents: true,
    sedrot: true,
    start: now,
    end: new Date(now.getFullYear(), now.getMonth() + 3),
  };

  const events = HebrewCalendar.calendar(options).map((ev) => {
    const { desc, eventTime, startEvent, endEvent } = ev;

    const zman = new Zmanim(ev.date, ...latLon.map(Number));

    let output = {
      desc,
      startEvent: startEvent?.eventTime?.getTime() || zman.gregEve().getTime(),
      endEvent: endEvent?.eventTime?.getTime() || zman.shkiah().getTime(),
    };

    if (eventTime) {
      delete output.startEvent;
      delete output.endEvent;
      output.startEvent = eventTime.getTime();
      output.endEvent = eventTime.getTime() + 60000 * 15;
    }

    return output;
  });

  // console.table(events)

  return events.sort((a, b) => {
    return a.startEvent - b.startEvent;
  });
}

function enc(data) {
  return btoa(heatshrink.compress(new TextEncoder().encode(data)));
}

function serializeEvents(events) {
  // const splitByGregorianMonth = groupBy(events, (evt) => {
  //   return new Date(evt.startEvent).getMonth();
  // });
  return JSON.stringify(events);
}
