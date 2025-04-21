# Umpire Ball Counter
*Cricket umpire ball counter and match event logger for Bangle.js 2 hackable smart watch*
## Background
There are a few ways to keep track of balls when umpiring a cricket match. These vary from the rudimentary - having some stones in your pockets and transferring them from one side to the other - to the "modern" umpire's clicker. The latter allows you to track fairly delivered balls, overs completed and wickets fallen.

In addition, the umpire needs to know the time and to record particular events like when "Play" was called or when a fielder left the field. These events are written down on paper.

Of note is that umpires do not keep score, and to try and keep score is considered detrimental to achieving the umpire's other duties on the field.

The purchase of my watch and the building of this app were a direct result of wanting to improve on the "modern" clicker whilst making post-match reports easier to write for myself as an aspiring umpire.

## Objectives ##

The app aims to achieve three broad objectives:
1. Count how many balls and wickets have been logged, and show the current over number and time of day.
2. Log these and other events with a timestamp, and a duration since the last timestamp.
3. Allow the data logged to be viewed on the watch and on a BLE-paired mobile device as structured data.

## Modules ##

The app is split into three screens shown to the umpire on the watch:
1. Main Menu
2. In-play Screen
3. Log viewer

