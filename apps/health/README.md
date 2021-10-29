# Health Tracking

Logs health data to a file every 10 minutes, and provides an app to view it

**BETA - requires firmware 2v11**

## Usage

Once installed, health data is logged automatically.

To view data, run the `Health` app from your watch.

## Features

Stores:

* Heart rate (TODO)
* Step count
* Movement

## Technical Info

Once installed, the `health.boot.js` hooks onto the `Bangle.health` event and
writes data to a binary file (one per month).

A library (that can be used with `require("health").readXYZ` can then be used
to grab historical health info.

## TODO

* `interface` page for desktop to allow data to be viewed and exported in common formats
* More features in app:
  * Step counting goal (ensure pedometers use this)
  * Calendar view showing steps per day
  * Yearly view
  * Heart rate 'zone' graph
  * .. other
