# Planetarium

This planetarium takes your position and time and plots the sky as it is.

No planets, or moon, only stars. It can show the 500 most brilliant stars in the sky. 

It shows also constellations. Now it has 20 constellations but this is work in progress. Only northern hemisphere covered now.

I think code is quite optimized already. It runs as fast as I could make it run. If someone has some ideas to speed it up, I could plot more stars.

Basic equations to compute declination and right ascension for stars where taken from this [github repo](https://github.com/Michi83/planetarium). Thanks!

## How to use
The planetarium plots the stars as if you are looking to the sky (with your watch screen pointing downwards). This means, if you have the watch in your wrist, you have to look south to see the stars matching. If you want to look north, just take out the watch from your wrist and make a 180º turn.

## Improvements
I plan to add more constellations as soon as I have time. I am adding the constellations that I know of, but the plan is to add all the main ones (at least for North Hemisphere). 

Please note that the watch hardware is limited and computing the stars positions is a quite intensive task for this little processor. This is why it plots only stars and no planets or the moon. For plotting the planets, storage will be a limiting factor as well as computing the position for planets needs more initial data compared with stars.

## Do you want to contribute?
Maybe you want to add some more constellations to the planetarium. As you can see I didn't cover constellations in the south hemisphere. How to do it? It is a bit tedious but it can be done and you will learn the constellations pretty well at the end of it. Steps:
- Open the file `plantearium.data.csv`. There you have the 500 stars that we have in the planetarium. The number of each star is the line number. For instance for Sirius, the star number will be 1.
- Find the two stars that you want to join in your constellation (a constellation line). For identifying a star you have to have a look at the name, usually something like `AL UMA` (alpha star of constellation ursa major). Lets say that you want to join stars 155 and 8 (this is constellation canis menor, that only has a line joining two stars).
- Go to file `planetarium.const.csv` and add two lines for your new constellation. The first one will be the name of the constellation, the second one the pair of stars that you want to join, separated by coma (see the file for examples).
- Do not forget to add a break line after the last constellation.
- Upload the new `planetarium.const.csv` to your bangle (or emulator) and test it out.

What is a constellation star is not in the 500 star list in `planetarium.data.csv`? If you need another star to draw the constellation you can find that star in the full star list (`starinfo/planetarium.stars.csv`) and put it in `planetarium.extra.csv`. That stars will be loaded only when constellations are shown. In order to refer to these extra stars in the `planetarium.const.csv` you have to use the code `e_linenumber`, in order to differentiate them from the stars in the normal file. For instance, to refer to the first star in the file `planetarium.extra.csv`, you will refer it as `e_1`. Do not forget to add an extra line at the end as in the other files.

## Development version
Please check the latest development version [here](https://github.com/pglez82/BangleApps)
