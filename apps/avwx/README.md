# AVWX Module

This is a module/library to use the [AVWX](https://account.avwx.rest/) Aviation
Weather API. It doesn't include an app.


## Configuration

You will need an AVWX account (see above for link) and generate an API token.
The free "Hobby" plan is normally sufficient, but please consider supporting
the AVWX project.

After installing the module on your Bangle, use the "interface" page (floppy
disk icon) in the App Loader to set the API token.


## Usage

Include the module in your app with:

	const avwx = require('avwx');

Then use the exported function, for example to get the "sanitized" METAR from
the nearest station to a lat/lon coordinate pair:

	reqID = avwx.request('metar/'+lat+','+lon,
	                     'filter=sanitized&onfail=nearest',
	                     data => { console.log(data); },
	                     error => { console.log(error); });

The returned reqID can be useful to track whether a request has already been
made (ie. the app is still waiting on a response).

Please consult the [AVWX documentation](https://avwx.docs.apiary.io/) for
information about the available end-points and request parameters.


## Author

Flaparoo [github](https://github.com/flaparoo)

