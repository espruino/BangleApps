import {
  HebrewCalendar,
  HDate,
  Location,
  Zmanim,
} from "https://cdn.skypack.dev/@hebcal/core";

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
        name: "-hebrew_calendar",
        content: `
let hebrewCalendar = ${json};

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
  return Locale.date(new Date()) + " " + Locale.time(new Date(), 1);
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

setInterval(updateCalendar, dayInMS / 12);

Bangle.setUI("clock");
			`,
      },
      {
        name: "+hebrew_calendar",
        content: JSON.stringify({
          name: "hebrew_calendar",
          icon: "*hebrew_calendar",
          src: "-hebrew_calendar",
        }),
      },
      {
        name: "*hebrew_calendar",
        content: `require("heatshrink").decompress(atob("mEw4UA////G161hyd8Jf4ALlQLK1WABREC1WgBZEK32oFxPW1QuJ7QwIFwOqvQLHhW31NaBY8qy2rtUFoAuG3W61EVqALF1+qr2gqtUHQu11dawNVqo6F22q9XFBYIwEhWqz2r6oLBGAheBqwuBBYx2CFwQLGlWqgoLCMAsKLoILChR6EgQuDqkqYYsBFweqYYoLDoWnYYoLD/WVYYv8FwXqPoIwEn52BqGrPoILEh/1FwOl9SsBBYcD/pdB2uq/QvEh/8LoOu1xHFh8/gGp9WWL4oMBgWltXeO4owBgWt1ReFYYh2GYYmXEQzDD3wiHegYKIGAJRGAAguJAH4AC"))
			`,
        evaluate: true,
      },
    ],
  });
}

document
  .querySelector("button[type=submit]")
  .addEventListener("click", onload, false);

document.querySelector(
  "#hDate"
).innerText = `Today is ${new Date().toLocaleDateString()} & ${new HDate().toString()}`;

function getLatLonFromForm() {
  const elements = [
    document.querySelector("#lat"),
    document.querySelector("#lon"),
  ];
  const latLon = elements.map((el) => el.value);
  console.debug(latLon);
  if (elements.every((x) => x.checkValidity())) {
    console.debug("lat lon all good");
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
  return JSON.parse(JSON.stringify(events));
}
