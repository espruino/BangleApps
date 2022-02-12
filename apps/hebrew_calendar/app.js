// gets replaced during app customization
let hebrewCalendar = [
  {
    greg: 1640988000000,
    desc: "28 Tevet 5782",
    startEvent: 1640961929000,
    endEvent: 1641048371000,
  },
  { desc: "Havdalah", eventTime: 1641050760000 },
];

const dayInMS = 86400000;

g.clear(1);
Bangle.drawWidgets();

var Layout = require("Layout");
const Locale = require("locale");
var layout = function () {
  const now = Date.now();

  const current = hebrewCalendar.filter(
    (x) => x.startEvent < now && x.endEvent > now
  );

  const events = current.map((event) => {
    return {
      type: "txt",
      font: "6x8:2",
      label: event.desc,
      pad: 5,
      bgCol: g.theme.bg,
    };
  });

  const upcoming = hebrewCalendar
    .filter((x) => x.startEvent > now && x.startEvent < now + dayInMS)
    .slice(0, 3)
    .map((event) => {
      return {
        type: "txt",
        font: "6x8:2",
        label: event.desc,
        pad: 5,
        bgCol: g.theme.bg,
      };
    });

  return new Layout({
    type: "v",
    c: [
      {
        type: "txt",
        font: "6x8",
        label: "-- Hebrew Calendar Events --",
        pad: 2,
      },
      { type: "txt", font: "6x8", label: "Currently", pad: 2 },
    ]
      .concat(events)
      .concat([{ type: "txt", font: "6x8", label: "Upcoming", pad: 2 }])
      .concat(upcoming)
      .concat([
        { type: "txt", font: "6x8", label: "Gregorian", pad: 2 },
        {
          type: "txt",
          font: "6x8",
          label: Locale.date(new Date()) + " " + Locale.time(new Date(), 1),
          pad: 5,
          bgCol: g.theme.bg,
        },
      ]),
  });
};
layout().render();

setInterval(function () {
  layout().render();
}, 1000 * 60);
