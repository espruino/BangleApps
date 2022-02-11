import { HebrewCalendar, HDate, Location, Zmanim } from 'https://cdn.skypack.dev/@hebcal/core';

function onload (event) {
	event.preventDefault();
	const latLon = getLatLonFromForm();
	const events = generateHebCal(latLon);
	console.debug(serializeEvents(events), events.slice(0,5));
}

onload(new Event('init'));

document.querySelector("button[type=submit]").addEventListener("click", onload, false);

document.querySelector('#hDate').innerText = `Today is ${new Date().toLocaleDateString()} & ${new HDate().toString()}`;

function getLatLonFromForm() {
	const elements = [document.querySelector('#lat'), document.querySelector('#lon')];
	const latLon = elements.map(el => el.value);
	console.debug(latLon);
	if (elements.every(x => x.checkValidity())) {
		console.debug('lat lon all good')
		return latLon;
	} else {
		console.debug('lat lon invalid error')
		return [0, 0]
	}
}

function generateHebCal(latLon) {
	const location = new Location(...latLon, document.querySelector('#inIL').checked);
	const options = {
		year: new Date().getFullYear(),
		isHebrewYear: false,
		candlelighting: true,
		location,
		addHebrewDates: true,
		addHebrewDatesForEvents: true,
	};

	const events = HebrewCalendar.calendar(options).map(ev => {
		const {
			desc,
			eventTime,
			startEvent,
			endEvent,
		} = ev;

		const zman = new Zmanim(ev.date, ...latLon.map(Number))

		let output = {
			greg: ev?.date?.greg(),
			desc,
			eventTime,
			startEvent: startEvent?.eventTime || zman.gregEve(),
			endEvent: endEvent?.eventTime || zman.shkiah(),
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
	return JSON.parse(JSON.stringify(events))
}