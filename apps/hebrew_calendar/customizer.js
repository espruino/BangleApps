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
  const json = serializeEvents(events);
  // console.debug(loadWatch(json))
}

function loadWatch(json) {
  sendCustomizedApp({
    id: "hebrew_calendar",

    storage: [
      { name: "-hebrew_calendar", content: `
			let hebrewCalendar = ${json};

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
			` },
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

onload(new Event("init")); // just for testing

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

function generateHebCal(latLon) {
  const location = new Location(
    ...latLon,
    document.querySelector("#inIL").checked
  );
  const options = {
    year: new Date().getFullYear(),
    isHebrewYear: false,
    candlelighting: true,
    location,
    addHebrewDates: true,
    addHebrewDatesForEvents: true,
  };

  const events = HebrewCalendar.calendar(options).map((ev) => {
    const { desc, eventTime, startEvent, endEvent } = ev;

    const zman = new Zmanim(ev.date, ...latLon.map(Number));

    let output = {
      greg: ev?.date?.greg().getTime(),
      desc,
      eventTime: eventTime?.getTime(),
      startEvent: startEvent?.eventTime || zman.gregEve().getTime(),
      endEvent: endEvent?.eventTime || zman.shkiah().getTime(),
    };

    if (eventTime) {
      delete output.startEvent;
      delete output.endEvent;
      delete output.greg;
    }

    return output;
  });

  // console.table(events)

  return events;
}

/**
 *
 * @param { {
			date: object,
			desc: string,
			eventTime: Date,
			location: object,
			startEvent: Date,
			endEvent: Date,
		}[]} events
 */
function serializeEvents(events) {
  return JSON.parse(JSON.stringify(events));
}
