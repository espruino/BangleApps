import { HebrewCalendar, HDate, Location, Event } from 'https://cdn.skypack.dev/@hebcal/core';

document.querySelector("button[type=submit]").addEventListener("click", function(event) {
         event.preventDefault();
         getLatLonFromForm();


         const options = {
			year: new Date().getFullYear(),
			isHebrewYear: false,
			candlelighting: true,
			location: new Location(...getLatLonFromForm(), document.querySelector('#inIL').checked),
			sedrot: true,
			omer: true,
		};
		const events = HebrewCalendar.calendar(options);

		console.table(events)
		console.log(options)
}, false);

document.querySelector('#hDate').innerText = `Today is ${new HDate().toString()}`;

function getLatLonFromForm() {
	const elements = [document.querySelector('#lat'), document.querySelector('#lon')];
	const latLon = elements.map(el => el.value);
	console.debug(latLon);
    if(elements.every(x => x.checkValidity())) {
    	console.debug('lat lon all good')
    	return latLon;
    } else {
    	console.debug('lat lon invalid error')
    	return [0,0]
    }
}