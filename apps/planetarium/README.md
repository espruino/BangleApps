# Planetarium

This planetarium takes your position and time and plots the sky as it is.

No planets, or moon, only stars. It can show the 500 most brilliant stars in the sky. 

Plan is to show also constellations, but this is work in progress. Now it shows Taurus and Orion as examples.

I think code is quite optimized already. It runs as fast as I could make it run. If someone has some ideas to speed it up, I could plot more stars.

Basic equations to compute declination and right ascension for stars where taken from this [github repo](https://github.com/Michi83/planetarium). Thanks!

## How to use
The planetarium plots the stars as if you are looking to the sky (with your watch screen pointing downwards). This means, if you have the watch in your wrist, you have to look south to see the stars matching. If you want to look north, just take out the watch from your wrist and make a 180º turn.

## Improvements
I plan to add more constellations as soon as I have time. I am adding the constellations that I know of, but the plan is to add all the main ones (at least for North Hemisphere). 

Please note that the watch hardware is limited and computing the stars positions is a quite intensive task for this little processor. This is why it plots only stars and no planets or the moon. For plotting the planets, storage will be a limiting factor as well as computing the position for planets needs more initial data compared with stars.